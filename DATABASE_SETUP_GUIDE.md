# Workshop Registration Database Setup Guide

## Overview
Your workshop forms need a backend to store registrations. Here are the best options for your static site setup:

---

## Option 1: Google Sheets + Apps Script (✅ RECOMMENDED - Already Configured)

**Setup Time:** 5 minutes  
**Cost:** Free  
**Best For:** Quick setup, no server management

### Step 1: Create Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create **NEW** sheet named `Workshop Registrations`
3. Add headers in Row 1:

```
Timestamp | Name | Email | Phone | Institution | Department | Level | Workshop | Registration Type | Amount | Payment Method | Transaction ID | Reference | Notes | Status
```

### Step 2: Create Apps Script
1. In the same sheet, click **Extensions → Apps Script**
2. Replace the code with:

```javascript
const SHEET_ID = '14XjqWwwlXenX7g5x6jFrnPm80uWExK4ySKM46Fxzb8A';

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getActiveSheet();
    const body = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const data = JSON.parse(body);
    
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.institution || '',
      data.department || '',
      data.level || '',
      data.workshop || '',
      data.registrationType || data.regType || '',
      data.amount || 0,
      data.paymentMethod || '',
      data.transactionId || '',
      data.reference || '',
      data.notes || '',
      'Pending'
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, id: sheet.getLastRow()}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    Logger.log(err);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Step 3: Deploy
1. Click **Deploy → New deployment**
2. Select **Type → Web app**
3. Execute as: Your email
4. Who has access: **Anyone**
5. Click **Deploy**
6. ⭐ **Copy the deployment URL** (looks like `https://script.google.com/macros/d/...exec`)

### Step 4: Reference in Forms
Update this line in both `kaggle_workshop_form.html` and `linkedin_workshop_form.html`:

```javascript
const SHEETS_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```

Replace with your actual URL from Step 3.

---

## Option 2: Firebase (Cloud Firestore)

**Setup Time:** 10 minutes  
**Cost:** Free tier included  
**Best For:** Real-time database, scalable

### Step 1: Create Firebase Project
1. Go to [firebase.google.com](https://firebase.google.com)
2. Click **Go to console → Add project**
3. Name: `vector-research-workshops`
4. Enable **Google Analytics** (optional)
5. Create project

### Step 2: Set Up Firestore
1. In left menu: **Build → Firestore Database**
2. Click **Create database**
3. Start in **test mode** (for development)
4. Choose region: `asia-south1` (closest to Bangladesh)
5. Create

### Step 3: Get Configuration
1. Go to **Project settings** (⚙️ icon)
2. Under **Your apps**, click **Web** icon
3. Register app name: `Workshop Registrations`
4. Copy the configuration object

### Step 4: Update Form Code
Add to form's `<head>`:

```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"></script>
```

Update form submission:

```javascript
// Initialize Firebase
const firebaseConfig = {
  // Paste your config from Step 3 here
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// In submit function
async function submitWorkshopForm(formData) {
  try {
    await db.collection('registrations').add({
      ...formData,
      timestamp: new Date(),
      workshop: 'Kaggle / LinkedIn',
      status: 'Pending'
    });
    showSuccess();
  } catch(error) {
    console.error('Error:', error);
  }
}
```

---

## Option 3: Supabase (PostgreSQL as a Service)

**Setup Time:** 15 minutes  
**Cost:** Free tier (500MB DB)  
**Best For:** Full relational database, production-grade

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up with Google
3. Create new project
4. Name: `vector-research-labs`
5. Generate secure password
6. Choose region: `Singapore` (closest)

### Step 2: Create Table
Go to **SQL Editor**, run:

```sql
CREATE TABLE workshop_registrations (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  institution VARCHAR(255),
  department VARCHAR(255),
  level VARCHAR(100),
  workshop VARCHAR(100),
  registration_type VARCHAR(50),
  amount DECIMAL(10,2),
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  reference_number VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Pending'
);

CREATE INDEX idx_email ON workshop_registrations(email);
CREATE INDEX idx_workshop ON workshop_registrations(workshop);
```

### Step 3: Get API Keys
1. Go to **Settings → API**
2. Copy `Project URL` and `anon` key

### Step 4: Update Form
```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_KEY = 'YOUR_ANON_KEY';

async function submitForm(formData) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/workshop_registrations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify(formData)
    }
  );
  return response.json();
}
```

---

## Option 4: Custom Node.js Backend

**Setup Time:** 30 minutes  
**Cost:** $5-10/month (hosting)  
**Best For:** Full control, custom logic

Use Vercel's serverless functions to create an endpoint that stores data.

---

## Comparison Table

| Feature | Google Sheets | Firebase | Supabase | Custom |
|---------|--------------|----------|----------|--------|
| Setup Time | 5 min | 10 min | 15 min | 30+ min |
| Cost | Free | Free | Free | $5-10/mo |
| Scalability | Medium | High | High | Varies |
| Data Limit | Unlimited | 1GB free | 500MB free | Depends |
| Real-time | No | Yes | Yes | Depends |
| Admin Panel | Native | Firebase Console | Dashboard | Custom |
| Learning Curve | Easy | Medium | Medium | Hard |

---

## ✅ RECOMMENDED SETUP (Google Sheets)

For your use case, **Google Sheets + Apps Script** is ideal because:
- ✅ Zero cost
- ✅ Already integrated in forms
- ✅ Simple to set up (5 minutes)
- ✅ Easy to view & manage responses
- ✅ Sufficient for workshop scale (20-30 registrations)
- ✅ No server management needed

**Next Steps:**
1. Follow **Option 1** steps above
2. Copy your Apps Script URL
3. Update both form files with the URL
4. Test with a dummy submission
5. Done!

---

## Sending Confirmation Emails (Optional)

Once you have responses stored, automate email confirmations:

### With Google Sheets:
Add to Apps Script:

```javascript
function doPost(e) {
  // ... existing code ...
  
  // Send confirmation email
  MailApp.sendEmail(
    data.email,
    'Workshop Registration Confirmed ✅',
    `Hi ${data.name},\n\nThank you for registering for our workshop!\n\nWorkshop: ${data.workshop}\nDate: April 3 or 10, 2026\n\nBest regards,\nVector Research Lab`
  );
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### With Firebase/Supabase:
Use **SendGrid** or **Mailgun** API for transactional emails.

---

## Security Notes

- ✅ Google Forms uses CORS, safe for static sites
- ✅ Always validate data server-side
- ✅ Never expose sensitive API keys in frontend code
- ⚠️ Use environment variables for production
- ⚠️ Implement rate limiting for form submissions

---

## Support & Troubleshooting

**Form not submitting?**
- Check browser console (F12) for errors
- Verify SHEETS_URL is correct
- Ensure Apps Script is deployed as "Web app"
- Check CORS headers in response

**Bad Request (Error 400) in Apps Script URL?**
- Make sure you are using the **Web app URL ending with `/exec`**, not the editor URL.
- Re-deploy: **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**.
- Set **Who has access = Anyone** (or Anyone with Google account).
- Open the `/exec` URL in browser: you should see JSON like `{\"status\":\"ok\"}`.
- If it still fails, sign in to the same Google account that owns the script and try in an incognito window.

**Need help?**
Contact: vectorresearchlab@gmail.com
