-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Create Clients Table
CREATE TABLE IF NOT EXISTS Clients (
    client_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Accounts Table
CREATE TABLE IF NOT EXISTS Accounts (
    account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    account_number TEXT UNIQUE NOT NULL,
    account_type TEXT NOT NULL CHECK(account_type IN ('Savings', 'Checking', 'Investment', 'Loan')),
    currency TEXT NOT NULL DEFAULT 'CHF',
    balance REAL DEFAULT 0.0,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES Clients (client_id) ON DELETE CASCADE
);

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS Transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('Deposit', 'Withdrawal', 'Transfer_Out', 'Transfer_In', 'Fee', 'Interest', 'Dividend', 'Buy_Asset', 'Sell_Asset')),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    amount REAL NOT NULL, -- Positive for credits, negative for debits
    related_account_number TEXT, -- For transfers
    asset_details TEXT, -- e.g., '10 shares of XYZ stock @ 50.00 CHF'
    FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);

-- Insert Sample Clients
-- Note: We assume client_id 1 will be Alice, 2 will be Bob
INSERT INTO Clients (first_name, last_name, email, phone, address) VALUES
    ('Alice', 'Smith', 'alice.s@email.com', '0791234567', 'Main St 1, Zurich'),
    ('Bob', 'Miller', 'bob.m@email.com', '0789876543', 'Side St 2, Geneva');

-- Insert Sample Accounts
-- Note: We assume account_ids 1, 2, 3 for Alice; 4 for Bob
INSERT INTO Accounts (client_id, account_number, account_type, currency, balance) VALUES
    (1, 'CH930000000000000001A', 'Checking', 'CHF', 5000.00),
    (1, 'CH930000000000000002B', 'Savings', 'CHF', 15000.00),
    (1, 'CH930000000000000003C', 'Investment', 'CHF', 25000.00),
    (2, 'CH930000000000000004D', 'Checking', 'EUR', 8000.00);

-- Insert Sample Transactions
-- Note: Using assumed account_ids (1=Alice Checking, 2=Alice Savings, 3=Alice Investment, 4=Bob Checking)
INSERT INTO Transactions (account_id, transaction_type, transaction_date, description, amount, related_account_number, asset_details) VALUES
    -- Alice Checking (account_id 1)
    (1, 'Deposit', '2025-04-01 09:00:00', 'Salary April', 4500.00, NULL, NULL),
    (1, 'Withdrawal', '2025-04-02 14:30:00', 'ATM Withdrawal', -200.00, NULL, NULL),
    (1, 'Transfer_Out', '2025-04-05 10:00:00', 'Transfer to Savings', -1000.00, 'CH930000000000000002B', NULL),
    (1, 'Fee', '2025-04-10 23:59:59', 'Monthly Account Fee', -5.00, NULL, NULL),
    -- Alice Savings (account_id 2)
    (2, 'Transfer_In', '2025-04-05 10:00:05', 'Transfer from Checking', 1000.00, 'CH930000000000000001A', NULL),
    (2, 'Interest', '2025-04-11 00:00:00', 'Monthly Interest', 12.50, NULL, NULL),
    -- Alice Investment (account_id 3)
    (3, 'Buy_Asset', '2025-04-08 15:00:00', 'Purchase Roche Shares', -10000.00, NULL, '30 shares ROG @ 333.33 CHF'),
    (3, 'Dividend', '2025-04-09 10:00:00', 'Dividend Roche Holding', 150.00, NULL, 'ROG Dividend'),
    -- Bob Checking (account_id 4)
    (4, 'Deposit', '2025-04-03 11:00:00', 'Initial Deposit', 8000.00, NULL, NULL),
    (4, 'Withdrawal', '2025-04-07 16:00:00', 'Cash Withdrawal', -500.00, NULL, NULL);


-- Products

-- Existing tables for product categories and products:

CREATE TABLE product_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    react_icon TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

-- Documents table: Each product can have multiple connected documents.
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Existing Insertions for product categories and products (including Packages):

INSERT INTO product_categories (name, color) VALUES ('Credit', '#e74c3c');                -- Group 1: Red-ish
INSERT INTO product_categories (name, color) VALUES ('Investment Solutions', '#3498db');   -- Group 2: Blue
INSERT INTO product_categories (name, color) VALUES ('Investment Products', '#2ecc71');    -- Group 3: Green
INSERT INTO product_categories (name, color) VALUES ('Investment Themes', '#f39c12');      -- Group 4: Orange
INSERT INTO product_categories (name, color) VALUES ('Mortgage', '#9b59b6');               -- Group 5: Purple
INSERT INTO product_categories (name, color) VALUES ('Investment Advice', '#1abc9c');       -- Group 6: Turquoise
INSERT INTO product_categories (name, color) VALUES ('Pension Products', '#f1c40f');        -- Group 7: Yellow
INSERT INTO product_categories (name, color) VALUES ('Raiffeisen Insurances', '#34495e');   -- Group 8: Dark Blue/Grey
INSERT INTO product_categories (name, color) VALUES ('Credit and Debit Cards', '#16a085');   -- Group 9: Teal
INSERT INTO product_categories (name, color) VALUES ('Packages', '#d35400');               -- Group 10: Orange-red

-- Group 1: Credit
INSERT INTO products (category_id, name, react_icon) VALUES (1, 'Lombard Loan', 'FaHandHoldingUsd');
INSERT INTO products (category_id, name, react_icon) VALUES (1, 'Private or Automotive Loan', 'FaCar');

-- Group 2: Investment Solutions
INSERT INTO products (category_id, name, react_icon) VALUES (2, 'Wealth Management Mandate', 'FaBriefcase');
INSERT INTO products (category_id, name, react_icon) VALUES (2, 'Raiffeisen Rio', 'FaWater');
INSERT INTO products (category_id, name, react_icon) VALUES (2, 'Advisory Mandate', 'FaComments');
INSERT INTO products (category_id, name, react_icon) VALUES (2, 'Investment Fund Savings Plan', 'FaPiggyBank');
INSERT INTO products (category_id, name, react_icon) VALUES (2, 'Securities Deposit', 'FaRegFileAlt');

-- Group 3: Investment Products
INSERT INTO products (category_id, name, react_icon) VALUES (3, 'Investment Funds', 'FaChartPie');
INSERT INTO products (category_id, name, react_icon) VALUES (3, 'Structured Products', 'FaCubes');
INSERT INTO products (category_id, name, react_icon) VALUES (3, 'Currency Instruments', 'FaExchangeAlt');
INSERT INTO products (category_id, name, react_icon) VALUES (3, 'Precious Metals', 'FaGem');
INSERT INTO products (category_id, name, react_icon) VALUES (3, 'Additional Tier 1 Loan', 'FaHandshake');
INSERT INTO products (category_id, name, react_icon) VALUES (3, 'Term Investment', 'FaClock');

-- Group 4: Investment Themes
INSERT INTO products (category_id, name, react_icon) VALUES (4, 'Tech Innovators', 'FaLaptop');
INSERT INTO products (category_id, name, react_icon) VALUES (4, 'Smart Healthcare', 'FaHeartbeat');
INSERT INTO products (category_id, name, react_icon) VALUES (4, 'Aqua', 'FaTint');
INSERT INTO products (category_id, name, react_icon) VALUES (4, 'Green Energy', 'FaLeaf');
INSERT INTO products (category_id, name, react_icon) VALUES (4, 'Top Swiss Pick', 'FaStar');

-- Group 5: Mortgage
INSERT INTO products (category_id, name, react_icon) VALUES (5, 'Fixed Rate Mortgage', 'FaLock');
INSERT INTO products (category_id, name, react_icon) VALUES (5, 'SARON Flex Mortgage', 'FaSyncAlt');
INSERT INTO products (category_id, name, react_icon) VALUES (5, 'Variable Rate Mortgage', 'FaPercentage');

-- Group 6: Investment Advice
INSERT INTO products (category_id, name, react_icon) VALUES (6, 'Retirement and Insurance Advice', 'FaUserTie');
INSERT INTO products (category_id, name, react_icon) VALUES (6, 'Retirement Planning Advice', 'FaRegCalendarAlt');
INSERT INTO products (category_id, name, react_icon) VALUES (6, 'Succession Advice and Mandate for Incapacity', 'FaBalanceScaleLeft');
INSERT INTO products (category_id, name, react_icon) VALUES (6, 'Retirement and Investment Advice', 'FaChartLine');

-- Group 7: Pension Products
INSERT INTO products (category_id, name, react_icon) VALUES (7, 'Pillar 3a Account', 'FaWallet');
INSERT INTO products (category_id, name, react_icon) VALUES (7, 'Pension Funds', 'FaUniversity');
INSERT INTO products (category_id, name, react_icon) VALUES (7, 'Digital Pillar 3a', 'FaMobileAlt');
INSERT INTO products (category_id, name, react_icon) VALUES (7, 'Prevision Investment Fund Savings Plan', 'FaRegChartBar');
INSERT INTO products (category_id, name, react_icon) VALUES (7, 'Savings Goals Coverage', 'FaBullseye');

-- Group 8: Raiffeisen Insurances
INSERT INTO products (category_id, name, react_icon) VALUES (8, 'Amortization Insurance', 'FaRegCreditCard');
INSERT INTO products (category_id, name, react_icon) VALUES (8, 'Household Insurance', 'FaHome');
INSERT INTO products (category_id, name, react_icon) VALUES (8, 'Death Insurance', 'FaSkull');
INSERT INTO products (category_id, name, react_icon) VALUES (8, 'Income Disability Pension', 'FaHospital');
INSERT INTO products (category_id, name, react_icon) VALUES (8, 'Capital Life Insurance', 'FaHeart');
INSERT INTO products (category_id, name, react_icon) VALUES (8, 'Home Insurance', 'FaShieldAlt');

-- Group 9: Credit and Debit Cards
INSERT INTO products (category_id, name, react_icon) VALUES (9, 'Debit Card (Visa/Mastercard)', 'FaCreditCard');
INSERT INTO products (category_id, name, react_icon) VALUES (9, 'Standard Credit Card (Visa/Mastercard - 1 Year Free)', 'FaCcVisa');
INSERT INTO products (category_id, name, react_icon) VALUES (9, 'Gold Credit Card (No Fees for EUR/USD & Worldwide Replacement)', 'FaCcMastercard');

-- Group 10: Packages
INSERT INTO products (category_id, name, description, react_icon) VALUES (
    10,
    'YoungMemberPlus',
    'For individuals under 26 years old',
    'FaChild'
);
INSERT INTO products (category_id, name, description, react_icon) VALUES (
    10,
    'Essential',
    'A monthly fee of CHF 9 is charged if the following condition is not met: A regular income entry (e.g., salary or pension) of at least CHF 1,260, or mortgage/savings/deposit or retirement capital of at least CHF 20,000. The condition must be met for at least three consecutive months and then continuously. The reference date for taxation is November 30.',
    'FaInfoCircle'
);
INSERT INTO products (category_id, name, description, react_icon) VALUES (
    10,
    'Member',
    'Preferred interest rate on savings account plus share of Raiffeisen',
    'FaUser'
);
INSERT INTO products (category_id, name, description, react_icon) VALUES (
    10,
    'Member Plus',
    'Preferred interest rate on savings account plus free concert and museum tickets',
    'FaCrown'
);

-- Insert a document for the "Essential" product.
-- This example uses a subquery to find the product id for "Essential"
INSERT INTO documents (product_id, url)
VALUES (
    (SELECT id FROM products WHERE name = 'Essential'),
    'https://www.raiffeisen.ch/content/dam/www/rch/pdf/produkte/zahlen/fr/compte-prive-fiche-produit.pdf'
);
