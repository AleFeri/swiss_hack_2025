// src/types/index.ts

// --- API Response Types (Matching FastAPI Pydantic Models) ---

export interface Transaction {
  transaction_id: number;
  transaction_type?: string | null;
  transaction_date?: string | null; // Keep as string from JSON
  description?: string | null;
  amount: number;
  related_account_number?: string | null;
  asset_details?: string | null;
  running_balance?: number | null;
}

export interface Holding {
  holding_id: number;
  security_name: string;
  isin?: string | null;
  valor?: string | null;
  quantity: number;
  currency: string;
  current_price?: number | null;
  current_value?: number | null;
  cost_basis_total?: number | null;
  performance_value?: number | null;
  performance_percent?: number | null;
  last_updated?: string | null; // Keep as string from JSON
}

export interface PaymentMethod {
  payment_method_id: number;
  method_type: string;
  provider?: string | null;
  name: string;
  masked_identifier?: string | null;
  expiry_date?: string | null;
  daily_limit?: number | null;
  monthly_limit?: number | null;
  currency: string;
}

export interface Account {
  account_id: number;
  account_number: string;
  account_type: string;
  currency: string;
  balance: number;
  opened_at?: string | null; // Keep as string from JSON
  account_name?: string | null;
  asset_category?: string | null;
  interest_rate?: number | null;
  rate_margin?: number | null;
  term_start_date?: string | null;
  term_end_date?: string | null;
  cost_basis?: number | null;
  performance_value?: number | null;
  performance_percent?: number | null;
  notes?: string | null;
  transactions: Transaction[]; // Nested transactions
  holdings: Holding[];       // Nested holdings
}

export interface ClientDetails { // Corresponds to Pydantic ClientModel
  client_id: number;
  first_name?: string | null;
  last_name?: string | null;
  client_identifier?: string | null;
  membership_number?: string | null;
  full_name?: string | null;
  client_type?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at?: string | null; // Keep as string from JSON
  // --- NEW: Fields to be added by LLM enrichment ---
  age?: number | null;           // Estimated age
  occupation?: string | null;    // Estimated occupation
  funFacts?: string[] | null;    // List of inferred fun facts
  // --- End NEW Fields ---
}

export interface ClientApiResponse { // Corresponds to Pydantic ClientDataResponse
  client: ClientDetails;
  accounts: Account[];
  payment_methods: PaymentMethod[];
}

// Type for the client selection dropdown
export interface ClientListItem {
  client_identifier: string; // The unique ID used in the URL/API call
  full_name?: string | null;   // The display name
}


// --- Existing Frontend Types ---

export type ImpactLevel = 'low' | 'medium' | 'high';

export type ProductCategory =
  | 'packages'
  | 'debit-credit-cards'
  | 'credits-loans'
  | 'investment-solutions'
  | 'investment-products'
  | 'investment-themes'
  | 'mortgages'
  | 'investment-advice'
  | 'pension-products'
  | 'insurance'
  | 'all';


export interface ProductDocument {
    title: string;
    url: string;
    id?: number;
    product_id?: number;
}

export interface Product {
  id: string | number;
  name: string;
  category: ProductCategory | string;
  categoryLabel: string;
  description: string;
  reasonsToSell: string[];
  impactLevel: ImpactLevel;
  icon: string;
  isSuggested?: boolean;
  documents?: ProductDocument[];
  sellingPoints?: {
    title: string;
    points: string[];
  }[];
}

// Simple Client type from original fake data structure.
// Probably no longer needed for ClientInfo component.
export interface Client {
  id: string;
  name: string;
  age?: number;
  occupation?: string;
  funFacts?: string[];
  portfolioDetails?: string;
  summary?: {
    description: string;
    meetingTip: string;
  };
}

// Type needed by clientService.ts (if you keep that file)
export interface ClientData extends ClientApiResponse {} // Alias