## SETUP INSTRUCTIONS — Run these commands to start TutorConnect

### Step 1 — Create MySQL Database
Open MySQL Workbench or XAMPP phpMyAdmin and run:
```sql
CREATE DATABASE tutorconnect;
```

### Step 2 — Install all dependencies
Open PowerShell/Terminal, navigate to the project folder, and run:

```powershell
cd "C:\Users\victu\OneDrive\Desktop\SE_CBP"
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### Step 3 — Configure environment
Edit `server/.env` and update:
- DB_PASSWORD (if your MySQL has a password)
- EMAIL_USER and EMAIL_PASS (Gmail app password)
- RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (optional for now)

### Step 4 — Run the full app
```powershell
npm run dev
```

This starts:
- Frontend at http://localhost:3000
- Backend at http://localhost:5000

### Demo Login (skip email verification)
After registering, the backend auto-creates the database tables on startup.

For admin access, register with email containing "admin@" or use the role selector in the register form.
