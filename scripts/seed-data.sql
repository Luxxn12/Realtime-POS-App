-- Seed data for the POS system

-- Insert sample products
INSERT INTO products (name, price, category, stock, barcode) VALUES
('Coffee Beans Premium', 15.99, 'Beverages', 50, '1234567890123'),
('Chocolate Croissant', 3.50, 'Bakery', 25, '1234567890124'),
('Organic Tea', 8.99, 'Beverages', 30, '1234567890125'),
('Sandwich Combo', 12.99, 'Food', 15, '1234567890126'),
('Fresh Juice', 4.99, 'Beverages', 8, '1234567890127'),
('Muffin Blueberry', 2.99, 'Bakery', 20, '1234567890128'),
('Energy Drink', 3.99, 'Beverages', 35, '1234567890129'),
('Caesar Salad', 9.99, 'Food', 12, '1234567890130'),
('Bagel with Cream Cheese', 4.50, 'Bakery', 18, '1234567890131'),
('Protein Bar', 2.49, 'Snacks', 40, '1234567890132');

-- Insert sample customers
INSERT INTO customers (name, email, phone, total_orders, total_spent, status) VALUES
('John Doe', 'john.doe@email.com', '+1234567890', 15, 450.75, 'active'),
('Jane Smith', 'jane.smith@email.com', '+1234567891', 8, 220.50, 'active'),
('Bob Johnson', 'bob.johnson@email.com', '+1234567892', 3, 89.25, 'inactive'),
('Alice Brown', 'alice.brown@email.com', '+1234567893', 22, 680.00, 'active'),
('Charlie Wilson', 'charlie.wilson@email.com', '+1234567894', 5, 125.75, 'active');

-- Insert sample orders
INSERT INTO orders (customer_id, total_amount, tax_amount, payment_method, payment_status) VALUES
((SELECT id FROM customers WHERE email = 'john.doe@email.com'), 25.48, 2.32, 'card', 'completed'),
((SELECT id FROM customers WHERE email = 'jane.smith@email.com'), 18.99, 1.73, 'cash', 'completed'),
((SELECT id FROM customers WHERE email = 'bob.johnson@email.com'), 12.99, 1.18, 'digital', 'completed');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
SELECT 
    o.id,
    p.id,
    2,
    p.price,
    p.price * 2
FROM orders o
CROSS JOIN products p
WHERE o.total_amount = 25.48 AND p.name = 'Coffee Beans Premium'
LIMIT 1;

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
SELECT 
    o.id,
    p.id,
    1,
    p.price,
    p.price
FROM orders o
CROSS JOIN products p
WHERE o.total_amount = 18.99 AND p.name = 'Sandwich Combo'
LIMIT 1;
