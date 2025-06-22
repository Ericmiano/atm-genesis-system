-- Automated Payments Migration
-- (restored content, see previous file for full SQL)
-- Create automated_payments table
CREATE TABLE IF NOT EXISTS automated_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('bill', 'loan')),
    target_id UUID NOT NULL, -- bill_id or loan_id
    amount DECIMAL(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'insufficient_funds', 'cancelled')),
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_notifications table
CREATE TABLE IF NOT EXISTS payment_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('insufficient_funds', 'payment_success', 'payment_failed')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_payment_id UUID REFERENCES automated_payments(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_automated_payments_user_id ON automated_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_automated_payments_status ON automated_payments(status);
CREATE INDEX IF NOT EXISTS idx_automated_payments_scheduled_date ON automated_payments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_automated_payments_type ON automated_payments(type);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_user_id ON payment_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_is_read ON payment_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_created_at ON payment_notifications(created_at);

-- Add RLS policies for automated_payments
ALTER TABLE automated_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own automated payments" ON automated_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own automated payments" ON automated_payments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own automated payments" ON automated_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can manage automated payments" ON automated_payments
    FOR ALL USING (true);

-- Add RLS policies for payment_notifications
ALTER TABLE payment_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON payment_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON payment_notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON payment_notifications
    FOR INSERT WITH CHECK (true);

-- Create function to execute automated payment
CREATE OR REPLACE FUNCTION execute_automated_payment(
    payment_id UUID,
    user_id UUID,
    payment_amount DECIMAL,
    payment_type TEXT,
    target_id UUID
)
RETURNS void AS $$
DECLARE
    current_balance DECIMAL;
    new_balance DECIMAL;
BEGIN
    -- Get current account balance
    SELECT balance INTO current_balance 
    FROM accounts 
    WHERE user_id = execute_automated_payment.user_id;
    
    IF current_balance IS NULL THEN
        RAISE EXCEPTION 'Account not found';
    END IF;
    
    IF current_balance < payment_amount THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;
    
    -- Calculate new balance
    new_balance := current_balance - payment_amount;
    
    -- Update account balance
    UPDATE accounts 
    SET balance = new_balance 
    WHERE user_id = execute_automated_payment.user_id;
    
    -- Create transaction record
    INSERT INTO transactions (
        user_id, 
        type, 
        amount, 
        description, 
        balance_after,
        related_payment_id
    ) VALUES (
        user_id,
        'payment',
        payment_amount,
        CASE 
            WHEN payment_type = 'bill' THEN 'Automated bill payment'
            WHEN payment_type = 'loan' THEN 'Automated loan repayment'
            ELSE 'Automated payment'
        END,
        new_balance,
        payment_id
    );
    
    -- Update target record based on payment type
    IF payment_type = 'bill' THEN
        UPDATE bills 
        SET status = 'paid', 
            paid_at = NOW() 
        WHERE id = target_id AND user_id = execute_automated_payment.user_id;
    ELSIF payment_type = 'loan' THEN
        UPDATE loans 
        SET remaining_balance = GREATEST(0, remaining_balance - payment_amount),
            last_payment_date = NOW()
        WHERE id = target_id AND user_id = execute_automated_payment.user_id;
        
        -- Check if loan is fully paid
        UPDATE loans 
        SET status = 'paid', 
            paid_at = NOW() 
        WHERE id = target_id 
        AND user_id = execute_automated_payment.user_id 
        AND remaining_balance <= 0;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to execute automated payment with overdraft
CREATE OR REPLACE FUNCTION execute_automated_payment_with_overdraft(
    payment_id UUID,
    user_id UUID,
    payment_amount DECIMAL,
    balance_used DECIMAL,
    overdraft_amount DECIMAL,
    payment_type TEXT,
    target_id UUID
)
RETURNS void AS $$
DECLARE
    current_balance DECIMAL;
    new_balance DECIMAL;
BEGIN
    -- Get current account balance
    SELECT balance INTO current_balance 
    FROM accounts 
    WHERE user_id = execute_automated_payment_with_overdraft.user_id;
    
    IF current_balance IS NULL THEN
        RAISE EXCEPTION 'Account not found';
    END IF;
    
    -- Calculate new balance (will be negative due to overdraft)
    new_balance := current_balance - payment_amount;
    
    -- Update account balance
    UPDATE accounts 
    SET balance = new_balance 
    WHERE user_id = execute_automated_payment_with_overdraft.user_id;
    
    -- Create transaction record
    INSERT INTO transactions (
        user_id, 
        type, 
        amount, 
        description, 
        balance_after,
        related_payment_id
    ) VALUES (
        user_id,
        'payment',
        payment_amount,
        CASE 
            WHEN payment_type = 'bill' THEN 'Automated bill payment (with overdraft)'
            WHEN payment_type = 'loan' THEN 'Automated loan repayment (with overdraft)'
            ELSE 'Automated payment (with overdraft)'
        END,
        new_balance,
        payment_id
    );
    
    -- Update target record based on payment type
    IF payment_type = 'bill' THEN
        UPDATE bills 
        SET status = 'paid', 
            paid_at = NOW() 
        WHERE id = target_id AND user_id = execute_automated_payment_with_overdraft.user_id;
    ELSIF payment_type = 'loan' THEN
        UPDATE loans 
        SET remaining_balance = GREATEST(0, remaining_balance - payment_amount),
            last_payment_date = NOW()
        WHERE id = target_id AND user_id = execute_automated_payment_with_overdraft.user_id;
        
        -- Check if loan is fully paid
        UPDATE loans 
        SET status = 'paid', 
            paid_at = NOW() 
        WHERE id = target_id 
        AND user_id = execute_automated_payment_with_overdraft.user_id 
        AND remaining_balance <= 0;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process all pending automated payments
CREATE OR REPLACE FUNCTION process_pending_automated_payments()
RETURNS TABLE(
    processed_count INTEGER,
    successful_count INTEGER,
    failed_count INTEGER,
    insufficient_count INTEGER
) AS $$
DECLARE
    payment_record RECORD;
    result_status TEXT;
    processed INTEGER := 0;
    successful INTEGER := 0;
    failed INTEGER := 0;
    insufficient INTEGER := 0;
BEGIN
    -- Get all pending payments that are due
    FOR payment_record IN 
        SELECT * FROM automated_payments 
        WHERE status = 'pending' 
        AND scheduled_date <= NOW()
    LOOP
        processed := processed + 1;
        
        BEGIN
            -- Try to execute the payment
            PERFORM execute_automated_payment(
                payment_record.id,
                payment_record.user_id,
                payment_record.amount,
                payment_record.type,
                payment_record.target_id
            );
            
            -- Mark as completed
            UPDATE automated_payments 
            SET status = 'completed', 
                processed_at = NOW() 
            WHERE id = payment_record.id;
            
            successful := successful + 1;
            
        EXCEPTION 
            WHEN OTHERS THEN
                -- Check if it's an insufficient funds error
                IF SQLERRM LIKE '%Insufficient funds%' THEN
                    UPDATE automated_payments 
                    SET status = 'insufficient_funds', 
                        processed_at = NOW() 
                    WHERE id = payment_record.id;
                    
                    insufficient := insufficient + 1;
                ELSE
                    UPDATE automated_payments 
                    SET status = 'failed', 
                        processed_at = NOW(),
                        error_message = SQLERRM 
                    WHERE id = payment_record.id;
                    
                    failed := failed + 1;
                END IF;
        END;
    END LOOP;
    
    RETURN QUERY SELECT processed, successful, failed, insufficient;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to process automated payments (runs every hour)
SELECT cron.schedule(
    'process-automated-payments',
    '0 * * * *', -- Every hour
    'SELECT process_pending_automated_payments();'
);

-- Add related_payment_id column to transactions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'related_payment_id'
    ) THEN
        ALTER TABLE transactions ADD COLUMN related_payment_id UUID REFERENCES automated_payments(id) ON DELETE SET NULL;
    END IF;
END $$; 