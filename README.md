<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5fd7dece-aa0d-429d-8587-fc20173f2487

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment / CORS

- The frontend calls the backend API at `/api` by default. If your backend is hosted on a separate domain (for example `https://api.example.com`), set the Vite env var `VITE_API_BASE` to that base URL when building the frontend (for Vercel add an environment variable `VITE_API_BASE=https://api.example.com`).
- The backend now enables CORS using the `APP_URL` env var. Make sure `APP_URL` is set to your frontend URL (for example `https://rilastore.vercel.app`) so the deployed frontend can make cross-origin requests.

After changing environment variables on your host (Vercel or similar), rebuild and redeploy the frontend so `VITE_API_BASE` is baked into the build.

## Password Reset Email

The Forgot Password flow sends a six-digit, one-time verification code that expires after 15 minutes. Configure these backend environment variables before enabling it in production:

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=RILA Store <no-reply@example.com>
```

The password is stored as a hash after the verification code is accepted. Never commit SMTP credentials or other secrets to Git.
