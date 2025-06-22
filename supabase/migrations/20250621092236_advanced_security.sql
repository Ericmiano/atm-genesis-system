-- Advanced Security Features Migration
-- This migration adds comprehensive security features to the ATM Genesis System

-- Create biometric_data table
CREATE TABLE IF NOT EXISTS biometric_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    biometric_type TEXT NOT NULL CHECK (biometric_type IN ('fingerprint', 'face', 'voice')),
    biometric_hash TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, biometric_type)
);

-- Create device_fingerprints table
CREATE TABLE IF NOT EXISTS device_fingerprints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fingerprint TEXT NOT NULL,
    user_agent TEXT,
    screen_resolution TEXT,
    timezone TEXT,
    language TEXT,
    platform TEXT,
    is_trusted BOOLEAN DEFAULT false,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create behavioral_patterns table
CREATE TABLE IF NOT EXISTS behavioral_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    typing_pattern INTEGER[],
    mouse_pattern INTEGER[],
    session_duration INTEGER DEFAULT 0,
    actions_per_minute INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create geo_fencing table
CREATE TABLE IF NOT EXISTS geo_fencing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    allowed_locations JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create time_restrictions table
CREATE TABLE IF NOT EXISTS time_restrictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    restrictions JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create threat_intelligence table
CREATE TABLE IF NOT EXISTS threat_intelligence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    threat_level TEXT NOT NULL CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
    threat_type TEXT[],
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ip_address)
);

-- Enhance security_events table with additional fields
ALTER TABLE security_events 
ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
ADD COLUMN IF NOT EXISTS location JSONB,
ADD COLUMN IF NOT EXISTS risk_score DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS threat_level TEXT CHECK (threat_level IN ('low', 'medium', 'high', 'critical'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_biometric_data_user_id ON biometric_data(user_id);
CREATE INDEX IF NOT EXISTS idx_biometric_data_type ON biometric_data(biometric_type);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_user_id ON device_fingerprints(user_id);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_fingerprint ON device_fingerprints(fingerprint);
CREATE INDEX IF NOT EXISTS idx_behavioral_patterns_user_id ON behavioral_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_geo_fencing_user_id ON geo_fencing(user_id);
CREATE INDEX IF NOT EXISTS idx_time_restrictions_user_id ON time_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_ip ON threat_intelligence(ip_address);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_level ON threat_intelligence(threat_level);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON security_events(risk_score);
CREATE INDEX IF NOT EXISTS idx_security_events_threat_level ON security_events(threat_level);

-- Create RLS policies for security tables
ALTER TABLE biometric_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_fencing ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_intelligence ENABLE ROW LEVEL SECURITY;

-- Biometric data policies
CREATE POLICY "Users can view their own biometric data" ON biometric_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own biometric data" ON biometric_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own biometric data" ON biometric_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own biometric data" ON biometric_data
    FOR DELETE USING (auth.uid() = user_id);

-- Device fingerprints policies
CREATE POLICY "Users can view their own device fingerprints" ON device_fingerprints
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device fingerprints" ON device_fingerprints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device fingerprints" ON device_fingerprints
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device fingerprints" ON device_fingerprints
    FOR DELETE USING (auth.uid() = user_id);

-- Behavioral patterns policies
CREATE POLICY "Users can view their own behavioral patterns" ON behavioral_patterns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behavioral patterns" ON behavioral_patterns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own behavioral patterns" ON behavioral_patterns
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own behavioral patterns" ON behavioral_patterns
    FOR DELETE USING (auth.uid() = user_id);

-- Geo-fencing policies
CREATE POLICY "Users can view their own geo-fencing" ON geo_fencing
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own geo-fencing" ON geo_fencing
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own geo-fencing" ON geo_fencing
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own geo-fencing" ON geo_fencing
    FOR DELETE USING (auth.uid() = user_id);

-- Time restrictions policies
CREATE POLICY "Users can view their own time restrictions" ON time_restrictions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time restrictions" ON time_restrictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time restrictions" ON time_restrictions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time restrictions" ON time_restrictions
    FOR DELETE USING (auth.uid() = user_id);

-- Threat intelligence policies (admin only)
CREATE POLICY "Admins can view threat intelligence" ON threat_intelligence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert threat intelligence" ON threat_intelligence
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update threat intelligence" ON threat_intelligence
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete threat intelligence" ON threat_intelligence
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Create functions for security operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_biometric_data_updated_at 
    BEFORE UPDATE ON biometric_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_fingerprints_updated_at 
    BEFORE UPDATE ON device_fingerprints 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geo_fencing_updated_at 
    BEFORE UPDATE ON geo_fencing 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_restrictions_updated_at 
    BEFORE UPDATE ON time_restrictions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threat_intelligence_updated_at 
    BEFORE UPDATE ON threat_intelligence 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate risk score based on security events
CREATE OR REPLACE FUNCTION calculate_user_risk_score(user_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    risk_score DECIMAL(3,2) := 0.0;
    recent_events_count INTEGER;
    high_risk_events_count INTEGER;
    failed_attempts_count INTEGER;
BEGIN
    -- Count recent security events (last 24 hours)
    SELECT COUNT(*) INTO recent_events_count
    FROM security_events
    WHERE user_id = user_uuid
    AND timestamp >= NOW() - INTERVAL '24 hours';
    
    -- Count high-risk events
    SELECT COUNT(*) INTO high_risk_events_count
    FROM security_events
    WHERE user_id = user_uuid
    AND risk_score > 0.7
    AND timestamp >= NOW() - INTERVAL '24 hours';
    
    -- Count failed login attempts
    SELECT COALESCE(failed_password_attempts, 0) INTO failed_attempts_count
    FROM users
    WHERE id = user_uuid;
    
    -- Calculate risk score
    risk_score := LEAST(
        0.1 * recent_events_count + 
        0.3 * high_risk_events_count + 
        0.2 * failed_attempts_count,
        1.0
    );
    
    RETURN risk_score;
END;
$$ LANGUAGE plpgsql;

-- Function to detect suspicious activity patterns
CREATE OR REPLACE FUNCTION detect_suspicious_activity(user_uuid UUID)
RETURNS TABLE(
    is_suspicious BOOLEAN,
    reason TEXT,
    risk_score DECIMAL(3,2)
) AS $$
DECLARE
    recent_transactions_count INTEGER;
    large_withdrawals_count INTEGER;
    rapid_transactions_count INTEGER;
    concurrent_sessions_count INTEGER;
    risk_score DECIMAL(3,2) := 0.0;
    is_suspicious BOOLEAN := false;
    reason TEXT := '';
BEGIN
    -- Check for rapid transactions
    SELECT COUNT(*) INTO rapid_transactions_count
    FROM transactions
    WHERE user_id = user_uuid
    AND timestamp >= NOW() - INTERVAL '10 minutes';
    
    IF rapid_transactions_count > 5 THEN
        is_suspicious := true;
        reason := 'Rapid transaction pattern detected';
        risk_score := risk_score + 0.6;
    END IF;
    
    -- Check for large withdrawals
    SELECT COUNT(*) INTO large_withdrawals_count
    FROM transactions
    WHERE user_id = user_uuid
    AND transaction_type = 'WITHDRAWAL'
    AND amount > 50000
    AND timestamp >= NOW() - INTERVAL '1 hour';
    
    IF large_withdrawals_count > 0 THEN
        is_suspicious := true;
        reason := reason || CASE WHEN reason != '' THEN '; ' ELSE '' END || 'Large withdrawal detected';
        risk_score := risk_score + 0.7;
    END IF;
    
    -- Check for concurrent sessions
    SELECT COUNT(*) INTO concurrent_sessions_count
    FROM atm_sessions
    WHERE user_id = user_uuid
    AND is_active = true;
    
    IF concurrent_sessions_count > 3 THEN
        is_suspicious := true;
        reason := reason || CASE WHEN reason != '' THEN '; ' ELSE '' END || 'Multiple concurrent sessions';
        risk_score := risk_score + 0.5;
    END IF;
    
    RETURN QUERY SELECT is_suspicious, reason, LEAST(risk_score, 1.0);
END;
$$ LANGUAGE plpgsql;

-- Insert sample threat intelligence data
INSERT INTO threat_intelligence (ip_address, threat_level, threat_type, source) VALUES
('192.168.1.100', 'low', ARRAY['suspicious_activity'], 'internal_monitoring'),
('10.0.0.50', 'medium', ARRAY['brute_force', 'spam'], 'external_feed'),
('172.16.0.25', 'high', ARRAY['malware', 'phishing'], 'security_partner'),
('203.0.113.10', 'critical', ARRAY['ransomware', 'data_exfiltration'], 'threat_intel');

-- Create view for security dashboard
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.is_locked,
    u.failed_password_attempts,
    calculate_user_risk_score(u.id) as risk_score,
    COUNT(se.id) as security_events_24h,
    COUNT(CASE WHEN se.risk_score > 0.7 THEN 1 END) as high_risk_events_24h,
    MAX(se.timestamp) as last_security_event,
    COUNT(df.id) as trusted_devices,
    COUNT(bd.id) as biometric_methods,
    CASE WHEN gf.id IS NOT NULL THEN true ELSE false END as geo_fencing_enabled,
    CASE WHEN tr.id IS NOT NULL THEN true ELSE false END as time_restrictions_enabled
FROM users u
LEFT JOIN security_events se ON u.id = se.user_id 
    AND se.timestamp >= NOW() - INTERVAL '24 hours'
LEFT JOIN device_fingerprints df ON u.id = df.user_id AND df.is_trusted = true
LEFT JOIN biometric_data bd ON u.id = bd.user_id AND bd.is_enabled = true
LEFT JOIN geo_fencing gf ON u.id = gf.user_id AND gf.is_enabled = true
LEFT JOIN time_restrictions tr ON u.id = tr.user_id AND tr.is_enabled = true
GROUP BY u.id, u.name, u.email, u.is_locked, u.failed_password_attempts, gf.id, tr.id;

-- Grant necessary permissions
GRANT SELECT ON security_dashboard TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON biometric_data TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON device_fingerprints TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON behavioral_patterns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON geo_fencing TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON time_restrictions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON threat_intelligence TO authenticated;

-- Create security audit log function
CREATE OR REPLACE FUNCTION log_security_audit(
    p_user_id UUID,
    p_action TEXT,
    p_details TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_risk_score DECIMAL(3,2) DEFAULT 0.0
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO security_events (
        user_id,
        event_type,
        description,
        ip_address,
        user_agent,
        risk_score,
        timestamp
    ) VALUES (
        p_user_id,
        p_action,
        p_details,
        p_ip_address,
        p_user_agent,
        p_risk_score,
        NOW()
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on audit function
GRANT EXECUTE ON FUNCTION log_security_audit(UUID, TEXT, TEXT, INET, TEXT, DECIMAL) TO authenticated; 