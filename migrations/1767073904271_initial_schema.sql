CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'viewer' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  contract_number text NOT NULL UNIQUE,
  title text NOT NULL,
  counterparty_name text NOT NULL,
  contract_type text NOT NULL,
  status text DEFAULT 'Draft' NOT NULL,
  start_date date,
  end_date date,
  value decimal(15,2),
  owner_id uuid NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON contracts (contract_number);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts (status);
CREATE INDEX IF NOT EXISTS idx_contracts_owner_id ON contracts (owner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts (end_date);

CREATE TABLE IF NOT EXISTS contract_drafts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  draft_id text NOT NULL UNIQUE,
  contract_id uuid NOT NULL,
  drafter_name text NOT NULL,
  drafter_id uuid NOT NULL,
  draft_date timestamp with time zone DEFAULT now() NOT NULL,
  draft_version text DEFAULT 'v1.0' NOT NULL,
  terms_and_conditions text,
  clauses_included text,
  review_required boolean DEFAULT false NOT NULL,
  status text DEFAULT 'Draft' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contract_drafts_draft_id ON contract_drafts (draft_id);
CREATE INDEX IF NOT EXISTS idx_contract_drafts_contract_id ON contract_drafts (contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_drafts_status ON contract_drafts (status);
CREATE INDEX IF NOT EXISTS idx_contract_drafts_review_required ON contract_drafts (review_required);

CREATE TABLE IF NOT EXISTS contract_monitoring (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  monitoring_id text NOT NULL UNIQUE,
  contract_id uuid NOT NULL,
  monitoring_date timestamp with time zone DEFAULT now() NOT NULL,
  monitored_by text NOT NULL,
  monitored_by_id uuid NOT NULL,
  compliance_status text NOT NULL,
  performance_metrics text,
  issues_identified text,
  next_review_date date,
  monitoring_notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contract_monitoring_monitoring_id ON contract_monitoring (monitoring_id);
CREATE INDEX IF NOT EXISTS idx_contract_monitoring_contract_id ON contract_monitoring (contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_monitoring_compliance_status ON contract_monitoring (compliance_status);
CREATE INDEX IF NOT EXISTS idx_contract_monitoring_next_review_date ON contract_monitoring (next_review_date);

CREATE TABLE IF NOT EXISTS contract_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  contract_id uuid NOT NULL,
  document_name text NOT NULL,
  document_type text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contract_documents_contract_id ON contract_documents (contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_documents_uploaded_by ON contract_documents (uploaded_by);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  contract_id uuid,
  user_id uuid NOT NULL,
  action text NOT NULL,
  description text NOT NULL,
  timestamp timestamp with time zone DEFAULT now() NOT NULL,
  ip_address text
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_contract_id ON audit_logs (contract_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);