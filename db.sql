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
