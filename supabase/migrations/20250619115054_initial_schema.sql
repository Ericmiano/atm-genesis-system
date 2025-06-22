
-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE card_type AS ENUM ('VISA', 'MASTERCARD');
CREATE TYPE transaction_type AS ENUM ('WITHDRAWAL', 'DEPOSIT', 'TRANSFER', 'BALANCE_INQUIRY', 'BILL_PAYMENT', 'PIN_CHANGE', 'LOAN_DISBURSEMENT', 'LOAN_PAYMENT');
CREATE TYPE transaction_status AS ENUM ('SUCCESS', 'FAILED', 'PENDING');
CREATE TYPE loan_type AS ENUM ('PERSONAL', 'BUSINESS', 'EMERGENCY', 'EDUCATION');
CREATE TYPE loan_status AS ENUM ('PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'REJECTED');
CREATE TYPE bill_type AS ENUM ('UTILITY', 'SUBSCRIPTION', 'CREDIT_CARD', 'LOAN');
CREATE TYPE fraud_alert_type AS ENUM ('SUSPICIOUS_AMOUNT', 'MULTIPLE_ATTEMPTS', 'UNUSUAL_PATTERN', 'LARGE_LOAN_REQUEST');
CREATE TYPE fraud_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE admin_action_type AS ENUM ('UNLOCK_ACCOUNT', 'RESET_PIN', 'RESET_PASSWORD', 'APPROVE_LOAN', 'REJECT_LOAN', 'SUSPEND_USER', 'ACTIVATE_USER', 'ADJUST_BALANCE', 'RESOLVE_FRAUD_ALERT');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  account_number TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  pin TEXT NOT NULL,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  role user_role NOT NULL DEFAULT 'USER',
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  lock_reason TEXT,
  lock_date TIMESTAMPTZ,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  failed_password_attempts INTEGER NOT NULL DEFAULT 0,
  last_password_attempt TIMESTAMPTZ,
  credit_score INTEGER,
  monthly_income DECIMAL(15,2),
  card_number TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL,
  card_type card_type NOT NULL,
  password_last_changed TIMESTAMPTZ,
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status transaction_status NOT NULL DEFAULT 'SUCCESS',
  from_account TEXT,
  to_account TEXT,
  loan_id UUID
);

-- Create loans table
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type loan_type NOT NULL,
  principal DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  term_months INTEGER NOT NULL,
  monthly_payment DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  remaining_balance DECIMAL(15,2) NOT NULL,
  status loan_status NOT NULL DEFAULT 'PENDING',
  application_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approval_date TIMESTAMPTZ,
  disbursement_date TIMESTAMPTZ,
  next_payment_date TIMESTAMPTZ,
  collateral TEXT,
  purpose TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create loan_payments table
CREATE TABLE public.loan_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  principal_portion DECIMAL(15,2) NOT NULL,
  interest_portion DECIMAL(15,2) NOT NULL,
  remaining_balance DECIMAL(15,2) NOT NULL,
  status transaction_status NOT NULL DEFAULT 'SUCCESS'
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create bills table (for bill payment feature)
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type bill_type NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create atm_sessions table
CREATE TABLE public.atm_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create fraud_alerts table
CREATE TABLE public.fraud_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type fraud_alert_type NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  severity fraud_severity NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create admin_actions table
CREATE TABLE public.admin_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action admin_action_type NOT NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  target_loan_id UUID REFERENCES public.loans(id) ON DELETE SET NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atm_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
  ON public.users FOR SELECT 
  USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all users" 
  ON public.users FOR UPDATE 
  USING (public.get_current_user_role() = 'ADMIN');

-- RLS Policies for transactions table
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
  ON public.transactions FOR SELECT 
  USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Users can insert their own transactions" 
  ON public.transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" 
  ON public.transactions FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for loans table
CREATE POLICY "Users can view their own loans" 
  ON public.loans FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all loans" 
  ON public.loans FOR SELECT 
  USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Users can insert their own loan applications" 
  ON public.loans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update loans" 
  ON public.loans FOR UPDATE 
  USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Users can update their own loans" 
  ON public.loans FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for loan_payments table
CREATE POLICY "Users can view their loan payments" 
  ON public.loan_payments FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.loans WHERE loans.id = loan_payments.loan_id AND loans.user_id = auth.uid()));

CREATE POLICY "Admins can view all loan payments" 
  ON public.loan_payments FOR SELECT 
  USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Users can insert their loan payments" 
  ON public.loan_payments FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.loans WHERE loans.id = loan_payments.loan_id AND loans.user_id = auth.uid()));

-- RLS Policies for audit_logs table
CREATE POLICY "Admins can view all audit logs" 
  ON public.audit_logs FOR SELECT 
  USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "System can insert audit logs" 
  ON public.audit_logs FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for bills table (public bills that everyone can see)
CREATE POLICY "All authenticated users can view bills" 
  ON public.bills FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Admins can manage bills" 
  ON public.bills FOR ALL 
  USING (public.get_current_user_role() = 'ADMIN');

-- RLS Policies for atm_sessions table
CREATE POLICY "Users can view their own sessions" 
  ON public.atm_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" 
  ON public.atm_sessions FOR SELECT 
  USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Users can insert their own sessions" 
  ON public.atm_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
  ON public.atm_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for fraud_alerts table
CREATE POLICY "Users can view their own fraud alerts" 
  ON public.fraud_alerts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all fraud alerts" 
  ON public.fraud_alerts FOR SELECT 
  USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "System can insert fraud alerts" 
  ON public.fraud_alerts FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can update fraud alerts" 
  ON public.fraud_alerts FOR UPDATE 
  USING (public.get_current_user_role() = 'ADMIN');

-- RLS Policies for admin_actions table
CREATE POLICY "Admins can view all admin actions" 
  ON public.admin_actions FOR SELECT 
  USING (public.get_current_user_role() = 'ADMIN');

CREATE POLICY "Admins can insert admin actions" 
  ON public.admin_actions FOR INSERT 
  WITH CHECK (public.get_current_user_role() = 'ADMIN' AND auth.uid() = admin_id);

-- Create indexes for better performance
CREATE INDEX idx_users_account_number ON public.users(account_number);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_timestamp ON public.transactions(timestamp);
CREATE INDEX idx_loans_user_id ON public.loans(user_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX idx_atm_sessions_user_id ON public.atm_sessions(user_id);
CREATE INDEX idx_fraud_alerts_user_id ON public.fraud_alerts(user_id);

-- Create trigger to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    account_number,
    username,
    name,
    email,
    pin,
    card_number,
    expiry_date,
    cvv,
    card_type
  ) VALUES (
    NEW.id,
    LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000000000)::TEXT, 10, '0'),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    '0000', -- Default PIN, user must change
    '4' || LPAD((RANDOM() * 999999999999999)::BIGINT::TEXT, 15, '0'), -- Generate card number
    TO_CHAR(NOW() + INTERVAL '4 years', 'MM/YY'), -- Expiry date 4 years from now
    LPAD((RANDOM() * 999)::INT::TEXT, 3, '0'), -- Generate CVV
    'VISA'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create user profile on auth user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample bills
INSERT INTO public.bills (type, name, amount, due_date) VALUES
  ('UTILITY', 'Kenya Power Bill', 2500.00, NOW() + INTERVAL '10 days'),
  ('SUBSCRIPTION', 'DSTV Subscription', 1200.00, NOW() + INTERVAL '5 days'),
  ('UTILITY', 'Nairobi Water Bill', 800.00, NOW() - INTERVAL '2 days'),
  ('SUBSCRIPTION', 'Safaricom PostPay', 3000.00, NOW() + INTERVAL '15 days');
