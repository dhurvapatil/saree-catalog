# Saree Catalog Management System

A complete product catalog management system for saree businesses, consisting of:
- **Frontend**: Next.js 14 web application for catalog management
- **Telegram Bot**: AI-powered customer-facing bot for product browsing

## Prerequisites

- **Node.js 18 or higher** must be installed on your machine
- A **Supabase account** (free tier works fine)
- A **Telegram bot token** from @BotFather
- An **OpenRouter API key** for AI integration

---

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project and remember the project name
3. Wait for the project to finish setting up (this takes about 2 minutes)

### 2. Enable Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. No other providers are needed

### 3. Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy and paste the following SQL and click **Run**:

```sql
CREATE TABLE categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sarees (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT    NOT NULL,
  price          NUMERIC(10,2) NOT NULL,
  description    TEXT    DEFAULT '',
  category_id    uuid    REFERENCES categories(id) ON DELETE SET NULL,
  image_url      TEXT,
  fabric         TEXT,
  occasion      TEXT,
  work_type      TEXT,
  color_family   TEXT,
  status         TEXT    NOT NULL DEFAULT 'in_stock'
                           CHECK (status IN ('in_stock', 'out_of_stock', 'removed')),
  display_order  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON sarees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4. Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it exactly: `saree-images`
4. Make it **Public**
5. Click **Create bucket**

### 5. Disable Row Level Security (for demo purposes)

1. Go to **Database** → **Tables**
2. Find the `categories` table, click the three dots, select **Edit table**
3. Uncheck **Enable Row Level Security (RLS)**
4. Repeat for the `sarees` table

**⚠️ Warning**: This is fine for development/testing but NOT recommended for production. For production, implement proper RLS policies.

### 6. Get Your Supabase Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. Note down:
   - **Project URL** (this is your `SUPABASE_URL`)
   - **anon public** key (this is your `SUPABASE_ANON_KEY`)
   - **service_role** key (this is your `SUPABASE_SERVICE_ROLE_KEY`)

### 7. Set Up Frontend Environment Variables

1. Navigate to the `frontend` folder
2. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
3. Open `.env.local` and fill in your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 8. Get OpenRouter API Key

1. Go to [https://openrouter.ai](https://openrouter.ai)
2. Create a free account
3. Go to **Keys** and generate a new API key
4. Copy the key (you'll need it in the next step)

### 9. Create Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow the prompts to choose a name and username for your bot
4. Copy the **bot token** that BotFather gives you

### 10. Set Up Bot Environment Variables

1. Navigate to the `telegram-bot` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your values:
   ```
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token-from-botfather
   OPENROUTER_API_KEY=your-openrouter-api-key
   SUPABASE_URL=https://your-project-url.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 11. Install Dependencies

Open a terminal in the project root folder and run:

```bash
npm install
```

This will install dependencies for both the frontend and the bot.

### 12. Start Everything

In the same terminal, run:

```bash
npm run dev
```

This will start both:
- The Next.js website at [http://localhost:3000](http://localhost:3000)
- The Telegram bot (listening for messages)

You should see output like:
```
[frontend] ▲ Next.js 14.2.0
[frontend] - Local: http://localhost:3000
[telegram-bot] Saree Bot is running and listening for messages...
```

### 13. Create a Test User

1. Go to your Supabase dashboard
2. Go to **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Enter an email and password
5. Click **Create user**

These will be your login credentials for the website.

### 14. Test the Website

1. Open your browser and go to [http://localhost:3000](http://localhost:3000)
2. Log in with the test user credentials you just created
3. Try adding a category (click **Categories** button)
4. Try adding a saree (click **Add Saree** button)
5. Upload an image, fill in the details, and save
6. Try dragging and dropping cards to reorder them
7. Try editing a saree
8. Try changing the status of a saree

### 15. Test the Bot

1. Open Telegram
2. Search for your bot (use the username you chose)
3. Send a message like "Hello" or "Show me silk sarees"
4. The bot should respond based on the sarees you added in the website
5. Try asking about specific products, colors, occasions, etc.
6. Try saying "I want to buy this" to trigger the purchase flow

---

## How It Works

### The Website
- Business owners and employees log in with their email/password
- They can add, edit, and delete sarees
- They can upload images (stored in Supabase Storage)
- They can organize sarees into categories
- They can drag and drop to reorder products
- They can mark items as in stock, out of stock, or removed

### The Telegram Bot
- Customers message the bot on Telegram
- The bot fetches the live catalog from Supabase on every message
- It uses OpenRouter's AI (Llama 3.1) to understand questions and recommend products
- It only talks about products that actually exist in the catalog
- When a customer wants to buy, it sends a message (actual sales handoff not implemented yet)

### Real-Time Sync
- When you mark a saree as out of stock on the website, the bot knows immediately
- When you add a new saree, customers can ask the bot about it right away
- Both systems read from the same Supabase database

---

## Project Structure

```
saree-catalog/
├── package.json                    # Root monorepo config
├── README.md                       # This file
├── frontend/                       # Next.js website
│   ├── src/
│   │   ├── app/                   # Next.js 14 app directory
│   │   ├── components/            # React components
│   │   ├── lib/                   # Supabase client, auth context
│   │   └── styles/                # Global CSS
│   └── package.json
└── telegram-bot/                   # Telegram bot
    ├── src/
    │   ├── index.js               # Bot entry point
    │   ├── chatHandler.js         # AI orchestration
    │   ├── catalogFetcher.js      # Fetch catalog from Supabase
    │   └── systemPrompt.js        # Build AI prompt
    └── package.json
```

---

## Troubleshooting

### Frontend won't start
- Make sure you created `.env.local` in the `frontend` folder
- Check that your Supabase URL and anon key are correct
- Try deleting `frontend/.next` folder and running `npm run dev` again

### Bot won't respond
- Make sure you created `.env` in the `telegram-bot` folder
- Check that your bot token is correct (no extra spaces)
- Check that your OpenRouter API key is valid
- Look at the terminal output for error messages

### Images won't upload
- Make sure the storage bucket is named exactly `saree-images`
- Make sure the bucket is set to **Public**
- Check that you're using the service role key in the bot (not the anon key)

### Can't log in
- Make sure you created a user in Supabase Authentication
- Make sure RLS is disabled on both tables
- Check the browser console for error messages

---

## Next Steps

This is a demo/development setup. For production deployment, you should:

1. **Enable RLS**: Implement proper Row Level Security policies in Supabase
2. **Add user roles**: Distinguish between admin and employee access levels
3. **Implement actual purchase flow**: Connect to a payment gateway or CRM
4. **Deploy the frontend**: Use Vercel, Netlify, or any Node.js hosting
5. **Deploy the bot**: Use a VPS, Railway, or any Node.js hosting that supports long-running processes
6. **Add image optimization**: Compress images before upload
7. **Add analytics**: Track which products customers ask about most
8. **Add more bot features**: Product search, filters, image sharing, etc.

---

## Support

If you run into issues:
1. Check the terminal output for error messages
2. Check the browser console (F12) for frontend errors
3. Make sure all environment variables are set correctly
4. Make sure the database tables were created successfully
5. Make sure the storage bucket exists and is public

---

## License

This project is provided as-is for demonstration purposes.
