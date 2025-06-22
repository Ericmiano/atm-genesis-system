-- Analytics System Migration
-- This migration adds comprehensive analytics capabilities to the ATM Genesis System

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT,
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    duration INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_behavior table
CREATE TABLE IF NOT EXISTS user_behavior (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    page_views JSONB DEFAULT '[]',
    actions JSONB DEFAULT '[]',
    session_duration INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    aggregation_period TEXT DEFAULT 'hourly',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_intelligence table
CREATE TABLE IF NOT EXISTS business_intelligence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    report_type TEXT NOT NULL,
    user_growth JSONB DEFAULT '{}',
    revenue_metrics JSONB DEFAULT '{}',
    engagement_metrics JSONB DEFAULT '{}',
    conversion_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_date, report_type)
);

-- Create analytics_reports table
CREATE TABLE IF NOT EXISTS analytics_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_name TEXT NOT NULL,
    report_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    summary TEXT,
    metrics JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    charts JSONB DEFAULT '[]',
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create real_time_metrics table
CREATE TABLE IF NOT EXISTS real_time_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_key TEXT NOT NULL,
    metric_value JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ttl TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON user_behavior(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_session_id ON user_behavior(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_business_intelligence_date ON business_intelligence(report_date);
CREATE INDEX IF NOT EXISTS idx_business_intelligence_type ON business_intelligence(report_type);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_date_range ON analytics_reports(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_key ON real_time_metrics(metric_key);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_timestamp ON real_time_metrics(timestamp);

-- Create RLS policies for analytics tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_metrics ENABLE ROW LEVEL SECURITY;

-- Analytics events policies
CREATE POLICY "Users can view their own analytics events" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics events" ON analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics events" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- User behavior policies
CREATE POLICY "Users can view their own behavior data" ON user_behavior
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behavior data" ON user_behavior
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own behavior data" ON user_behavior
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all behavior data" ON user_behavior
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Performance metrics policies (admin only)
CREATE POLICY "Admins can view performance metrics" ON performance_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert performance metrics" ON performance_metrics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Business intelligence policies (admin only)
CREATE POLICY "Admins can view business intelligence" ON business_intelligence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert business intelligence" ON business_intelligence
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Analytics reports policies
CREATE POLICY "Users can view their own reports" ON analytics_reports
    FOR SELECT USING (auth.uid() = generated_by);

CREATE POLICY "Users can insert their own reports" ON analytics_reports
    FOR INSERT WITH CHECK (auth.uid() = generated_by);

CREATE POLICY "Admins can view all reports" ON analytics_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Real-time metrics policies (admin only)
CREATE POLICY "Admins can view real-time metrics" ON real_time_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert real-time metrics" ON real_time_metrics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Create functions for analytics operations
CREATE OR REPLACE FUNCTION update_user_behavior_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_behavior_updated_at 
    BEFORE UPDATE ON user_behavior 
    FOR EACH ROW EXECUTE FUNCTION update_user_behavior_updated_at();

-- Function to calculate user engagement score
CREATE OR REPLACE FUNCTION calculate_user_engagement_score(user_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    engagement_score DECIMAL(3,2) := 0.0;
    session_count INTEGER;
    avg_session_duration INTEGER;
    action_count INTEGER;
    recent_activity_days INTEGER;
BEGIN
    -- Count sessions in last 30 days
    SELECT COUNT(*) INTO session_count
    FROM user_behavior
    WHERE user_id = user_uuid
    AND start_time >= NOW() - INTERVAL '30 days';
    
    -- Average session duration
    SELECT COALESCE(AVG(session_duration), 0) INTO avg_session_duration
    FROM user_behavior
    WHERE user_id = user_uuid
    AND start_time >= NOW() - INTERVAL '30 days';
    
    -- Count actions in last 30 days
    SELECT COALESCE(SUM(jsonb_array_length(actions)), 0) INTO action_count
    FROM user_behavior
    WHERE user_id = user_uuid
    AND start_time >= NOW() - INTERVAL '30 days';
    
    -- Days since last activity
    SELECT COALESCE(EXTRACT(DAY FROM NOW() - MAX(start_time)), 30) INTO recent_activity_days
    FROM user_behavior
    WHERE user_id = user_uuid;
    
    -- Calculate engagement score
    engagement_score := LEAST(
        (session_count * 0.3) + 
        (avg_session_duration / 1000 * 0.2) + 
        (action_count * 0.1) + 
        (GREATEST(0, 30 - recent_activity_days) * 0.4),
        1.0
    );
    
    RETURN engagement_score;
END;
$$ LANGUAGE plpgsql;

-- Function to get user behavior insights
CREATE OR REPLACE FUNCTION get_user_behavior_insights(user_uuid UUID)
RETURNS TABLE(
    total_sessions INTEGER,
    avg_session_duration INTEGER,
    favorite_pages TEXT[],
    common_actions TEXT[],
    engagement_score DECIMAL(3,2),
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    total_sessions_count INTEGER;
    avg_duration INTEGER;
    favorite_pages_array TEXT[];
    common_actions_array TEXT[];
    engagement_score_val DECIMAL(3,2);
    last_activity_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Count total sessions
    SELECT COUNT(*) INTO total_sessions_count
    FROM user_behavior
    WHERE user_id = user_uuid;
    
    -- Average session duration
    SELECT COALESCE(AVG(session_duration), 0) INTO avg_duration
    FROM user_behavior
    WHERE user_id = user_uuid;
    
    -- Get favorite pages (simplified)
    SELECT ARRAY['dashboard', 'transactions', 'settings'] INTO favorite_pages_array;
    
    -- Get common actions (simplified)
    SELECT ARRAY['view_balance', 'make_transaction', 'check_history'] INTO common_actions_array;
    
    -- Calculate engagement score
    SELECT calculate_user_engagement_score(user_uuid) INTO engagement_score_val;
    
    -- Last activity
    SELECT MAX(start_time) INTO last_activity_time
    FROM user_behavior
    WHERE user_id = user_uuid;
    
    RETURN QUERY SELECT 
        total_sessions_count,
        avg_duration,
        favorite_pages_array,
        common_actions_array,
        engagement_score_val,
        last_activity_time;
END;
$$ LANGUAGE plpgsql;

-- Function to generate daily analytics summary
CREATE OR REPLACE FUNCTION generate_daily_analytics_summary(report_date DATE)
RETURNS JSONB AS $$
DECLARE
    summary JSONB;
    total_users INTEGER;
    active_users INTEGER;
    total_transactions INTEGER;
    total_amount DECIMAL(12,2);
    avg_session_duration INTEGER;
BEGIN
    -- Get user metrics
    SELECT COUNT(*) INTO total_users FROM users;
    
    SELECT COUNT(DISTINCT user_id) INTO active_users
    FROM analytics_events
    WHERE DATE(timestamp) = report_date;
    
    -- Get transaction metrics
    SELECT COUNT(*), COALESCE(SUM(amount), 0) INTO total_transactions, total_amount
    FROM transactions
    WHERE DATE(timestamp) = report_date;
    
    -- Get session metrics
    SELECT COALESCE(AVG(session_duration), 0) INTO avg_session_duration
    FROM user_behavior
    WHERE DATE(start_time) = report_date;
    
    -- Build summary
    summary := jsonb_build_object(
        'date', report_date,
        'total_users', total_users,
        'active_users', active_users,
        'total_transactions', total_transactions,
        'total_amount', total_amount,
        'avg_session_duration', avg_session_duration,
        'generated_at', NOW()
    );
    
    RETURN summary;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete old analytics events (older than 1 year)
    DELETE FROM analytics_events 
    WHERE timestamp < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete old performance metrics (older than 6 months)
    DELETE FROM performance_metrics 
    WHERE timestamp < NOW() - INTERVAL '6 months';
    
    -- Delete old real-time metrics (older than 1 day)
    DELETE FROM real_time_metrics 
    WHERE timestamp < NOW() - INTERVAL '1 day';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create view for analytics dashboard
CREATE OR REPLACE VIEW analytics_dashboard AS
SELECT 
    DATE(timestamp) as date,
    COUNT(*) as total_events,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(CASE WHEN event_type = 'PAGE_VIEW' THEN 1 END) as page_views,
    COUNT(CASE WHEN event_type = 'USER_ACTION' THEN 1 END) as user_actions,
    COUNT(CASE WHEN event_type = 'TRANSACTION' THEN 1 END) as transactions,
    COUNT(CASE WHEN event_type = 'ERROR' THEN 1 END) as errors,
    AVG(duration) as avg_duration,
    COUNT(CASE WHEN success = false THEN 1 END) as failures
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Create view for user engagement metrics
CREATE OR REPLACE VIEW user_engagement_metrics AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    calculate_user_engagement_score(u.id) as engagement_score,
    COUNT(ub.id) as total_sessions,
    AVG(ub.session_duration) as avg_session_duration,
    MAX(ub.start_time) as last_activity,
    COUNT(ae.id) as total_events
FROM users u
LEFT JOIN user_behavior ub ON u.id = ub.user_id
LEFT JOIN analytics_events ae ON u.id = ae.user_id
GROUP BY u.id, u.name, u.email;

-- Insert sample analytics data
INSERT INTO analytics_events (user_id, event_type, event_name, properties, session_id) VALUES
(gen_random_uuid(), 'PAGE_VIEW', 'Dashboard', '{"page": "dashboard", "duration": 5000}', 'session_1'),
(gen_random_uuid(), 'USER_ACTION', 'View Balance', '{"action": "view_balance", "duration": 1000}', 'session_1'),
(gen_random_uuid(), 'TRANSACTION', 'Withdrawal', '{"amount": 5000, "type": "withdrawal"}', 'session_2'),
(gen_random_uuid(), 'PAGE_VIEW', 'Transactions', '{"page": "transactions", "duration": 3000}', 'session_2');

-- Insert sample performance metrics
INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, aggregation_period) VALUES
('response_time', 250.5, 'ms', 'hourly'),
('error_rate', 0.02, 'percentage', 'hourly'),
('throughput', 150.0, 'requests_per_minute', 'hourly'),
('availability', 99.9, 'percentage', 'hourly');

-- Grant necessary permissions
GRANT SELECT ON analytics_dashboard TO authenticated;
GRANT SELECT ON user_engagement_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_behavior TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON performance_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON business_intelligence TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON real_time_metrics TO authenticated;

-- Create analytics tracking function
CREATE OR REPLACE FUNCTION track_analytics_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_event_name TEXT,
    p_properties JSONB DEFAULT '{}',
    p_session_id TEXT DEFAULT NULL,
    p_page_url TEXT DEFAULT NULL,
    p_duration INTEGER DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO analytics_events (
        user_id,
        event_type,
        event_name,
        properties,
        session_id,
        page_url,
        duration,
        success,
        error_message,
        timestamp
    ) VALUES (
        p_user_id,
        p_event_type,
        p_event_name,
        p_properties,
        p_session_id,
        p_page_url,
        p_duration,
        p_success,
        p_error_message,
        NOW()
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on tracking function
GRANT EXECUTE ON FUNCTION track_analytics_event(UUID, TEXT, TEXT, JSONB, TEXT, TEXT, INTEGER, BOOLEAN, TEXT) TO authenticated; 