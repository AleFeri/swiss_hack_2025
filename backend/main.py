# File: main.py

import os
import sqlite3
from fastapi import FastAPI, HTTPException, Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
import traceback

# --- Configuration ---
DATABASE_FILE = "peter_muster_and_products.db" # MAKE SURE THIS IS THE CORRECT .db FILE

# --- Pydantic Models ---
class TransactionModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    transaction_id: int; transaction_type: Optional[str] = None; transaction_date: Optional[datetime] = None
    description: Optional[str] = None; amount: float; related_account_number: Optional[str] = None
    asset_details: Optional[str] = None; running_balance: Optional[float] = None
class HoldingModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    holding_id: int; security_name: str; isin: Optional[str] = None; valor: Optional[str] = None
    quantity: float; currency: str; current_price: Optional[float] = None; current_value: Optional[float] = None
    cost_basis_total: Optional[float] = None; performance_value: Optional[float] = None
    performance_percent: Optional[float] = None; last_updated: Optional[datetime] = None
class PaymentMethodModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    payment_method_id: int; method_type: str; provider: Optional[str] = None; name: str
    masked_identifier: Optional[str] = None; expiry_date: Optional[str] = None
    daily_limit: Optional[float] = None; monthly_limit: Optional[float] = None; currency: str
class AccountModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    account_id: int; account_number: str; account_type: str; currency: str; balance: float
    opened_at: Optional[datetime] = None; account_name: Optional[str] = None; asset_category: Optional[str] = None
    interest_rate: Optional[float] = None; rate_margin: Optional[float] = None
    term_start_date: Optional[str] = None; term_end_date: Optional[str] = None
    cost_basis: Optional[float] = None; performance_value: Optional[float] = None
    performance_percent: Optional[float] = None; notes: Optional[str] = None
    transactions: List[TransactionModel] = []; holdings: List[HoldingModel] = []
class ClientModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    client_id: int; first_name: Optional[str] = None; last_name: Optional[str] = None
    client_identifier: Optional[str] = None; membership_number: Optional[str] = None
    full_name: Optional[str] = None; client_type: Optional[str] = None; email: Optional[str] = None
    phone: Optional[str] = None; address: Optional[str] = None; created_at: Optional[datetime] = None
class ClientDataResponse(BaseModel):
    client: ClientModel; accounts: List[AccountModel] = []; payment_methods: List[PaymentMethodModel] = []

# --- Database Connection Helper ---
def get_db_connection():
    if not os.path.exists(DATABASE_FILE):
         raise HTTPException(status_code=500, detail=f"Database file not found: {DATABASE_FILE}")
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail=f"Database connection error: {e}")

# --- FastAPI App ---
app = FastAPI(title="Client Data API", description="API to retrieve detailed client financial data.")

# --- API Endpoint ---
@app.get("/clients/{client_identifier}", response_model=ClientDataResponse, summary="Get all data for a specific client", tags=["Clients"])
async def get_client_data(client_identifier: str = Path(..., title="Client Identifier", description="Unique client ID (e.g., '111.111.111.1')", examples=["111.111.111.1"])):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Fetch Client
        print(f"--- Querying DB for client_identifier: {client_identifier} ---")
        cursor.execute("SELECT * FROM Clients WHERE client_identifier = ?", (client_identifier,))
        client_db = cursor.fetchone()

        # --- Debugging Prints ---
        print("\n--- DEBUG: Raw client_db data fetched ---")
        if client_db:
            client_dict_debug = dict(client_db)
            print(f"Type: {type(client_db)}, Keys: {list(client_dict_debug.keys())}")
            print(f"Content: {client_dict_debug}")
        else:
            print("client_db is None (Client not found by identifier)")
        print("--- END DEBUG ---")
        # --- End Debugging ---

        if not client_db:
            raise HTTPException(status_code=404, detail=f"Client with identifier '{client_identifier}' not found.")

        # --- Convert Row to Dict for Validation ---
        try:
            client_data_dict = dict(client_db)
            print(f"--- Converted client_db Row to Dict ---")
        except Exception as e:
            print(f"--- ERROR Converting client_db Row to Dict: {e} ---")
            raise HTTPException(status_code=500, detail="Failed to convert database row to dictionary.")

        # --- Perform Pydantic Validation USING THE DICTIONARY ---
        print("--- Attempting Pydantic validation for ClientModel using DICT ---")
        client_model = ClientModel.model_validate(client_data_dict) # Use the dictionary
        print("--- Pydantic ClientModel validation successful ---")

        # --- Get client_id from the validated model ---
        client_id = client_model.client_id
        print(f"--- Using client_id: {client_id} for subsequent queries ---")

        # --- REMOVED REDUNDANT VALIDATION CALL for ClientModel ---

        # 2. Fetch Payment Methods
        print(f"--- Querying PaymentMethods for client_id: {client_id} ---")
        cursor.execute("SELECT * FROM PaymentMethods WHERE client_id = ?", (client_id,))
        payment_methods_db = cursor.fetchall() # List of sqlite3.Row objects

        # --- >>> FIX: Convert each Row to dict before validating <<< ---
        print(f"--- Found {len(payment_methods_db)} payment method rows. Validating... ---")
        payment_methods_list = [PaymentMethodModel.model_validate(dict(pm)) for pm in payment_methods_db]
        print(f"--- Pydantic PaymentMethodModel validation successful for {len(payment_methods_list)} items ---")
        # --- >>> END FIX <<< ---

        # 3. Fetch Accounts and their related data
        print(f"--- Querying Accounts for client_id: {client_id} ---")
        cursor.execute("SELECT * FROM Accounts WHERE client_id = ? ORDER BY asset_category, account_name", (client_id,))
        accounts_db = cursor.fetchall()
        accounts_list = []
        print(f"--- Found {len(accounts_db)} accounts ---")

        for acc_db in accounts_db:
            account_id = acc_db['account_id']
            account_data = dict(acc_db) # Convert Row to dict
            account_data['transactions'] = []
            account_data['holdings'] = []

            # Fetch Transactions - FIX: Convert tx Row to dict before validation
            cursor.execute("SELECT * FROM Transactions WHERE account_id = ? ORDER BY transaction_date DESC", (account_id,))
            transactions_db = cursor.fetchall()
            account_data['transactions'] = [TransactionModel.model_validate(dict(tx)) for tx in transactions_db] # FIX

            # Fetch Holdings - FIX: Convert h Row to dict before validation
            if acc_db['account_type'] == 'Investment':
                cursor.execute("SELECT * FROM Holdings WHERE account_id = ? ORDER BY security_name", (account_id,))
                holdings_db = cursor.fetchall()
                account_data['holdings'] = [HoldingModel.model_validate(dict(h)) for h in holdings_db] # FIX

            # Validate AccountModel using the constructed dictionary
            accounts_list.append(AccountModel.model_validate(account_data))

        # 4. Construct final response
        print("--- Constructing final ClientDataResponse ---")
        response_data = ClientDataResponse(
            client=client_model,
            accounts=accounts_list,
            payment_methods=payment_methods_list
        )
        print("--- Final response object created ---")
        return response_data

    except HTTPException: raise
    except sqlite3.Error as e:
        print(f"Database query error: {e}"); raise HTTPException(status_code=500, detail=f"DB query error: {e}")
    except Exception as e:
         print(f"Error processing data: {e}"); tb_str = traceback.format_exc(); print(f"\nTRACEBACK:\n{tb_str}")
         detail_msg = f"Error processing data: {type(e).__name__}. Check server logs."
         raise HTTPException(status_code=500, detail=detail_msg)
    finally:
        if conn: print("--- Closing database connection ---"); conn.close()

# --- Root Endpoint ---
@app.get("/", tags=["Root"])
async def read_root(): return {"message": "Client API ok. Go to /docs"}

# --- Run command ---
# uvicorn main:app --reload