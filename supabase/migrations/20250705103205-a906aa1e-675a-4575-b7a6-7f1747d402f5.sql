
-- Create notifications table for system notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('transaction', 'security', 'system', 'fraud', 'loan', 'kyc')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create KYC documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('national_id', 'passport', 'alien_id', 'photo', 'selfie', 'proof_of_residence', 'kra_pin')),
  document_url TEXT,
  document_number TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verification_notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create user profiles table for additional user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  phone_number VARCHAR(15),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  nationality VARCHAR(50) DEFAULT 'Kenyan',
  kyc_status VARCHAR(20) DEFAULT 'incomplete' CHECK (kyc_status IN ('incomplete', 'pending', 'approved', 'rejected')),
  account_tier VARCHAR(20) DEFAULT 'basic' CHECK (account_tier IN ('basic', 'premium', 'business')),
  biometric_enabled BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update M-Pesa transactions table with proper structure
CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('SEND_MONEY', 'PAYBILL', 'BUY_GOODS', 'BUY_AIRTIME', 'WITHDRAW', 'DEPOSIT')),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  recipient VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  account_number VARCHAR(100),
  business_number VARCHAR(10),
  till_number VARCHAR(10),
  phone_number VARCHAR(15),
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
  reference_code VARCHAR(50) UNIQUE NOT NULL,
  mpesa_receipt_number VARCHAR(50),
  transaction_cost DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create contact messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create newsletter subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed'))
);

-- Enable RLS on all new tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- KYC documents policies
CREATE POLICY "Users can view their own KYC documents" ON public.kyc_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC documents" ON public.kyc_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all KYC documents" ON public.kyc_documents
  FOR SELECT USING (get_current_user_role() = 'ADMIN');

CREATE POLICY "Admins can update KYC documents" ON public.kyc_documents
  FOR UPDATE USING (get_current_user_role() = 'ADMIN');

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (get_current_user_role() = 'ADMIN');

-- M-Pesa transactions policies
CREATE POLICY "Users can view their own mpesa transactions" ON public.mpesa_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mpesa transactions" ON public.mpesa_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all mpesa transactions" ON public.mpesa_transactions
  FOR SELECT USING (get_current_user_role() = 'ADMIN');

-- Contact messages policies (public can insert)
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all contact messages" ON public.contact_messages
  FOR SELECT USING (get_current_user_role() = 'ADMIN');

CREATE POLICY "Admins can update contact messages" ON public.contact_messages
  FOR UPDATE USING (get_current_user_role() = 'ADMIN');

-- Newsletter policies (public can insert)
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their subscription" ON public.newsletter_subscriptions
  FOR UPDATE USING (true);

CREATE POLICY "Admins can view all subscriptions" ON public.newsletter_subscriptions
  FOR SELECT USING (get_current_user_role() = 'ADMIN');

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_kyc_user_id ON public.kyc_documents(user_id);
CREATE INDEX idx_kyc_status ON public.kyc_documents(status);
CREATE INDEX idx_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_mpesa_user_id ON public.mpesa_transactions(user_id);
CREATE INDEX idx_mpesa_status ON public.mpesa_transactions(status);
CREATE INDEX idx_mpesa_reference ON public.mpesa_transactions(reference_code);

-- Add triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate M-Pesa reference codes
CREATE OR REPLACE FUNCTION generate_mpesa_reference()
RETURNS TEXT AS $$
DECLARE
    reference TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        reference := 'MP' || EXTRACT(EPOCH FROM NOW())::BIGINT || 
                    LPAD(counter::TEXT, 3, '0') ||
                    SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6);
        
        -- Check if reference already exists
        IF NOT EXISTS (SELECT 1 FROM public.mpesa_transactions WHERE reference_code = reference) THEN
            RETURN reference;
        END IF;
        
        counter := counter + 1;
        
        -- Prevent infinite loop
        IF counter > 1000 THEN
            RAISE EXCEPTION 'Unable to generate unique reference after 1000 attempts';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
