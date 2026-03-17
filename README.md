# 💊 MediPro — Smart Personal Health Manager

> A beautiful, mobile-first health management app built with React, TypeScript, and Supabase.

![MediPro](https://img.shields.io/badge/MediPro-v1.0.0-0ea5e9?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=for-the-badge&logo=supabase)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)

---

##  What is MediPro?

MediPro is a smart, all-in-one personal health management app designed to help you take control of your medications and wellness — right from your phone. Whether you need to track your daily medicines, analyze symptoms, or chat with an AI health assistant, MediPro has you covered.

---

## Features

### 🩺 Symptom Analyzer
Describe how you're feeling and instantly get possible conditions, severity insights, and recommended medications. Supports **voice input** — just speak your symptoms!

### 💊 Tablet Info
Search any medication from a database of **138+ Indian medicines** and get detailed information including dosage guidelines, side effects, drug interactions, and ADMET scores.

### 📋 My Medications
Build and manage your personal medication list. Add medicines directly from Tablet Info with one tap.

### ⏰ Smart Reminders
Set medication reminders with a beautiful calendar interface. Snooze, skip, or mark medications as taken. Reminders sync across devices via Supabase.

### 🤖 AI Health Assistant
Chat naturally with an AI health assistant powered by **Cohere**. Ask about symptoms, medications, or get personalized health guidance based on your saved medications.

### 🔐 Secure Authentication
Full authentication system with **email/password** and **Google Sign-In**, powered by Supabase. Every user's data is private and protected with Row Level Security.

### 👤 Profile Setup
Personalized experience with health details like age, weight, gender, and blood group.

### 🌙 Dark Mode
Beautiful sky blue & white light theme with a clean slate dark mode.

---

## 📱 Screenshots

> Mobile-first design — works perfectly on any screen size.

| Home | Symptom Analyzer | Tablet Info | Reminders |
|------|-----------------|-------------|-----------|
| Dashboard with stats | Voice-enabled symptom search | Full drug database | Smart calendar |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | Frontend framework |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Vite** | Build tool |
| **Supabase** | Authentication + Database |
| **Cohere AI** | AI Health Assistant |
| **Framer Motion** | Animations |
| **React Router** | Navigation |
| **shadcn/ui** | UI Components |
| **Vercel** | Deployment |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Cohere API key

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/medipro-app.git
cd medipro-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_COHERE_API_KEY=your_cohere_api_key
( keep your api key secured ) 
```

### 4. Set up Supabase database
Run this SQL in your Supabase SQL Editor:
```sql
-- Medications table
create table user_medications (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  medication_id text,
  name text not null,
  dosage text not null,
  frequency text not null,
  time_of_day text,
  food_relation text,
  start_date text,
  end_date text,
  refill_date text,
  quantity int,
  notes text,
  days_remaining int default 30,
  created_at timestamptz default now()
);

-- Reminders table
create table user_reminders (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  medication_name text not null,
  dosage text not null,
  time text not null,
  with_food boolean default false,
  taken boolean default false,
  skipped boolean default false,
  snoozed_to text,
  date text not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table user_medications enable row level security;
alter table user_reminders enable row level security;

create policy "Users can manage own medications"
  on user_medications for all using (auth.uid() = user_id);

create policy "Users can manage own reminders"
  on user_reminders for all using (auth.uid() = user_id);
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 📦 Build & Deploy

### Build for production
```bash
npm run build
```

### Deploy to Vercel
1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add your environment variables in Vercel project settings
4. Deploy!

Every `git push` to `main` triggers an automatic deployment. 🚀

---

## 📱 Install as PWA

MediPro is a **Progressive Web App** — you can install it on your phone like a native app!

1. Open the live URL in **Chrome** on your phone
2. Tap the **3 dots menu** → **"Add to Home Screen"**
3. Tap **Add**
4. MediPro icon appears on your home screen!

---

## 🗂️ Project Structure

```
src/
├── components/       # Reusable UI components
│   └── ui/           # shadcn/ui components
├── contexts/         # React Context (Auth, Medications, Reminders)
├── data/             # Medication database (mockdata.ts, indianMeds.ts)
├── hooks/            # Custom React hooks
├── lib/              # Supabase client
├── pages/            # App screens/pages
└── App.tsx           # Routes and app entry
```

---

## 🔒 Security

- All user data is protected with **Supabase Row Level Security (RLS)**
- Users can only access their own medications and reminders
- Authentication handled by Supabase — passwords are never stored in plain text
- Environment variables are never committed to the repository

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs via GitHub Issues
- Suggest new features
- Submit pull requests

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Built by

**Sowmya** — Built with ❤️ using React, TypeScript, and a lot of chai ☕

> ⚠️ **Disclaimer:** MediPro is for informational purposes only and is not a substitute for professional medical advice. Always consult a licensed doctor or pharmacist before taking any medication.
