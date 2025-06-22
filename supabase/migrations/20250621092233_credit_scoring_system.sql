-- Credit Scoring System Migration
-- (restored content, see previous file for full SQL)
-- Create credit_scores table
CREATE TABLE IF NOT EXISTS credit_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 400,
    max_loan_limit DECIMAL(12,2) NOT NULL DEFAULT 10000.00,
    overdraft_limit DECIMAL(12,2) NOT NULL DEFAULT 5000.00,
    risk_level TEXT NOT NULL DEFAULT 'high' CHECK (risk_level IN ('low', 'medium', 'high')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create overdrafts table
CREATE TABLE IF NOT EXISTS overdrafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'repaid', 'overdue')),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    repaid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_scores_user_id ON credit_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_score ON credit_scores(score);
CREATE INDEX IF NOT EXISTS idx_overdrafts_user_id ON overdrafts(user_id);
CREATE INDEX IF NOT EXISTS idx_overdrafts_status ON overdrafts(status);
CREATE INDEX IF NOT EXISTS idx_overdrafts_due_date ON overdrafts(due_date);

-- Add RLS policies for credit_scores
ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credit score" ON credit_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit score" ON credit_scores
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert credit scores" ON credit_scores
    FOR INSERT WITH CHECK (true);

-- Add RLS policies for overdrafts
ALTER TABLE overdrafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own overdrafts" ON overdrafts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own overdrafts" ON overdrafts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert overdrafts" ON overdrafts
    FOR INSERT WITH CHECK (true);

-- Create function to automatically create credit score for new users
CREATE OR REPLACE FUNCTION create_initial_credit_score()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO credit_scores (user_id, score, max_loan_limit, overdraft_limit, risk_level)
    VALUES (NEW.id, 400, 10000.00, 5000.00, 'high');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create credit score for new users
CREATE TRIGGER create_credit_score_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_initial_credit_score();

-- Create function to update credit score after loan repayment
CREATE OR REPLACE FUNCTION update_credit_score_after_loan_repayment()
RETURNS TRIGGER AS $$
DECLARE
    score_change INTEGER;
    current_score INTEGER;
    new_score INTEGER;
BEGIN
    -- Only trigger on loan status change to 'paid'
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        -- Get current credit score
        SELECT score INTO current_score 
        FROM credit_scores 
        WHERE user_id = NEW.user_id;
        
        -- Calculate score change based on repayment timeliness
        IF NEW.paid_at <= NEW.due_date THEN
            -- On-time payment: positive score change
            score_change := LEAST(50, FLOOR(NEW.amount / 1000) * 10);
        ELSE
            -- Late payment: negative score change
            score_change := GREATEST(-100, -FLOOR(NEW.amount / 1000) * 20);
        END IF;
        
        -- Update credit score
        new_score := GREATEST(300, LEAST(850, current_score + score_change));
        
        UPDATE credit_scores 
        SET score = new_score, last_updated = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for loan repayment credit score updates
CREATE TRIGGER loan_repayment_credit_score_update
    AFTER UPDATE ON loans
    FOR EACH ROW
    EXECUTE FUNCTION update_credit_score_after_loan_repayment();

-- Create function to update credit score after overdraft repayment
CREATE OR REPLACE FUNCTION update_credit_score_after_overdraft_repayment()
RETURNS TRIGGER AS $$
DECLARE
    score_change INTEGER;
    current_score INTEGER;
    new_score INTEGER;
BEGIN
    -- Only trigger on overdraft status change to 'repaid'
    IF NEW.status = 'repaid' AND OLD.status != 'repaid' THEN
        -- Get current credit score
        SELECT score INTO current_score 
        FROM credit_scores 
        WHERE user_id = NEW.user_id;
        
        -- Calculate score change based on repayment timeliness
        IF NEW.repaid_at <= NEW.due_date THEN
            -- On-time repayment: small positive score change
            score_change := 10;
        ELSE
            -- Late repayment: negative score change
            score_change := -30;
        END IF;
        
        -- Update credit score
        new_score := GREATEST(300, LEAST(850, current_score + score_change));
        
        UPDATE credit_scores 
        SET score = new_score, last_updated = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for overdraft repayment credit score updates
CREATE TRIGGER overdraft_repayment_credit_score_update
    AFTER UPDATE ON overdrafts
    FOR EACH ROW
    EXECUTE FUNCTION update_credit_score_after_overdraft_repayment();

-- Create function to automatically mark overdue overdrafts
CREATE OR REPLACE FUNCTION mark_overdue_overdrafts()
RETURNS void AS $$
BEGIN
    UPDATE overdrafts 
    SET status = 'overdue'
    WHERE status = 'active' 
    AND due_date < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to check for overdue overdrafts (runs daily)
SELECT cron.schedule(
    'check-overdue-overdrafts',
    '0 0 * * *', -- Daily at midnight
    'SELECT mark_overdue_overdrafts();'
); 