# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## AWS Cognito Authentication Setup

This project uses AWS Cognito for user authentication. To set up authentication:

### 1. Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```env
# AWS Cognito Configuration
VITE_COGNITO_REGION=ap-northeast-2
VITE_COGNITO_USER_POOL_ID=your_user_pool_id
VITE_COGNITO_CLIENT_ID=your_client_id
VITE_COGNITO_DOMAIN=your_cognito_domain

# OAuth Configuration
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback

# AWS Configuration (for server-side operations)
VITE_AWS_REGION=ap-northeast-2
VITE_AWS_USER_POOL_ID=your_user_pool_id
VITE_AWS_USER_POOL_WEB_CLIENT_ID=your_client_id
```

### 2. Cognito Configuration

The project includes a `cognito-config.json` file with the current Cognito User Pool configuration. This file contains:

- User Pool settings and policies
- Password requirements (8+ characters, uppercase, lowercase, numbers, special characters)
- User attributes schema
- Email verification settings

### 3. Authentication Features

The authentication system includes:

- **User Registration**: Email-based signup with email verification
- **Login/Logout**: Secure authentication with JWT tokens
- **Password Reset**: Forgot password functionality with email verification
- **Google OAuth**: Social login integration (requires additional setup)
- **Session Management**: Automatic token refresh and session persistence

### 4. Authentication Components

- `LoginForm`: User login interface
- `SignUpForm`: User registration with password strength validation
- `EmailConfirmationForm`: Email verification after signup
- `ForgotPasswordForm`: Password reset request
- `ConfirmPasswordResetForm`: Password reset confirmation

### 5. Usage

The authentication is integrated into the existing Auth page (`/auth`) with a beautiful book-style interface. Users can:

1. Sign up with email, name, and nickname
2. Verify their email address
3. Log in to access the application
4. Reset their password if forgotten

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
