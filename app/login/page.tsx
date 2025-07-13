"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ShoppingCart, Mail, Shield, User } from "lucide-react"

// Schema for traditional email/password login
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

// Schema for passwordless OTP login
const otpLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
})

// Schema for passwordless signup (email and full name only)
const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
})

// Schema for OTP verification (for both login and signup)
const otpVerifySchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
})

type LoginForm = z.infer<typeof loginSchema>
type OtpLoginForm = z.infer<typeof otpLoginSchema>
type SignupForm = z.infer<typeof signupSchema>
type OtpVerifyForm = z.infer<typeof otpVerifySchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpSentForLogin, setOtpSentForLogin] = useState(false) // State for passwordless login OTP
  const [otpEmailForLogin, setOtpEmailForLogin] = useState("") // Email for passwordless login OTP
  const [signupStep, setSignupStep] = useState<"input" | "otp_verify">("input") // State for signup flow
  const [signupEmailForOtp, setSignupEmailForOtp] = useState("") // Email for signup OTP
  const { toast } = useToast()
  const router = useRouter()

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const otpLoginForm = useForm<OtpLoginForm>({
    resolver: zodResolver(otpLoginSchema),
    defaultValues: { email: "" },
  })

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", fullName: "" },
  })

  const otpVerifyForm = useForm<OtpVerifyForm>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { otp: "" },
  })

  // Handle traditional email/password login
  const handleLogin = async (data: LoginForm) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      toast({
        title: "Login Successful",
        description: "Welcome back to POS System!",
      })

      router.push("/")
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle sending OTP for passwordless login
  const handleSendOtpLogin = async (data: OtpLoginForm) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: false, // Only send OTP to existing users
        },
      })

      if (error) throw error

      setOtpEmailForLogin(data.email)
      setOtpSentForLogin(true)
      toast({
        title: "OTP Sent",
        description: "Please check your email for the 6-digit verification code.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Failed to send verification code. Make sure your email is registered.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle verifying OTP for passwordless login
  const handleVerifyOtpLogin = async (data: OtpVerifyForm) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: otpEmailForLogin,
        token: data.otp,
        type: "email",
      })

      if (error) throw error

      toast({
        title: "Login Successful",
        description: "Welcome back to POS System!",
      })

      router.push("/")
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle passwordless signup (sends OTP for email verification)
  const handleSignup = async (data: SignupForm) => {
    setLoading(true)
    try {
      // Attempt to sign up the user.
      // If the email already exists, Supabase will return an error.
      // IMPORTANT: For OTP-based signup, ensure "Email Confirm" is DISABLED in Supabase Auth Settings.
      // If "Email Confirm" is enabled, Supabase will send a confirmation LINK for `signUp`, which conflicts with OTP verification.
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          data: {
            full_name: data.fullName,
          },
          shouldCreateUser: true, // Always try to create user
        },
      })

      if (error) {
        // Check for specific error messages indicating email already exists
        if (
          error.message.includes("User already registered") ||
          error.message.includes("already exists") ||
          error.message.includes("duplicate key value violates unique constraint") // Added for more robust check
        ) {
          toast({
            title: "Signup Failed",
            description: "This email is already registered. Please try logging in instead.",
            variant: "destructive",
          })
        } else {
          // For any other error during signup, re-throw it
          throw error
        }
      } else {
        // If no error, OTP was successfully sent (for a new user)
        setSignupEmailForOtp(data.email)
        setSignupStep("otp_verify")
        toast({
          title: "Verification Code Sent",
          description: "Please check your email for the 6-digit verification code to complete your signup.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle verifying OTP for signup
  const handleVerifySignupOtp = async (data: OtpVerifyForm) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: signupEmailForOtp,
        token: data.otp,
        type: "email", // Use 'email' type for initial signup verification
      })

      if (error) throw error

      toast({
        title: "Account Created & Verified",
        description: "Your account has been successfully created and verified. Welcome!",
      })

      router.push("/")
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetOtpLoginState = () => {
    setOtpSentForLogin(false)
    setOtpEmailForLogin("")
    otpLoginForm.reset()
    otpVerifyForm.reset()
  }

  const resetSignupState = () => {
    setSignupStep("input")
    setSignupEmailForOtp("")
    signupForm.reset()
    otpVerifyForm.reset()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-xl border border-border">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingCart className="h-9 w-9 text-primary" />
            <h1 className="text-3xl font-extrabold text-foreground">POS System</h1>
          </div>
          <CardTitle className="text-3xl font-extrabold text-foreground">Welcome</CardTitle>
          <CardDescription className="text-muted-foreground mt-2 text-base">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 mb-6 bg-muted rounded-lg shadow-inner">
              {" "}
              {/* Changed grid-cols-3 to grid-cols-2 */}
              <TabsTrigger
                value="login"
                className="text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:rounded-lg transition-all duration-300 ease-in-out"
              >
                Login
              </TabsTrigger>
              {/* Passwordless Login (OTP) - Commented out */}
              {/*
              <TabsTrigger
                value="otp-login"
                className="text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:rounded-lg transition-all duration-300 ease-in-out"
              >
                Passwordless Login
              </TabsTrigger>
              */}
              <TabsTrigger
                value="signup"
                className="text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:rounded-lg transition-all duration-300 ease-in-out"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Password Login */}
            <TabsContent value="login" className="pt-4">
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                <div>
                  <Label htmlFor="login-email" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="admin@example.com"
                      {...loginForm.register("email")}
                      className="h-11 pl-10 pr-4 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="login-password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...loginForm.register("password")}
                      className="h-11 pl-10 pr-10 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            {/* Passwordless OTP Login - Commented out */}
            {/*
            <TabsContent value="otp-login" className="pt-4">
              {!otpSentForLogin ? (
                <form onSubmit={otpLoginForm.handleSubmit(handleSendOtpLogin)} className="space-y-5">
                  <div className="text-center mb-4">
                    <Mail className="h-14 w-14 text-primary mx-auto mb-2" />
                    <p className="text-base text-muted-foreground">Enter your email to receive a verification code</p>
                  </div>

                  <div>
                    <Label htmlFor="otp-email" className="text-sm font-medium text-foreground">
                      Email
                    </Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp-email"
                        type="email"
                        placeholder="admin@example.com"
                        {...otpLoginForm.register("email")}
                        className="h-11 pl-10 pr-4 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>
                    {otpLoginForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{otpLoginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Send Verification Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={otpVerifyForm.handleSubmit(handleVerifyOtpLogin)} className="space-y-5">
                  <div className="text-center mb-4">
                    <Shield className="h-14 w-14 text-green-600 mx-auto mb-2" />
                    <p className="text-base text-muted-foreground">
                      We sent a 6-digit code to <strong className="text-foreground">{otpEmailForLogin}</strong>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="verify-otp-email" className="text-sm font-medium text-foreground">
                      Email
                    </Label>
                    <Input
                      id="verify-otp-email"
                      type="email"
                      defaultValue={otpEmailForLogin}
                      readOnly
                      className="mt-2 h-11 px-4 rounded-md border border-input bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <Label htmlFor="otp-code" className="text-sm font-medium text-foreground">
                      Verification Code
                    </Label>
                    <Input
                      id="otp-code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      {...otpVerifyForm.register("otp")}
                      className="mt-2 h-11 px-4 rounded-md border border-input text-center text-lg tracking-widest focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    />
                    {otpVerifyForm.formState.errors.otp && (
                      <p className="text-sm text-destructive mt-1">{otpVerifyForm.formState.errors.otp.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </Button>

                  <div className="flex gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetOtpLoginState}
                      className="flex-1 h-11 text-base font-semibold rounded-md bg-transparent border border-input hover:bg-accent hover:text-accent-foreground"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleSendOtpLogin({ email: otpEmailForLogin })}
                      className="flex-1 h-11 text-base font-semibold rounded-md text-primary hover:bg-primary/10"
                      disabled={loading}
                    >
                      Resend Code
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
            */}

            {/* Sign Up (Passwordless with OTP Verification) */}
            <TabsContent value="signup" className="pt-4">
              {signupStep === "input" ? (
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-5">
                  <div className="text-center mb-4">
                    <Mail className="h-14 w-14 text-primary mx-auto mb-2" />
                    <p className="text-base text-muted-foreground">
                      Sign up with your email. A verification code will be sent.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="signup-name" className="text-sm font-medium text-foreground">
                      Full Name
                    </Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        {...signupForm.register("fullName")}
                        className="h-11 pl-10 pr-4 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>
                    {signupForm.formState.errors.fullName && (
                      <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                      Email
                    </Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="admin@example.com"
                        {...signupForm.register("email")}
                        className="h-11 pl-10 pr-4 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>
                    {signupForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                    disabled={loading}
                  >
                    {loading ? "Sending Code..." : "Sign Up & Send Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={otpVerifyForm.handleSubmit(handleVerifySignupOtp)} className="space-y-5">
                  <div className="text-center mb-4">
                    <Shield className="h-14 w-14 text-green-600 mx-auto mb-2" />
                    <p className="text-base text-muted-foreground">
                      We sent a 6-digit code to <strong className="text-foreground">{signupEmailForOtp}</strong> to
                      verify your email.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="verify-signup-email" className="text-sm font-medium text-foreground">
                      Email
                    </Label>
                    <Input
                      id="verify-signup-email"
                      type="email"
                      defaultValue={signupEmailForOtp}
                      readOnly
                      className="mt-2 h-11 px-4 rounded-md border border-input bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-otp-code" className="text-sm font-medium text-foreground">
                      Verification Code
                    </Label>
                    <Input
                      id="signup-otp-code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      {...otpVerifyForm.register("otp")}
                      className="mt-2 h-11 px-4 rounded-md border border-input text-center text-lg tracking-widest focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    />
                    {otpVerifyForm.formState.errors.otp && (
                      <p className="text-sm text-destructive mt-1">{otpVerifyForm.formState.errors.otp.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify Account"}
                  </Button>

                  <div className="flex gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetSignupState}
                      className="flex-1 h-11 text-base font-semibold rounded-md bg-transparent border border-input hover:bg-accent hover:text-accent-foreground"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        handleSignup({ email: signupEmailForOtp, fullName: signupForm.getValues("fullName") })
                      }
                      className="flex-1 h-11 text-base font-semibold rounded-md text-primary hover:bg-primary/10"
                      disabled={loading}
                    >
                      Resend Code
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
