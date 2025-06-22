-- M-Pesa Transactions Migration
-- (restored content, see previous file for full SQL)
-- Create mpesa_transactions table
CREATE TABLE IF NOT EXISTS mpesa_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('SEND_MONEY', 'PAYBILL', 'BUY_GOODS', 'BUY_AIRTIME')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    recipient VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    account_number VARCHAR(100),
    business_number VARCHAR(10),
    till_number VARCHAR(5),
    phone_number VARCHAR(15),
    description TEXT NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    reference VARCHAR(50) UNIQUE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_user_id ON mpesa_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_type ON mpesa_transactions(type);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_status ON mpesa_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_timestamp ON mpesa_transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_reference ON mpesa_transactions(reference);

-- Create RLS policies
ALTER TABLE mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own transactions
CREATE POLICY "Users can view their own mpesa transactions" ON mpesa_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own transactions
CREATE POLICY "Users can insert their own mpesa transactions" ON mpesa_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for admins to view all transactions
CREATE POLICY "Admins can view all mpesa transactions" ON mpesa_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'ADMIN'
        )
    );

-- Policy for admins to update all transactions
CREATE POLICY "Admins can update all mpesa transactions" ON mpesa_transactions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'ADMIN'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mpesa_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_mpesa_transactions_updated_at
    BEFORE UPDATE ON mpesa_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_mpesa_transactions_updated_at();

-- Create function to generate unique reference numbers
CREATE OR REPLACE FUNCTION generate_mpesa_reference()
RETURNS VARCHAR(50) AS $$
DECLARE
    reference VARCHAR(50);
    counter INTEGER := 0;
BEGIN
    LOOP
        reference := 'MPESA' || EXTRACT(EPOCH FROM NOW())::BIGINT || 
                    LPAD(counter::TEXT, 3, '0') ||
                    SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
        
        -- Check if reference already exists
        IF NOT EXISTS (SELECT 1 FROM mpesa_transactions WHERE mpesa_transactions.reference = reference) THEN
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

-- Create function to validate phone number format (Kenyan format)
CREATE OR REPLACE FUNCTION validate_kenyan_phone(phone VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    -- Remove any non-digit characters except + and -
    phone := REGEXP_REPLACE(phone, '[^0-9+\-]', '', 'g');
    
    -- Check if it matches Kenyan phone number patterns
    RETURN phone ~ '^(?:254|\+254|0)?([17]\d{8})$';
END;
$$ LANGUAGE plpgsql;

-- Create function to validate business number format
CREATE OR REPLACE FUNCTION validate_business_number(business_number VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    -- Business numbers should be 5-6 digits
    RETURN business_number ~ '^\d{5,6}$';
END;
$$ LANGUAGE plpgsql;

-- Create function to validate till number format
CREATE OR REPLACE FUNCTION validate_till_number(till_number VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    -- Till numbers should be exactly 5 digits
    RETURN till_number ~ '^\d{5}$';
END;
$$ LANGUAGE plpgsql;

-- Add comments to the table and columns
COMMENT ON TABLE mpesa_transactions IS 'Stores M-Pesa related transactions including Send Money, PayBill, Buy Goods, and Buy Airtime';
COMMENT ON COLUMN mpesa_transactions.type IS 'Type of M-Pesa transaction: SEND_MONEY, PAYBILL, BUY_GOODS, BUY_AIRTIME';
COMMENT ON COLUMN mpesa_transactions.amount IS 'Transaction amount in KES';
COMMENT ON COLUMN mpesa_transactions.recipient IS 'Recipient phone number, business number, or till number';
COMMENT ON COLUMN mpesa_transactions.recipient_name IS 'Name of the recipient (optional for Send Money)';
COMMENT ON COLUMN mpesa_transactions.account_number IS 'Account number for PayBill transactions';
COMMENT ON COLUMN mpesa_transactions.business_number IS 'Business number for PayBill transactions (5-6 digits)';
COMMENT ON COLUMN mpesa_transactions.till_number IS 'Till number for Buy Goods transactions (5 digits)';
COMMENT ON COLUMN mpesa_transactions.phone_number IS 'Phone number for Send Money and Buy Airtime transactions';
COMMENT ON COLUMN mpesa_transactions.description IS 'Description of the transaction';
COMMENT ON COLUMN mpesa_transactions.status IS 'Transaction status: PENDING, SUCCESS, FAILED';
COMMENT ON COLUMN mpesa_transactions.reference IS 'Unique transaction reference number';
COMMENT ON COLUMN mpesa_transactions.user_id IS 'ID of the user who initiated the transaction'; 