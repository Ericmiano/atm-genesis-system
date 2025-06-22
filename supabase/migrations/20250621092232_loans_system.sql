
-- Create a function to delete users (only callable by admins)
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id UUID)
RETURNS BOOLEAN
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
    RAISE EXCEPTION 'Only administrators can delete user accounts';
  END IF;
  
  -- Delete from users table (this will cascade to related tables)
  DELETE FROM public.users WHERE id = target_user_id;
  
  -- Delete from auth.users (this removes the authentication record)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  -- Log the admin action
  INSERT INTO public.admin_actions (admin_id, action, target_user_id, details)
  VALUES (auth.uid(), 'DELETE_USER', target_user_id, 'User account deleted by admin');
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Create a function to create users (only callable by admins)
CREATE OR REPLACE FUNCTION public.create_user_account(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  initial_balance NUMERIC DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
  new_user_id UUID;
  new_account_number TEXT;
BEGIN
  -- Check if the current user is an admin
  SELECT role INTO current_user_role 
  FROM public.users 
  WHERE id = auth.uid();
  
  IF current_user_role != 'ADMIN' THEN
    RAISE EXCEPTION 'Only administrators can create user accounts';
  END IF;
  
  -- Generate unique account number
  new_account_number := public.generate_unique_account_number();
  
  -- Create the auth user first
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;
  
  -- Create the user profile
  INSERT INTO public.users (
    id,
    account_number,
    username,
    name,
    email,
    pin,
    balance,
    card_number,
    expiry_date,
    cvv,
    card_type,
    role
  ) VALUES (
    new_user_id,
    new_account_number,
    SPLIT_PART(user_email, '@', 1),
    user_name,
    user_email,
    '0000', -- Default PIN
    initial_balance,
    '4' || LPAD((RANDOM() * 999999999999999)::BIGINT::TEXT, 15, '0'),
    TO_CHAR(NOW() + INTERVAL '4 years', 'MM/YY'),
    LPAD((RANDOM() * 999)::INT::TEXT, 3, '0'),
    'VISA',
    'USER'
  );
  
  -- Log the admin action
  INSERT INTO public.admin_actions (admin_id, action, target_user_id, details)
  VALUES (auth.uid(), 'CREATE_USER', new_user_id, 'User account created by admin: ' || user_email);
  
  RETURN new_user_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create user account: %', SQLERRM;
END;
$$;

-- Grant execute permissions to authenticated users (the function itself checks for admin role)
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_account(TEXT, TEXT, TEXT, NUMERIC) TO authenticated;
