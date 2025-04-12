-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- --- Create Core Tables (IF NOT EXISTS) ---

CREATE TABLE IF NOT EXISTS Clients (
    client_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    client_identifier TEXT UNIQUE, -- e.g., 111.111.111.1
    membership_number TEXT UNIQUE,
    full_name TEXT,
    client_type TEXT CHECK (client_type IN ('Individual', 'Company')),
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Accounts (
    account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    account_number TEXT UNIQUE NOT NULL,
    account_type TEXT NOT NULL CHECK(account_type IN ('Checking', 'Savings', 'Investment', 'Loan', 'Pension', 'Membership', 'Other')),
    currency TEXT NOT NULL DEFAULT 'CHF',
    balance REAL DEFAULT 0.0,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_name TEXT, -- e.g., "Mitglieder Privatkonto"
    asset_category TEXT CHECK(asset_category IN ('Konten', 'Anlagen', 'Vorsorge', 'Mitgliedschaft', 'Kredite', 'Zahlungsmittel')),
    interest_rate REAL,
    rate_margin REAL,
    term_start_date DATE,
    term_end_date DATE,
    cost_basis REAL,
    performance_value REAL,
    performance_percent REAL,
    notes TEXT,
    FOREIGN KEY (client_id) REFERENCES Clients (client_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    transaction_type TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    amount REAL NOT NULL,
    related_account_number TEXT,
    asset_details TEXT,
    running_balance REAL,
    FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);

-- --- Create Supporting Tables for Detailed Schema (IF NOT EXISTS) ---

CREATE TABLE IF NOT EXISTS Holdings (
    holding_id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    security_name TEXT NOT NULL,
    isin TEXT,
    valor TEXT,
    quantity REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CHF',
    current_price REAL,
    current_value REAL,
    cost_basis_total REAL,
    performance_value REAL,
    performance_percent REAL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES Accounts (account_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PaymentMethods (
    payment_method_id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    method_type TEXT NOT NULL CHECK (method_type IN ('TWINT', 'Debit Card', 'Credit Card')),
    provider TEXT DEFAULT 'Raiffeisen',
    name TEXT NOT NULL,
    masked_identifier TEXT,
    expiry_date TEXT, -- Format "MM/YYYY"
    daily_limit REAL,
    monthly_limit REAL,
    currency TEXT NOT NULL DEFAULT 'CHF',
    FOREIGN KEY (client_id) REFERENCES Clients (client_id) ON DELETE CASCADE
);


-- --- Create Product Catalog Tables (IF NOT EXISTS) ---
CREATE TABLE IF NOT EXISTS product_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    react_icon TEXT NOT NULL,
    UNIQUE(category_id, name),
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    UNIQUE(product_id, url),
    FOREIGN KEY (product_id) REFERENCES products(id)
);


-- ##############################################################
-- ### INSERT FULL PETER MUSTER DATA (using detailed schema) ###
-- ##############################################################

-- 1. Insert Client: Peter Muster (Idempotent based on client_identifier)
INSERT INTO Clients (first_name, last_name, client_identifier, membership_number, full_name, client_type, email, phone, address)
VALUES ('Peter', 'Muster', '111.111.111.1', '123.456.789.0', 'Peter Muster', 'Individual', 'peter.muster@email.ch', '+41 79 111 22 33', 'Musterstrasse 1, 9000 St. Gallen')
ON CONFLICT(client_identifier) DO UPDATE SET
    first_name=excluded.first_name,
    last_name=excluded.last_name,
    membership_number=excluded.membership_number,
    full_name=excluded.full_name,
    client_type=excluded.client_type,
    email=excluded.email,
    phone=excluded.phone,
    address=excluded.address;

-- 2. Insert Accounts for Peter Muster (Idempotent using account_number)
-- Using SELECT with WHERE NOT EXISTS to ensure idempotency
INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency)
SELECT c.client_id, 'CH00 0000 0000 0000 0000 1', 'Checking', 'Mitglieder Privatkonto', 'Konten', 13459.10, 'CHF'
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'CH00 0000 0000 0000 0000 1');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency)
SELECT c.client_id, 'CH00 0000 0000 0000 0000 2', 'Savings', 'Mitglieder Sparkonto', 'Konten', 36781.25, 'CHF'
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'CH00 0000 0000 0000 0000 2');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency)
SELECT c.client_id, 'CH00 0000 0000 0000 0000 3', 'Savings', 'Geschenksparkonto "Maya Muster"', 'Konten', 11832.61, 'CHF'
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'CH00 0000 0000 0000 0000 3');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency)
SELECT c.client_id, 'CH00 0000 0000 0000 0000 6', 'Checking', 'Abrechnungskonto Depot', 'Anlagen', 1487.30, 'CHF'
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'CH00 0000 0000 0000 0000 6');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency)
SELECT c.client_id, '123456789A', 'Investment', 'Wertschriftendepot', 'Anlagen', 24444.75, 'CHF'
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = '123456789A');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency, notes)
SELECT c.client_id, 'CH00 0000 0000 0000 0000 7', 'Checking', 'Abrechnungskonto Rio', 'Anlagen', 548.20, 'CHF', NULL
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'CH00 0000 0000 0000 0000 7');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency, notes)
SELECT c.client_id, '123456789B', 'Investment', 'Rio-Depot', 'Anlagen', 12541.10, 'CHF', 'Parent group: Mein Rio 123456.2'
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = '123456789B');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency, notes)
SELECT c.client_id, 'CH00 0000 0000 0000 0000 8', 'Pension', 'Vorsorgekonto 3a', 'Vorsorge', 48510.24, 'CHF', 'Einzahlung: 3500.00 von 6883.00'
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'CH00 0000 0000 0000 0000 8');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency, cost_basis, performance_value, performance_percent, notes)
SELECT c.client_id, '123456789C', 'Pension', 'Vorsorgefonds 3a', 'Vorsorge', 52027.50, 'CHF', 44000.00, 8027.50, 18.24, 'Parent group: Meine Vorsorge 123456.3'
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = '123456789C');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency, notes)
SELECT c.client_id, 'ANTEIL-123.456.789.0', 'Membership', 'Genossenschafts-Anteilschein', 'Mitgliedschaft', 200.00, 'CHF', 'MemberPlus-Kunde'
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'ANTEIL-123.456.789.0');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency, notes)
SELECT c.client_id, 'Z123456789', 'Loan', 'Basiskredit Hypothek', 'Kredite', -800000.00, 'CHF', 'Total genutzter Betrag'
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'Z123456789');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency, interest_rate, term_start_date, term_end_date)
SELECT c.client_id, 'A123456789', 'Loan', 'Festhypothek', 'Kredite', -300000.00, 'CHF', 0.0025, '2022-04-30', '2028-04-30'
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'A123456789');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency, interest_rate, term_start_date, term_end_date)
SELECT c.client_id, 'B123456789', 'Loan', 'Festhypothek', 'Kredite', -300000.00, 'CHF', 0.0025, '2022-04-30', '2028-04-30'
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'B123456789');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency, rate_margin, term_start_date, term_end_date)
SELECT c.client_id, 'C123456789', 'Loan', 'SARON Flex-Hypothek', 'Kredite', -200000.00, 'CHF', 0.008, '2022-04-30', '2028-04-30'
FROM Clients c WHERE c.client_identifier = '111.111.111.1' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'C123456789');


-- 3. Insert Holdings for Peter Muster's Wertschriftendepot (Idempotent using account_id + isin)
INSERT INTO Holdings (account_id, security_name, isin, valor, quantity, current_price, performance_value, performance_percent, currency)
SELECT a.account_id, 'Swiss Re AG - Namenaktie', 'CH0126881561', '12688156', 150, 76.16, -1633.50, -12.51, 'CHF'
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '111.111.111.1' AND a.account_number = '123456789A' AND NOT EXISTS (SELECT 1 FROM Holdings h WHERE h.account_id = a.account_id AND h.isin = 'CH0126881561');
INSERT INTO Holdings (account_id, security_name, isin, valor, quantity, current_price, performance_value, performance_percent, currency)
SELECT a.account_id, 'Zur Rose Group AG - Namenaktie', 'CH0042615283', '4261528', 50, 60.40, -12802.39, -80.91, 'CHF' FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '111.111.111.1' AND a.account_number = '123456789A' AND NOT EXISTS (SELECT 1 FROM Holdings h WHERE h.account_id = a.account_id AND h.isin = 'CH0042615283');
INSERT INTO Holdings (account_id, security_name, isin, valor, quantity, current_price, performance_value, performance_percent, currency)
SELECT a.account_id, 'ABB Ltd - Namenaktie', 'CH0012221716', '1222171', 100, 28.81, 1263.00, 78.06, 'CHF' FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '111.111.111.1' AND a.account_number = '123456789A' AND NOT EXISTS (SELECT 1 FROM Holdings h WHERE h.account_id = a.account_id AND h.isin = 'CH0012221716');
INSERT INTO Holdings (account_id, security_name, isin, valor, quantity, current_price, performance_value, performance_percent, currency)
SELECT a.account_id, 'Novartis AG - Namenaktie', 'CH0012005267', '1200526', 35, 80.45, 1014.49, 56.32, 'CHF' FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '111.111.111.1' AND a.account_number = '123456789A' AND NOT EXISTS (SELECT 1 FROM Holdings h WHERE h.account_id = a.account_id AND h.isin = 'CH0012005267');
INSERT INTO Holdings (account_id, security_name, isin, valor, quantity, current_price, performance_value, performance_percent, currency)
SELECT a.account_id, 'Logitech International SA - Namenaktie', 'CH0025751329', '2575132', 50, 54.96, -721.44, -20.79, 'CHF' FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '111.111.111.1' AND a.account_number = '123456789A' AND NOT EXISTS (SELECT 1 FROM Holdings h WHERE h.account_id = a.account_id AND h.isin = 'CH0025751329');
INSERT INTO Holdings (account_id, security_name, isin, valor, quantity, current_price, performance_value, performance_percent, currency)
SELECT a.account_id, 'Stadler Rail AG - Namenaktie', 'CH0002178181', '217818', 50, 31.12, -664.12, -29.91, 'CHF' FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '111.111.111.1' AND a.account_number = '123456789A' AND NOT EXISTS (SELECT 1 FROM Holdings h WHERE h.account_id = a.account_id AND h.isin = 'CH0002178181');

-- 4. Insert Transactions for Peter Muster's Mitglieder Privatkonto (Idempotent using account_id, date, amount, description)
INSERT INTO Transactions (account_id, transaction_date, description, amount, transaction_type, running_balance)
SELECT a.account_id, '2022-07-06 00:00:00', 'E-Banking Sammellauf aus Einzahlungen', -750.25, 'Transfer_Out', 13459.10
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '111.111.111.1' AND a.account_number = 'CH00 0000 0000 0000 0000 1' AND NOT EXISTS (SELECT 1 FROM Transactions t WHERE t.account_id = a.account_id AND t.transaction_date = '2022-07-06 00:00:00' AND t.amount = -750.25 AND t.description = 'E-Banking Sammellauf aus Einzahlungen');
INSERT INTO Transactions (account_id, transaction_date, description, amount, transaction_type, running_balance)
SELECT a.account_id, '2022-06-05 00:00:00', 'Gutschrift TWINT von Muster Blumen GmbH', 49.80, 'Transfer_In', 14209.35
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '111.111.111.1' AND a.account_number = 'CH00 0000 0000 0000 0000 1' AND NOT EXISTS (SELECT 1 FROM Transactions t WHERE t.account_id = a.account_id AND t.transaction_date = '2022-06-05 00:00:00' AND t.amount = 49.80 AND t.description = 'Gutschrift TWINT von Muster Blumen GmbH');
INSERT INTO Transactions (account_id, transaction_date, description, amount, transaction_type, running_balance)
SELECT a.account_id, '2022-06-04 00:00:00', 'E-Banking Sammellauf aus Einzahlungen', -1650.00, 'Transfer_Out', 14159.55
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '111.111.111.1' AND a.account_number = 'CH00 0000 0000 0000 0000 1' AND NOT EXISTS (SELECT 1 FROM Transactions t WHERE t.account_id = a.account_id AND t.transaction_date = '2022-06-04 00:00:00' AND t.amount = -1650.00 AND t.description = 'E-Banking Sammellauf aus Einzahlungen');
INSERT INTO Transactions (account_id, transaction_date, description, amount, transaction_type, running_balance)
SELECT a.account_id, '2022-06-02 09:10:00', 'Bezug Bancomat Rorschach', -400.00, 'Withdrawal', 15809.55
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '111.111.111.1' AND a.account_number = 'CH00 0000 0000 0000 0000 1' AND NOT EXISTS (SELECT 1 FROM Transactions t WHERE t.account_id = a.account_id AND t.transaction_date = '2022-06-02 09:10:00' AND t.amount = -400.00 AND t.description = 'Bezug Bancomat Rorschach');
INSERT INTO Transactions (account_id, transaction_date, description, amount, transaction_type, running_balance)
SELECT a.account_id, '2022-05-18 00:00:00', 'E-Banking Sammellauf aus Einzahlungen', -3406.15, 'Transfer_Out', 16209.55
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '111.111.111.1' AND a.account_number = 'CH00 0000 0000 0000 0000 1' AND NOT EXISTS (SELECT 1 FROM Transactions t WHERE t.account_id = a.account_id AND t.transaction_date = '2022-05-18 00:00:00' AND t.amount = -3406.15 AND t.description = 'E-Banking Sammellauf aus Einzahlungen');
INSERT INTO Transactions (account_id, transaction_date, description, amount, transaction_type, running_balance)
SELECT a.account_id, '2022-05-02 09:10:00', 'Bezug Bancomat Rorschach', -600.00, 'Withdrawal', 19615.70
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '111.111.111.1' AND a.account_number = 'CH00 0000 0000 0000 0000 1' AND NOT EXISTS (SELECT 1 FROM Transactions t WHERE t.account_id = a.account_id AND t.transaction_date = '2022-05-02 09:10:00' AND t.amount = -600.00 AND t.description = 'Bezug Bancomat Rorschach');
INSERT INTO Transactions (account_id, transaction_date, description, amount, transaction_type, running_balance)
SELECT a.account_id, '2022-04-07 11:04:00', 'Einkauf Metzgerei Müller', -116.00, 'Withdrawal', 20215.70
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '111.111.111.1' AND a.account_number = 'CH00 0000 0000 0000 0000 1' AND NOT EXISTS (SELECT 1 FROM Transactions t WHERE t.account_id = a.account_id AND t.transaction_date = '2022-04-07 11:04:00' AND t.amount = -116.00 AND t.description = 'Einkauf Metzgerei Müller');

-- 5. Insert Payment Methods for Peter Muster (Idempotent using client_id + type + name)
INSERT INTO PaymentMethods (client_id, method_type, name, daily_limit, monthly_limit, currency)
SELECT c.client_id, 'TWINT', 'Raiffeisen TWINT', 3000.00, 5000.00, 'CHF'
FROM Clients c WHERE c.client_identifier = '111.111.111.1'
  AND NOT EXISTS (SELECT 1 FROM PaymentMethods p WHERE p.client_id = c.client_id AND p.method_type = 'TWINT' AND p.name = 'Raiffeisen TWINT');

INSERT INTO PaymentMethods (client_id, method_type, name, masked_identifier, expiry_date, daily_limit, monthly_limit, currency)
SELECT c.client_id, 'Debit Card', 'Debit Mastercard Private', '1111xxxx1111', '04/2025', 5000.00, 10000.00, 'CHF'
FROM Clients c WHERE c.client_identifier = '111.111.111.1'
  AND NOT EXISTS (SELECT 1 FROM PaymentMethods p WHERE p.client_id = c.client_id AND p.method_type = 'Debit Card' AND p.name = 'Debit Mastercard Private');

INSERT INTO PaymentMethods (client_id, method_type, name, masked_identifier, expiry_date, currency)
SELECT c.client_id, 'Credit Card', 'Raiffeisen Mastercard Gold', '2222xxxx2222', '03/2024', 'CHF'
FROM Clients c WHERE c.client_identifier = '111.111.111.1'
  AND NOT EXISTS (SELECT 1 FROM PaymentMethods p WHERE p.client_id = c.client_id AND p.method_type = 'Credit Card' AND p.name = 'Raiffeisen Mastercard Gold');

-- ##############################################################
-- ### INSERT CLIENT 2: Maria Schmidt DATA                   ###
-- ##############################################################

-- 1. Insert Client: Maria Schmidt
INSERT INTO Clients (first_name, last_name, client_identifier, membership_number, full_name, client_type, email, phone, address)
VALUES ('Maria', 'Schmidt', '222.222.222.2', '987.654.321.0', 'Maria Schmidt', 'Individual', 'maria.schmidt@email.com', '+41 78 123 45 67', 'Hauptstrasse 10, 8001 Zürich')
ON CONFLICT(client_identifier) DO UPDATE SET
    first_name=excluded.first_name,
    last_name=excluded.last_name,
    membership_number=excluded.membership_number,
    full_name=excluded.full_name,
    client_type=excluded.client_type,
    email=excluded.email,
    phone=excluded.phone,
    address=excluded.address;

-- 2. Insert Accounts for Maria Schmidt
INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency)
SELECT c.client_id, 'CH11 0000 0000 0000 0001 1', 'Checking', 'Privatkonto', 'Konten', 5234.50, 'CHF'
FROM Clients c WHERE c.client_identifier = '222.222.222.2' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'CH11 0000 0000 0000 0001 1');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency)
SELECT c.client_id, 'CH22 0000 0000 0000 0002 2', 'Savings', 'Sparkonto Plus', 'Konten', 25890.15, 'CHF'
FROM Clients c WHERE c.client_identifier = '222.222.222.2' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'CH22 0000 0000 0000 0002 2');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency)
SELECT c.client_id, 'DEP987654', 'Investment', 'Kleinanlagen Depot', 'Anlagen', 8150.75, 'CHF'
FROM Clients c WHERE c.client_identifier = '222.222.222.2' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'DEP987654');

-- 3. Insert Holdings for Maria Schmidt's Kleinanlagen Depot
INSERT INTO Holdings (account_id, security_name, isin, valor, quantity, current_price, performance_value, performance_percent, currency)
SELECT a.account_id, 'Roche Holding AG - Genussschein', 'CH0012032048', '1203204', 10, 305.50, 255.00, 9.11, 'CHF'
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '222.222.222.2' AND a.account_number = 'DEP987654' AND NOT EXISTS (SELECT 1 FROM Holdings h WHERE h.account_id = a.account_id AND h.isin = 'CH0012032048');

INSERT INTO Holdings (account_id, security_name, isin, valor, quantity, current_price, performance_value, performance_percent, currency)
SELECT a.account_id, 'Nestlé SA - Namenaktie', 'CH0038863350', '3886335', 15, 110.25, -150.00, -8.33, 'CHF'
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '222.222.222.2' AND a.account_number = 'DEP987654' AND NOT EXISTS (SELECT 1 FROM Holdings h WHERE h.account_id = a.account_id AND h.isin = 'CH0038863350');

-- 4. Insert Transactions for Maria Schmidt's Privatkonto
INSERT INTO Transactions (account_id, transaction_date, description, amount, transaction_type, running_balance)
SELECT a.account_id, '2022-07-01 00:00:00', 'Lohnzahlung Juli', 4500.00, 'Transfer_In', 5234.50
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '222.222.222.2' AND a.account_number = 'CH11 0000 0000 0000 0001 1' AND NOT EXISTS (SELECT 1 FROM Transactions t WHERE t.account_id = a.account_id AND t.transaction_date = '2022-07-01 00:00:00' AND t.amount = 4500.00 AND t.description = 'Lohnzahlung Juli');

INSERT INTO Transactions (account_id, transaction_date, description, amount, transaction_type, running_balance)
SELECT a.account_id, '2022-06-28 00:00:00', 'Miete Juni', -1800.00, 'Transfer_Out', 734.50
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '222.222.222.2' AND a.account_number = 'CH11 0000 0000 0000 0001 1' AND NOT EXISTS (SELECT 1 FROM Transactions t WHERE t.account_id = a.account_id AND t.transaction_date = '2022-06-28 00:00:00' AND t.amount = -1800.00 AND t.description = 'Miete Juni');

INSERT INTO Transactions (account_id, transaction_date, description, amount, transaction_type, running_balance)
SELECT a.account_id, '2022-06-25 14:30:00', 'Einkauf Coop', -150.30, 'Withdrawal', 2534.50
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '222.222.222.2' AND a.account_number = 'CH11 0000 0000 0000 0001 1' AND NOT EXISTS (SELECT 1 FROM Transactions t WHERE t.account_id = a.account_id AND t.transaction_date = '2022-06-25 14:30:00' AND t.amount = -150.30 AND t.description = 'Einkauf Coop');

-- 5. Insert Payment Methods for Maria Schmidt
INSERT INTO PaymentMethods (client_id, method_type, name, masked_identifier, expiry_date, daily_limit, monthly_limit, currency)
SELECT c.client_id, 'Debit Card', 'Debit Mastercard Private', '3333xxxx3333', '12/2026', 4000.00, 8000.00, 'CHF'
FROM Clients c WHERE c.client_identifier = '222.222.222.2'
  AND NOT EXISTS (SELECT 1 FROM PaymentMethods p WHERE p.client_id = c.client_id AND p.method_type = 'Debit Card' AND p.name = 'Debit Mastercard Private');

INSERT INTO PaymentMethods (client_id, method_type, name, daily_limit, monthly_limit, currency)
SELECT c.client_id, 'TWINT', 'Raiffeisen TWINT', 2500.00, 4000.00, 'CHF'
FROM Clients c WHERE c.client_identifier = '222.222.222.2'
  AND NOT EXISTS (SELECT 1 FROM PaymentMethods p WHERE p.client_id = c.client_id AND p.method_type = 'TWINT' AND p.name = 'Raiffeisen TWINT');


-- ##############################################################
-- ### INSERT CLIENT 3: Tech Solutions GmbH DATA             ###
-- ##############################################################

-- 1. Insert Client: Tech Solutions GmbH
INSERT INTO Clients (full_name, client_identifier, client_type, email, phone, address)
VALUES ('Tech Solutions GmbH', '333.333.333.3', 'Company', 'info@techsolutions.ch', '+41 44 987 65 43', 'Industriestrasse 5, 9000 St. Gallen')
ON CONFLICT(client_identifier) DO UPDATE SET
    full_name=excluded.full_name,
    client_type=excluded.client_type,
    email=excluded.email,
    phone=excluded.phone,
    address=excluded.address;

-- 2. Insert Accounts for Tech Solutions GmbH
INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency)
SELECT c.client_id, 'CH33 0000 0000 0000 0003 3', 'Checking', 'Geschäftskonto', 'Konten', 152345.60, 'CHF'
FROM Clients c WHERE c.client_identifier = '333.333.333.3' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'CH33 0000 0000 0000 0003 3');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency)
SELECT c.client_id, 'CH44 0000 0000 0000 0004 4', 'Savings', 'Reservekonto', 'Konten', 75000.00, 'CHF'
FROM Clients c WHERE c.client_identifier = '333.333.333.3' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'CH44 0000 0000 0000 0004 4');

INSERT INTO Accounts (client_id, account_number, account_type, account_name, asset_category, balance, currency, rate_margin)
SELECT c.client_id, 'CRED456', 'Loan', 'Betriebskredit', 'Kredite', -50000.00, 'CHF', 0.015 -- Example margin
FROM Clients c WHERE c.client_identifier = '333.333.333.3' AND NOT EXISTS (SELECT 1 FROM Accounts WHERE account_number = 'CRED456');

-- 3. Insert Holdings for Tech Solutions GmbH (None in this example)

-- 4. Insert Transactions for Tech Solutions GmbH's Geschäftskonto
INSERT INTO Transactions (account_id, transaction_date, description, amount, transaction_type, running_balance)
SELECT a.account_id, '2022-07-05 00:00:00', 'Zahlungseingang Kunde ABC AG', 15000.00, 'Transfer_In', 152345.60
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '333.333.333.3' AND a.account_number = 'CH33 0000 0000 0000 0003 3' AND NOT EXISTS (SELECT 1 FROM Transactions t WHERE t.account_id = a.account_id AND t.transaction_date = '2022-07-05 00:00:00' AND t.amount = 15000.00 AND t.description = 'Zahlungseingang Kunde ABC AG');

INSERT INTO Transactions (account_id, transaction_date, description, amount, transaction_type, running_balance)
SELECT a.account_id, '2022-06-25 00:00:00', 'Lohnzahlungen Juni', -60000.00, 'Transfer_Out', 137345.60
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '333.333.333.3' AND a.account_number = 'CH33 0000 0000 0000 0003 3' AND NOT EXISTS (SELECT 1 FROM Transactions t WHERE t.account_id = a.account_id AND t.transaction_date = '2022-06-25 00:00:00' AND t.amount = -60000.00 AND t.description = 'Lohnzahlungen Juni');

INSERT INTO Transactions (account_id, transaction_date, description, amount, transaction_type, running_balance)
SELECT a.account_id, '2022-06-15 00:00:00', 'Zahlung Lieferant XYZ GmbH', -25000.00, 'Transfer_Out', 197345.60
FROM Accounts a JOIN Clients c ON a.client_id = c.client_id WHERE c.client_identifier = '333.333.333.3' AND a.account_number = 'CH33 0000 0000 0000 0003 3' AND NOT EXISTS (SELECT 1 FROM Transactions t WHERE t.account_id = a.account_id AND t.transaction_date = '2022-06-15 00:00:00' AND t.amount = -25000.00 AND t.description = 'Zahlung Lieferant XYZ GmbH');

-- 5. Insert Payment Methods for Tech Solutions GmbH
INSERT INTO PaymentMethods (client_id, method_type, name, masked_identifier, expiry_date, currency, monthly_limit)
SELECT c.client_id, 'Credit Card', 'Business Mastercard Silber', '4444xxxx4444', '08/2025', 'CHF', 20000.00
FROM Clients c WHERE c.client_identifier = '333.333.333.3'
  AND NOT EXISTS (SELECT 1 FROM PaymentMethods p WHERE p.client_id = c.client_id AND p.method_type = 'Credit Card' AND p.name = 'Business Mastercard Silber');

-- Products

-- Create the table for product categories
CREATE TABLE product_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL
);

-- Create the table for products with an additional column "impact_level"
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    react_icon TEXT NOT NULL,
    impact_level TEXT NOT NULL CHECK (impact_level IN ('low', 'mid', 'high')),
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

-- Create the documents table to link one or more documents to a product.
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert product categories with assigned colors
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
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (1, 'Lombard Loan', 'FaHandHoldingUsd', 'high');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (1, 'Private or Automotive Loan', 'FaCar', 'mid');

-- Group 2: Investment Solutions
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (2, 'Wealth Management Mandate', 'FaBriefcase', 'high');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (2, 'Raiffeisen Rio', 'FaWater', 'low');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (2, 'Advisory Mandate', 'FaComments', 'mid');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (2, 'Investment Fund Savings Plan', 'FaPiggyBank', 'mid');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (2, 'Securities Deposit', 'FaRegFileAlt', 'low');

-- Group 3: Investment Products
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (3, 'Investment Funds', 'FaChartPie', 'mid');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (3, 'Structured Products', 'FaCubes', 'high');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (3, 'Currency Instruments', 'FaExchangeAlt', 'high');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (3, 'Precious Metals', 'FaGem', 'mid');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (3, 'Additional Tier 1 Loan', 'FaHandshake', 'low');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (3, 'Term Investment', 'FaClock', 'mid');

-- Group 4: Investment Themes
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (4, 'Tech Innovators', 'FaLaptop', 'high');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (4, 'Smart Healthcare', 'FaHeartbeat', 'high');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (4, 'Aqua', 'FaTint', 'low');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (4, 'Green Energy', 'FaLeaf', 'mid');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (4, 'Top Swiss Pick', 'FaStar', 'low');

-- Group 5: Mortgage
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (5, 'Fixed Rate Mortgage', 'FaLock', 'mid');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (5, 'SARON Flex Mortgage', 'FaSyncAlt', 'mid');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (5, 'Variable Rate Mortgage', 'FaPercentage', 'high');

-- Group 6: Investment Advice
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (6, 'Retirement and Insurance Advice', 'FaUserTie', 'low');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (6, 'Retirement Planning Advice', 'FaRegCalendarAlt', 'mid');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (6, 'Succession Advice and Mandate for Incapacity', 'FaBalanceScaleLeft', 'high');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (6, 'Retirement and Investment Advice', 'FaChartLine', 'mid');

-- Group 7: Pension Products
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (7, 'Pillar 3a Account', 'FaWallet', 'low');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (7, 'Pension Funds', 'FaUniversity', 'mid');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (7, 'Digital Pillar 3a', 'FaMobileAlt', 'low');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (7, 'Prevision Investment Fund Savings Plan', 'FaRegChartBar', 'mid');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (7, 'Savings Goals Coverage', 'FaBullseye', 'low');

-- Group 8: Raiffeisen Insurances
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (8, 'Amortization Insurance', 'FaRegCreditCard', 'low');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (8, 'Household Insurance', 'FaHome', 'low');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (8, 'Death Insurance', 'FaSkull', 'high');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (8, 'Income Disability Pension', 'FaHospital', 'high');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (8, 'Capital Life Insurance', 'FaHeart', 'mid');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (8, 'Home Insurance', 'FaShieldAlt', 'mid');

-- Group 9: Credit and Debit Cards
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (9, 'Debit Card (Visa/Mastercard)', 'FaCreditCard', 'low');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (9, 'Standard Credit Card (Visa/Mastercard - 1 Year Free)', 'FaCcVisa', 'mid');
INSERT INTO products (category_id, name, react_icon, impact_level) VALUES (9, 'Gold Credit Card (No Fees for EUR/USD & Worldwide Replacement)', 'FaCcMastercard', 'high');

-- Group 10: Packages
INSERT INTO products (category_id, name, description, react_icon, impact_level) VALUES (
    10,
    'YoungMemberPlus',
    'For individuals under 26 years old',
    'FaChild',
    'low'
);
INSERT INTO products (category_id, name, description, react_icon, impact_level) VALUES (
    10,
    'Essential',
    'A monthly fee of CHF 9 is charged if the following condition is not met: A regular income entry (e.g., salary or pension) of at least CHF 1,260, or mortgage/savings/deposit or retirement capital of at least CHF 20,000. The condition must be met for at least three consecutive months and then continuously. The reference date for taxation is November 30.',
    'FaInfoCircle',
    'high'
);
INSERT INTO products (category_id, name, description, react_icon, impact_level) VALUES (
    10,
    'Member',
    'Preferred interest rate on savings account plus share of Raiffeisen',
    'FaUser',
    'mid'
);
INSERT INTO products (category_id, name, description, react_icon, impact_level) VALUES (
    10,
    'Member Plus',
    'Preferred interest rate on savings account plus free concert and museum tickets',
    'FaCrown',
    'high'
);

-- Example: Insert a document for the "Essential" product.
INSERT INTO documents (product_id, url) 
VALUES (
    (SELECT id FROM products WHERE name = 'Essential'),
    'https://www.raiffeisen.ch/content/dam/www/rch/pdf/produkte/zahlen/fr/compte-prive-fiche-produit.pdf'
);


CREATE TABLE IF NOT EXISTS ClientProducts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (client_id, product_id),
    FOREIGN KEY (client_id) REFERENCES Clients (client_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);