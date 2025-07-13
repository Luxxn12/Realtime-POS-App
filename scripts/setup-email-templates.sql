-- This script shows the email templates that should be configured in Supabase Auth
-- Go to Authentication > Email Templates in your Supabase dashboard and update these templates

-- IMPORTANT: For OTP-based signup and passwordless login, ensure "Email Confirm" is DISABLED in Supabase Auth Settings.
-- If "Email Confirm" is enabled, Supabase will send a confirmation LINK for `signUp`, which conflicts with OTP verification.

-- 1. Confirm signup template (NOT USED FOR OTP SIGNUP, but good to have for other flows)
-- Subject: Confirm your signup for POS System
-- Template:
/*
<h2>Welcome to POS System!</h2>
<p>Thank you for signing up. Please click the link below to verify your email address and activate your account:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
<p>If you didn't create an account with us, please ignore this email.</p>
<p>This link will expire in 24 hours.</p>
<br>
<p>Best regards,<br>POS System Team</p>
*/

-- 2. Magic Link template (USED FOR BOTH PASSWORDLESS LOGIN AND OTP SIGNUP VERIFICATION)
-- Subject: Your POS System verification code
-- Template:
/*
<h2>Your Verification Code</h2>
<p>Use this code to verify your email or sign in to your POS System account:</p>
<h1 style="font-size: 32px; font-weight: bold; text-align: center; color: #2563eb; letter-spacing: 4px; margin: 20px 0;">{{ .Token }}</h1>
<p>This code will expire in 10 minutes.</p>
<p>If you didn't request this code, please ignore this email.</p>
<br>
<p>Best regards,<br>POS System Team</p>
*/

-- 3. Recovery template (for password reset)
-- Subject: Reset your POS System password
-- Template:
/*
<h2>Reset Your Password</h2>
<p>You requested to reset your password for your POS System account.</p>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
<p>This link will expire in 1 hour.</p>
<br>
<p>Best regards,<br>POS System Team</p>
*/
