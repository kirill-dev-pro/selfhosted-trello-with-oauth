# Klaud.me OAuth OIDC Setup Guide

This guide will walk you through setting up Klaud.me as your OAuth OIDC provider for Taski, enabling secure authentication for your team.

## What is Klaud.me?

Klaud.me is a free, open-source identity provider that supports OAuth 2.0 and OpenID Connect (OIDC). It's perfect for teams who want enterprise-grade authentication without the complexity or cost.

## Prerequisites

- A Klaud.me account (free)
- Your Taski installation (self-hosted or using our hosted version)
- Basic understanding of OAuth/OIDC concepts

## Step 1: Create Your Klaud.me Account

1. Visit [https://klaud.me](https://klaud.me)
2. Click **"Sign Up"** to create your free account
3. Verify your email address
4. Complete your profile setup

## Step 2: Create an Organization

1. After logging in, click **"Create Organization"**
2. Choose a unique organization name (this will be part of your identity provider URL)
3. Add a description for your organization
4. Set your organization settings:
   - **Domain**: Your organization's domain (optional)
   - **Logo**: Upload your organization logo (optional)
   - **Branding**: Customize colors and themes

## Step 3: Create an OAuth Application

1. Navigate to **"Applications"** in your Klaud.me dashboard
2. Click **"Create Application"**
3. Fill in the application details:
   - **Name**: `Taski`
   - **Description**: `Project Management and Wiki System`
   - **Application Type**: `Web Application`
   - **Grant Types**: Select `Authorization Code` and `Refresh Token`

## Step 4: Configure Redirect URIs

Add the following redirect URIs based on your Taski deployment:

### For Self-Hosted Taski
```
https://your-domain.com/api/auth/callback/oidc
https://your-domain.com/auth/signin
```

### For Hosted Taski
```
https://app.taski.dev/api/auth/callback/oidc
https://app.taski.dev/auth/signin
```

Replace `your-domain.com` with your actual domain.

## Step 5: Configure Scopes

Enable the following scopes for your application:
- `openid` (required)
- `profile` (required)
- `email` (required)
- `groups` (optional, for role-based access)

## Step 6: Get Your OAuth Credentials

After creating the application, you'll receive:
- **Client ID**: `klaud_xxxxxxxxxxxxxxxxx`
- **Client Secret**: `klaud_secret_xxxxxxxxxxxxxxxxx`
- **Issuer URL**: `https://your-org.klaud.me`

⚠️ **Important**: Store these credentials securely. Never commit them to version control.

## Step 7: Configure Taski Environment Variables

Add the following environment variables to your Taski configuration:

### For Self-Hosted Taski

Create or update your `.env.local` file:

```bash
# Klaud.me OAuth Configuration
AUTH_OIDC_ID=your_client_id_here
AUTH_OIDC_SECRET=your_client_secret_here
AUTH_OIDC_ISSUER=https://your-org.klaud.me
AUTH_OIDC_NAME="Sign in with Klaud"

# Auth.js Configuration
AUTH_SECRET=your_random_secret_here
AUTH_URL=https://your-domain.com

# Database Configuration (if using PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/taski
```

### For Hosted Taski

Contact our support team with your OAuth credentials, and we'll configure them for your hosted instance.

## Step 8: Test the Integration

1. Restart your Taski application (if self-hosted)
2. Navigate to the sign-in page
3. You should see a **"Sign in with Klaud"** button
4. Click it and verify the OAuth flow works correctly
5. Complete the authorization on Klaud.me
6. Verify you're redirected back to Taski and logged in

## Step 9: Invite Team Members

### Method 1: Direct Invitation in Klaud.me
1. Go to your Klaud.me organization dashboard
2. Navigate to **"Users"**
3. Click **"Invite Users"**
4. Enter email addresses of team members
5. Set appropriate roles and permissions

### Method 2: Self-Registration
1. Share your organization's Klaud.me sign-up link: `https://your-org.klaud.me/signup`
2. Team members can create accounts and request access
3. Approve requests in your Klaud.me dashboard

## Advanced Configuration

### Custom Claims and Groups

You can map Klaud.me groups to Taski roles:

1. In Klaud.me, create groups like:
   - `taski-admins`
   - `taski-members`
   - `taski-viewers`

2. Configure group mapping in Taski (see your environment configuration)

### Single Sign-On (SSO)

To enforce SSO and disable password authentication:

```bash
# Add to your .env.local
AUTH_DISABLE_SIGNUP=true
AUTH_FORCE_OIDC=true
```

### Custom Branding

Customize the OAuth flow appearance:
1. Upload your logo to Klaud.me
2. Set brand colors matching your organization
3. Configure custom login page messages

## Troubleshooting

### Common Issues

**"Invalid Redirect URI" Error**
- Verify your redirect URIs exactly match what's configured in Klaud.me
- Ensure you're using HTTPS in production
- Check for trailing slashes

**"Invalid Client" Error**
- Verify your Client ID and Client Secret are correct
- Ensure your application is enabled in Klaud.me
- Check that your issuer URL is correct

**Users Can't Access After Login**
- Verify user email addresses match between Klaud.me and Taski
- Check that users have appropriate permissions in your organization
- Ensure email verification is completed in Klaud.me

### Getting Help

- **Klaud.me Documentation**: [https://docs.klaud.me](https://docs.klaud.me)
- **Klaud.me Support**: [support@klaud.me](mailto:support@klaud.me)
- **Taski Community**: [GitHub Discussions](https://github.com/your-repo/taski/discussions)

## Security Best Practices

1. **Rotate Secrets Regularly**: Update your Client Secret every 90 days
2. **Use Strong Auth Secret**: Generate a random 32+ character AUTH_SECRET
3. **Enable 2FA**: Require two-factor authentication for admin accounts
4. **Audit Access**: Regularly review user access and permissions
5. **Monitor Logs**: Keep track of authentication attempts and failures

## Cost and Limits

Klaud.me free tier includes:
- Up to 100 users
- Unlimited applications
- Basic support
- 99.9% uptime SLA

For larger organizations, check Klaud.me's pricing page for enterprise features.

---

**Sponsored by Klaud.me** - This guide is maintained in partnership with Klaud.me to provide the best OAuth OIDC experience for Taski users. 