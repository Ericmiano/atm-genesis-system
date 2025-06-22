
-- First, let's create a better function for generating unique account numbers
CREATE OR REPLACE FUNCTION public.generate_unique_account_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_account_number TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    -- Generate account number with random component and counter
    new_account_number := LPAD(((EXTRACT(EPOCH FROM NOW())::BIGINT + counter) % 10000000000)::TEXT, 10, '0');
    
    -- Check if this account number already exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE account_number = new_account_number) THEN
      RETURN new_account_number;
    END IF;
    
    -- Increment counter and try again
    counter := counter + 1;
    
    -- Safety exit after 100 attempts
    IF counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique account number after 100 attempts';
    END IF;
  END LOOP;
END;
$$;

-- Update the trigger function to use the new account number generator
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
    public.generate_unique_account_number(),
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

-- Now create the demo users with a small delay to ensure unique account numbers
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES 
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'john@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Small delay before inserting second user
SELECT pg_sleep(0.1);

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES 
(
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Update the admin user with proper role and demo data
UPDATE public.users 
SET role = 'ADMIN', 
    name = 'Admin User',
    balance = 50000.00,
    credit_score = 800,
    monthly_income = 100000.00
WHERE email = 'admin@example.com';

-- Update the regular user with demo data
UPDATE public.users 
SET name = 'John Doe',
    balance = 25000.00,
    credit_score = 750,
    monthly_income = 50000.00
WHERE email = 'john@example.com';

-- Add some sample transaction history for John
INSERT INTO public.transactions (user_id, type, amount, description, timestamp) 
SELECT 
  id,
  'DEPOSIT',
  25000.00,
  'Initial deposit',
  NOW() - INTERVAL '5 days'
FROM public.users WHERE email = 'john@example.com';

INSERT INTO public.transactions (user_id, type, amount, description, timestamp) 
SELECT 
  id,
  'WITHDRAWAL',
  5000.00,
  'Cash withdrawal',
  NOW() - INTERVAL '2 days'
FROM public.users WHERE email = 'john@example.com';
