-- Drop existing policies first
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON order_items;

-- Create more permissive policies for development
-- Products policies
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON products
    FOR DELETE USING (true);

-- Customers policies
CREATE POLICY "Enable read access for all users" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON customers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON customers
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON customers
    FOR DELETE USING (true);

-- Orders policies
CREATE POLICY "Enable read access for all users" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON orders
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON orders
    FOR DELETE USING (true);

-- Order items policies
CREATE POLICY "Enable read access for all users" ON order_items
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON order_items
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON order_items
    FOR DELETE USING (true);
