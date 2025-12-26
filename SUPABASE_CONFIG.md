# Supabase Configuration for Username-Based Authentication

## Important: Configure Supabase Settings

Since we're using username-based authentication with internal email addresses, you need to configure Supabase to allow this:

### Step 1: Disable Email Confirmation

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Settings** (or **Auth** → **Configuration**)
4. Find **"Enable email confirmations"** or **"Confirm email"**
5. **Disable/Turn OFF** email confirmations
6. Save the changes

This allows users to sign up without email verification, which is necessary since we're using system-generated emails.

### Step 2: (Optional) Disable Email Validation Strictness

Some Supabase projects have strict email validation. If you still see errors:

1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Look for **"Email validation"** or **"Email format validation"**
3. If available, set it to **"Loose"** or disable strict validation

### Step 3: Verify Email Template Settings

1. Go to **Authentication** → **Email Templates**
2. You can customize or disable email templates if needed
3. Since we're not sending real emails, this is optional

## Current Email Format

The system uses: `username@example.com`

- `example.com` is a reserved domain (RFC 2606) meant for documentation/examples
- This format should pass most email validations
- Users never see this email - they only use their username

## Testing

After configuring Supabase:

1. Try signing up with a new username
2. If you still see email validation errors, the format might need adjustment
3. Check Supabase logs in the dashboard for detailed error messages

## Alternative: If Email Validation Still Fails

If Supabase still rejects the email format, you may need to:

1. Use a custom domain you control
2. Or use Supabase's phone authentication instead
3. Or contact Supabase support about custom email formats

For a class project, disabling email confirmation should be sufficient.

