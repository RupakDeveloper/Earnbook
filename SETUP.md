# EarnBook by RUPAK — fresh project

## Included
- Mobile-first ENTER screen, then Login / Sign Up.
- Subtle synthesized click sounds (no music file and no sound toggle).
- Supabase email/password authentication.
- Personal earnings, received payments, pending amount and private expenses.
- Instagram: @rupak_nathh
- WhatsApp: +91 9954169799
- Two-font identity: Manrope + DM Sans; EB monogram.

## 1. Create a new Supabase project
1. Open https://supabase.com/dashboard and create a NEW project.
2. Save the database password privately.
3. Open SQL Editor in the new project.
4. Open `supabase/schema.sql`, copy all SQL and run it.
5. Open Project Settings → API. Copy the Project URL and anon/public key.

## 2. Configure the website
1. Install Node.js (LTS) on your computer.
2. Extract this ZIP.
3. Open the extracted `earnbook-by-rupak` folder in VS Code.
4. Create a file named `.env` in the root folder (same level as package.json).
5. Add these two lines, replacing the values with your own:
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
6. Open VS Code Terminal and run:
   npm install
   npm run dev
7. For production test, run:
   npm run build

## 3. Deploy to Cloudflare Pages
- Push the project files to a NEW GitHub repository.
- In Cloudflare → Workers & Pages → Create → Pages → Connect to Git.
- Build command: `npm run build`
- Build output directory: `dist`
- Add the same two environment variables from `.env` in Cloudflare Pages → Settings → Variables and Secrets.
- Deploy. Choose project name `earnbook` if the name is available; then the URL will be `https://earnbook.pages.dev`.

## 4. Supabase Auth URL settings
In Supabase → Authentication → URL Configuration:
- Set Site URL to your final Cloudflare Pages URL.
- Add that URL to Redirect URLs.

## Important notes
- The website cannot access any other user's private ledger because Row Level Security is enabled.
- The `anon`/publishable key is intended for browser use with RLS enabled. Never put a `service_role` or secret key in frontend code.
- Email confirmation may need to be turned off in Supabase Auth settings during early testing, or users must confirm their email before logging in.
- Current starter stores earnings as individual records. “Received” payments are allocated against oldest pending earnings first.
- Expense validation in the interface prevents expenses greater than the current received-after-expenses balance. For a production financial ledger, also add a database-side transaction/RPC for atomic validation to prevent simultaneous-tab race conditions.
