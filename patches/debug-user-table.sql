-- Debug: list all tables and columns in public schema
SELECT column_name, data_type, ordinal_position 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'User'
ORDER BY ordinal_position;

-- Also check if table is "User" or "Users"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('User', 'Users', 'user', 'users')
ORDER BY table_name;
