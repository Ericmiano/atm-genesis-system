
-- Create 15 test users for admin testing
DO $$
DECLARE
    i INTEGER;
    user_id UUID;
    test_users TEXT[][] := ARRAY[
        ['John Doe', 'john.doe@example.com'],
        ['Jane Smith', 'jane.smith@example.com'],
        ['Michael Johnson', 'michael.johnson@example.com'],
        ['Sarah Wilson', 'sarah.wilson@example.com'],
        ['David Brown', 'david.brown@example.com'],
        ['Emma Davis', 'emma.davis@example.com'],
        ['James Miller', 'james.miller@example.com'],
        ['Lisa Garcia', 'lisa.garcia@example.com'],
        ['Robert Martinez', 'robert.martinez@example.com'],
        ['Maria Rodriguez', 'maria.rodriguez@example.com'],
        ['William Anderson', 'william.anderson@example.com'],
        ['Jennifer Taylor', 'jennifer.taylor@example.com'],
        ['Christopher Thomas', 'christopher.thomas@example.com'],
        ['Ashley Jackson', 'ashley.jackson@example.com'],
        ['Daniel White', 'daniel.white@example.com']
    ];
BEGIN
    FOR i IN 1..15 LOOP
        -- Create user account using the existing function
        SELECT public.create_user_account(
            test_users[i][2], -- email
            'TestPass123!', -- default password
            test_users[i][1], -- name
            ROUND((RANDOM() * 50000 + 1000)::NUMERIC, 2) -- random balance between 1000-51000
        ) INTO user_id;
        
        -- Create user profile
        INSERT INTO public.user_profiles (
            user_id,
            phone_number,
            date_of_birth,
            gender,
            nationality,
            kyc_status,
            account_tier
        ) VALUES (
            user_id,
            '+254' || LPAD((RANDOM() * 999999999)::BIGINT::TEXT, 9, '0'),
            DATE '1980-01-01' + (RANDOM() * 15000)::INTEGER,
            CASE WHEN RANDOM() > 0.5 THEN 'Male' ELSE 'Female' END,
            'Kenyan',
            CASE 
                WHEN RANDOM() > 0.7 THEN 'verified'
                WHEN RANDOM() > 0.4 THEN 'pending'
                ELSE 'incomplete'
            END,
            CASE 
                WHEN RANDOM() > 0.8 THEN 'premium'
                WHEN RANDOM() > 0.5 THEN 'standard'
                ELSE 'basic'
            END
        );
        
        -- Create some random transactions for each user
        FOR j IN 1..(RANDOM() * 5 + 1)::INTEGER LOOP
            INSERT INTO public.transactions (
                user_id,
                type,
                amount,
                description,
                timestamp,
                status
            ) VALUES (
                user_id,
                CASE (RANDOM() * 4)::INTEGER
                    WHEN 0 THEN 'DEPOSIT'
                    WHEN 1 THEN 'WITHDRAWAL'
                    WHEN 2 THEN 'TRANSFER'
                    ELSE 'BILL_PAYMENT'
                END,
                ROUND((RANDOM() * 5000 + 100)::NUMERIC, 2),
                'Test transaction ' || j,
                NOW() - (RANDOM() * INTERVAL '30 days'),
                CASE WHEN RANDOM() > 0.1 THEN 'SUCCESS' ELSE 'FAILED' END
            );
        END LOOP;
        
        -- Randomly lock some users for testing
        IF RANDOM() > 0.85 THEN
            UPDATE public.users 
            SET is_locked = true, 
                lock_reason = 'Test lock for admin demonstration',
                lock_date = NOW()
            WHERE id = user_id;
        END IF;
        
        -- Create some loan applications
        IF RANDOM() > 0.6 THEN
            INSERT INTO public.loans (
                user_id,
                type,
                principal,
                interest_rate,
                term_months,
                monthly_payment,
                total_amount,
                remaining_balance,
                purpose,
                status
            ) VALUES (
                user_id,
                CASE (RANDOM() * 3)::INTEGER
                    WHEN 0 THEN 'PERSONAL'
                    WHEN 1 THEN 'BUSINESS'
                    ELSE 'EMERGENCY'
                END,
                ROUND((RANDOM() * 100000 + 5000)::NUMERIC, 2),
                ROUND((RANDOM() * 10 + 5)::NUMERIC, 2),
                (RANDOM() * 36 + 6)::INTEGER,
                ROUND((RANDOM() * 5000 + 500)::NUMERIC, 2),
                ROUND((RANDOM() * 150000 + 10000)::NUMERIC, 2),
                ROUND((RANDOM() * 100000 + 5000)::NUMERIC, 2),
                'Test loan application',
                CASE 
                    WHEN RANDOM() > 0.7 THEN 'APPROVED'
                    WHEN RANDOM() > 0.4 THEN 'PENDING'
                    ELSE 'REJECTED'
                END
            );
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Successfully created 15 test users with profiles, transactions, and loans';
END $$;

-- Create additional admin functions for enhanced capabilities
CREATE OR REPLACE FUNCTION public.lock_user_account(target_user_id uuid, reason text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
BEGIN
  -- Check if the current user is an admin
  SELECT role INTO current_user_role 
  FROM public.users 
  WHERE id = auth.uid();
  
  IF current_user_role != 'ADMIN' THEN
    RAISE EXCEPTION 'Only administrators can lock user accounts';
  END IF;
  
  -- Lock the user account
  UPDATE public.users 
  SET is_locked = true, 
      lock_reason = reason,
      lock_date = NOW()
  WHERE id = target_user_id;
  
  -- Log the admin action
  INSERT INTO public.admin_actions (admin_id, action, target_user_id, details, reason)
  VALUES (auth.uid(), 'LOCK_USER', target_user_id, 'User account locked by admin', reason);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.unlock_user_account(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
BEGIN
  -- Check if the current user is an admin
  SELECT role INTO current_user_role 
  FROM public.users 
  WHERE id = auth.uid();
  
  IF current_user_role != 'ADMIN' THEN
    RAISE EXCEPTION 'Only administrators can unlock user accounts';
  END IF;
  
  -- Unlock the user account
  UPDATE public.users 
  SET is_locked = false, 
      lock_reason = NULL,
      lock_date = NULL,
      failed_attempts = 0,
      failed_password_attempts = 0
  WHERE id = target_user_id;
  
  -- Log the admin action
  INSERT INTO public.admin_actions (admin_id, action, target_user_id, details)
  VALUES (auth.uid(), 'UNLOCK_USER', target_user_id, 'User account unlocked by admin');
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.adjust_user_balance(target_user_id uuid, adjustment_amount numeric, reason text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
  current_balance numeric;
  new_balance numeric;
BEGIN
  -- Check if the current user is an admin
  SELECT role INTO current_user_role 
  FROM public.users 
  WHERE id = auth.uid();
  
  IF current_user_role != 'ADMIN' THEN
    RAISE EXCEPTION 'Only administrators can adjust user balances';
  END IF;
  
  -- Get current balance
  SELECT balance INTO current_balance 
  FROM public.users 
  WHERE id = target_user_id;
  
  -- Calculate new balance
  new_balance := current_balance + adjustment_amount;
  
  -- Prevent negative balances unless it's a deduction
  IF new_balance < 0 AND adjustment_amount > 0 THEN
    RAISE EXCEPTION 'Adjustment would result in negative balance';
  END IF;
  
  -- Update user balance
  UPDATE public.users 
  SET balance = new_balance,
      updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Create transaction record
  INSERT INTO public.transactions (
    user_id, 
    type, 
    amount, 
    description, 
    status
  ) VALUES (
    target_user_id,
    CASE WHEN adjustment_amount > 0 THEN 'DEPOSIT' ELSE 'WITHDRAWAL' END,
    ABS(adjustment_amount),
    'Admin balance adjustment: ' || reason,
    'SUCCESS'
  );
  
  -- Log the admin action
  INSERT INTO public.admin_actions (admin_id, action, target_user_id, details, reason)
  VALUES (auth.uid(), 'ADJUST_BALANCE', target_user_id, 
          'Balance adjusted by ' || adjustment_amount || ' (from ' || current_balance || ' to ' || new_balance || ')', 
          reason);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.change_user_role(target_user_id uuid, new_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
  old_role user_role;
BEGIN
  -- Check if the current user is an admin
  SELECT role INTO current_user_role 
  FROM public.users 
  WHERE id = auth.uid();
  
  IF current_user_role != 'ADMIN' THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;
  
  -- Get current role
  SELECT role INTO old_role 
  FROM public.users 
  WHERE id = target_user_id;
  
  -- Update user role
  UPDATE public.users 
  SET role = new_role,
      updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Log the admin action
  INSERT INTO public.admin_actions (admin_id, action, target_user_id, details)
  VALUES (auth.uid(), 'CHANGE_ROLE', target_user_id, 
          'Role changed from ' || old_role || ' to ' || new_role);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;
