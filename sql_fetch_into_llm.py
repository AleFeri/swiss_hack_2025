# File: sql_fetch_into_llm.py

import os
import sqlite3
from openai import AzureOpenAI
import re
from datetime import datetime
import traceback # For more detailed error reporting

# --- Database Configuration ---
# <<<======================================================================>>>
# <<<=== 1. POINT THIS TO THE ACTUAL SQLITE DATABASE FILE (.db/.sqlite) ===>>>
DB_FILE = "peter_muster_and_products.db"
# <<<======================================================================>>>

# --- Client to target for this test ---
TARGET_CLIENT_IDENTIFIER = '111.111.111.1'
TARGET_CLIENT_NAME = "Peter Muster" # Used for prompts and context generation

# --- Function to Query ALL Data for Peter Muster (Detailed Schema Version - CORRECTED for NoneTypes) ---
def query_peter_muster_data():
    """
    Queries the DETAILED schema database for Peter Muster ONLY using his identifier.
    Returns a single string with all data found, or an error message.
    Includes checks for None before formatting database values.
    """
    if not os.path.exists(DB_FILE):
        return f"DATABASE FILE NOT FOUND: '{DB_FILE}'"

    conn = None
    results = [] # Store lines of text
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row # Access columns by name
        cursor = conn.cursor()

        # --- 1. Get Client ---
        cursor.execute("""
            SELECT client_id, first_name, last_name, client_identifier, membership_number,
                   full_name, client_type, email, phone, address, created_at
            FROM Clients WHERE client_identifier = ?
            """, (TARGET_CLIENT_IDENTIFIER,))
        client = cursor.fetchone()

        if not client:
            return f"CLIENT NOT FOUND: Client with identifier '{TARGET_CLIENT_IDENTIFIER}' not found in '{DB_FILE}'."
        client_id = client['client_id']
        client_name_display = client['full_name'] if client['full_name'] else f"{client['first_name']} {client['last_name']}".strip()

        results.append(f"--- Kundendaten Start (für {client_name_display}) ---")
        for key in client.keys():
             if client[key] is not None: # Only show non-null fields
                results.append(f"Client_{key}: {client[key]}")
        results.append("--- End Client Data ---")

        # --- 2. Get Accounts ---
        cursor.execute("""
            SELECT account_id, account_number, account_type, account_name, asset_category,
                   balance, currency, interest_rate, rate_margin, term_start_date,
                   term_end_date, cost_basis, performance_value, performance_percent, notes, opened_at
            FROM Accounts WHERE client_id = ? ORDER BY asset_category, account_name
            """, (client_id,))
        accounts = cursor.fetchall()
        results.append("\n--- Accounts Data ---")
        account_map = {}
        if accounts:
            current_category = None
            for acc in accounts:
                account_map[acc['account_id']] = acc # Store full account details for later reference
                asset_cat = acc['asset_category'] if acc['asset_category'] else 'Unkategorisiert'
                # Add category header
                if asset_cat != current_category:
                    results.append(f"\n-- Kategorie: {asset_cat} --")
                    current_category = asset_cat

                acc_name_display = acc['account_name'] if acc['account_name'] else acc['account_type']
                results.append(f"  Konto: {acc_name_display} (Nr: {acc['account_number']}, ID: {acc['account_id']})")
                # Add relevant details for each account
                for key in acc.keys():
                    value = acc[key]
                    # Skip redundant/internal keys, show only relevant populated fields
                    if key not in ('client_id', 'account_id', 'account_name', 'account_number', 'asset_category') and value is not None:
                         # Check for None BEFORE formatting numeric types
                         formatted_value = "N/A" # Default if None or unhandled
                         if value is not None:
                             if key in ('interest_rate', 'rate_margin'):
                                 formatted_value = f"{value*100:.3f}%"
                             elif key == 'performance_percent':
                                 formatted_value = f"{value:+.2f}%"
                             elif key in ('balance', 'cost_basis', 'performance_value'):
                                 formatted_value = f"{value:,.2f}"
                             else: # Handle non-numeric types or those without special formatting
                                 formatted_value = str(value) # Default to string conversion
                         results.append(f"    {key}: {formatted_value}")

        else:
             results.append("No accounts found.")
        results.append("--- End Accounts Data ---")


        # --- 3. Get Transactions ---
        results.append("\n--- Transactions Data ---")
        has_transactions = False
        if account_map: # Only proceed if accounts were found
            for acc_id, acc_details in account_map.items():
                 cursor.execute("""
                    SELECT transaction_id, transaction_date, transaction_type, description,
                           amount, related_account_number, asset_details, running_balance
                    FROM Transactions WHERE account_id = ? ORDER BY transaction_date DESC
                    """, (acc_id,))
                 transactions = cursor.fetchall()
                 if transactions:
                     has_transactions = True
                     acc_name_display = acc_details['account_name'] if acc_details['account_name'] else acc_details['account_type']
                     results.append(f"\n-- Transaktionen für Konto: {acc_name_display} ({acc_details['account_number']}) --")
                     for tx in transactions:
                         # Check running_balance for None before potentially formatting
                         running_balance_str = f"{tx['running_balance']:,.2f}" if tx['running_balance'] is not None else "N/A"
                         results.append(f"  TxID {tx['transaction_id']}: Date={tx['transaction_date']}, Type={tx['transaction_type']}, Desc={tx['description']}, Amount={tx['amount']:+,.2f}, RunningBalance={running_balance_str}")
                         if tx['related_account_number']: results.append(f"      RelatedAcc: {tx['related_account_number']}")
                         if tx['asset_details']: results.append(f"      AssetDetails: {tx['asset_details']}")
        if not has_transactions:
            results.append("No transactions found for any account.")
        results.append("--- End Transactions Data ---")


        # --- 4. Get Holdings ---
        results.append("\n--- Holdings Data ---")
        has_holdings = False
        if account_map: # Only proceed if accounts were found
            for acc_id, acc_details in account_map.items():
                 # Check account_type before accessing
                 if acc_details and acc_details['account_type'] == 'Investment':
                     cursor.execute("""
                        SELECT security_name, isin, valor, quantity, current_price,
                               current_value, performance_value, performance_percent
                        FROM Holdings WHERE account_id = ? ORDER BY security_name
                        """, (acc_id,))
                     holdings = cursor.fetchall()
                     if holdings:
                         has_holdings = True
                         acc_name_display = acc_details['account_name'] if acc_details['account_name'] else acc_details['account_type']
                         results.append(f"\n-- Holdings für Konto: {acc_name_display} ({acc_details['account_number']}) --")
                         for h in holdings:
                             # Add None checks for all potentially formatted holding values
                             price_str = f"{h['current_price']:,.2f}" if h['current_price'] is not None else "N/A"
                             value_str = f"{h['current_value']:,.2f}" if h['current_value'] is not None else "N/A"
                             perf_pct_str = f"{h['performance_percent']:+.2f}%" if h['performance_percent'] is not None else "N/A"
                             results.append(f"  Holding: {h['security_name']} ({h['isin']}), Qty: {h['quantity']}, Price: {price_str}, Value: {value_str}, Perf %: {perf_pct_str}")

        if not has_holdings:
            results.append("No holdings found for any investment account.")
        results.append("--- End Holdings Data ---")


        # --- 5. Get Payment Methods ---
        cursor.execute("SELECT * FROM PaymentMethods WHERE client_id = ?", (client_id,))
        paymethods = cursor.fetchall()
        results.append("\n--- Payment Methods Data ---")
        if paymethods:
            for pm in paymethods:
                 # Add None checks for limits before potentially formatting
                 daily_limit_str = f"{pm['daily_limit']:,.2f}" if pm['daily_limit'] is not None else "N/A"
                 monthly_limit_str = f"{pm['monthly_limit']:,.2f}" if pm['monthly_limit'] is not None else "N/A"
                 expires_str = str(pm['expiry_date']) if pm['expiry_date'] is not None else "N/A"
                 masked_id_str = str(pm['masked_identifier']) if pm['masked_identifier'] is not None else "N/A"
                 results.append(f"  PaymentMethod: {pm['name']} ({pm['method_type']}), ID: {masked_id_str}, Expires: {expires_str}, DailyLimit: {daily_limit_str}, MonthlyLimit: {monthly_limit_str}")
        else:
            results.append("No payment methods found.")
        results.append("--- End Payment Methods Data ---")

        results.append(f"\n--- Kundendaten Ende ---")
        return "\n".join(results)

    except sqlite3.Error as e:
        return f"DATABASE QUERY ERROR: {e}"
    except Exception as e:
         # Add more specific error context if possible
         tb_str = traceback.format_exc()
         return f"UNEXPECTED PYTHON ERROR during query: {e}\nTraceback:\n{tb_str}"
    finally:
        if conn:
            conn.close()

# --- Azure OpenAI Client Setup ---
# Choose ONE method below: Environment Variables (Recommended) or Direct Values

# Method 1: Environment Variables (Recommended & Safer)
try:
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    if not azure_endpoint or not api_key:
        # If using env vars, make sure they are set before running the script!
        # Example: export AZURE_OPENAI_ENDPOINT="YOUR_ENDPOINT"
        #          export AZURE_OPENAI_API_KEY="YOUR_KEY"
        raise ValueError("Environment variables AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY not set.")
    client = AzureOpenAI(
        azure_endpoint=azure_endpoint,
        api_key=api_key,
        api_version="2024-02-01" # Or your preferred API version
    )
    print("--- Azure OpenAI Client Initialized Successfully (using environment variables) ---")

# Method 2: Direct Values (Less Secure - Use only for quick local tests)
# try:
#     # WARNING: Avoid hardcoding credentials in production code or shared repositories!
#     client = AzureOpenAI(
#         azure_endpoint = "https://swisshacks-aoai-westeurope.openai.azure.com/", # Your actual endpoint URL
#         api_key = "2yjmTT6QIzFt2Aln8FkFd49mBUhqtp6GEFAOQX11ANvxGOfjUw4IJQQJ99BDAC5RqLJXJ3w3AAABACOG9ngV",  # Your actual API key
#         api_version = "2024-02-01" # Or your preferred API version
#     )
#     print("--- Azure OpenAI Client Initialized Successfully (using direct values) ---")

except ValueError as ve:
    print(f"Client Setup Error: {ve}")
    exit()
except Exception as e:
    print(f"Error initializing AzureOpenAI client: {e}")
    exit()


# --- Function to Ask LLM (Simplified) ---
def ask_llm(context, question):
    """Sends the context and question to the LLM and prints the response."""
    system_prompt = f"""Sie sind ein Bankassistent. Beantworten Sie die Frage des Benutzers AUSSCHLIESSLICH basierend auf dem folgenden Kontext für den Kunden '{TARGET_CLIENT_NAME}'. Zitieren Sie relevante Daten direkt. Wenn die Information nicht im Kontext ist, sagen Sie das klar. Antworten Sie auf Deutsch.

KONTEXT START:
{context}
KONTEXT ENDE"""
    messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": question}]
    print(f"\n--- Frage an LLM: {question} ---")
    try:
        response = client.chat.completions.create(
            model="gpt-4o", # <<<=== UPDATE if your Azure deployment name is different
            messages=messages,
            temperature=0.0 # Force factual answer based on context
        )
        llm_answer = response.choices[0].message.content
        print("\n--- LLM Antwort ---")
        print(llm_answer)
    except Exception as e:
        print(f"\n--- FEHLER beim Aufruf von Azure OpenAI ---")
        print(f"Fehlerdetails: {e}")
        if hasattr(e, 'response') and e.response:
             print(f"Status Code: {e.response.status_code}")
             print(f"Response Body: {e.response.text}")


# --- Main Execution Block ---
if __name__ == "__main__":
    print(f"--- Test gestartet: Lese Daten für '{TARGET_CLIENT_NAME}' aus '{DB_FILE}' ---")
    peter_muster_context = query_peter_muster_data()

    # Check if data retrieval was successful before proceeding
    if "NOT FOUND" in peter_muster_context or "ERROR" in peter_muster_context:
        print("\n--- FEHLER beim Abrufen der Datenbankdaten ---")
        print(peter_muster_context)
        print("--- Test abgebrochen ---")
    else:
        print(f"--- Datenbankkontext für '{TARGET_CLIENT_NAME}' erfolgreich abgerufen (Länge: {len(peter_muster_context)} Zeichen). ---")
        # Optional: Uncomment to print the full context string sent to the LLM (can be very long)
        # print("\n--- VOLLSTÄNDIGER KONTEXT FÜR DEBUGGING ---")
        # print(peter_muster_context)
        # print("--- ENDE KONTEXT ---")

        # Define the specific questions to ask
        questions_to_ask = [
            "Wie viel Konten besitzt Peter Muster?",
            "Was ist der Zins auf der Festhypothek von Peter Muster?",
            "Wie viel zahlt Peter Muster für seine Mitgliedschaft?",
            "Gib mir eine maximal 7 satz zusammenfassung über den Zustand von Peter Muster's Vermögen."
        ]

        # Ask each question
        for q in questions_to_ask:
            ask_llm(peter_muster_context, q)

        print("\n--- Test abgeschlossen ---")