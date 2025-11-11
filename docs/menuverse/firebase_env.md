# Firebase Environment Configuration (.env)

To ensure proper connection to Firebase services and enable interaction with test project databases (e.g., retrieving restaurants, menus), developers need to configure their environment variables using a `.env` file.

## Creating and Configuring the `.env` file

1.  **Create a `.env` file** in the root of your project directory (or `functions/` directory if applicable for Cloud Functions).

2.  **Add the following variables** to your `.env` file, replacing the placeholder values with your actual Firebase project details:

    
```
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID" # Optional, if you have Google Analytics enabled
    
```
    **Note:** The `NEXT_PUBLIC_` prefix is essential for these variables to be exposed to the client-side code in Next.js applications.

3.  **Obtain your Firebase details** from your Firebase project console. Navigate to 'Project settings' -> 'General' -> 'Your apps'. Select your web app to find the configuration details.

## Usage in Application

Your application's `src/firebase/config.ts` is configured to read these environment variables using `process.env`. This allows your application to dynamically connect to the specified Firebase project without hardcoding credentials.

**Important Security Note:** Never commit your `.env` file with actual secrets to version control. Use a `.env.example` file with placeholder values, and ensure `.env` is listed in your `.gitignore` file.