# رابعة طب — Advanced Medical Study & Task Management System

An exceptionally elegant, luxury academic management platform custom-tailored for fourth-year medical students. Built with pure Vanilla HTML5, CSS3, and JavaScript, integrated with Firebase Authentication (Google Sign-In) and Cloud Firestore for real-time, cross-device multi-user data synchronization.

---

## 🌟 Visual Identity & Design System

- **Palette:** Deep Royal Navy Blue (`#060B14`, `#0A1322`), Antique Gold (`#C5A059`, `#D4AF37`), and Champagne Gold (`#FFEAA7`).
- **Logo:** Distinctive, faceted metallic gold emblem showcasing the number **4**, symbolizing fourth-year medical studies.
- **Navigation:** Professional collapsible right-side sidebar with gold active indicators.
- **Language:** Clean English user interface with the iconic Arabic title: **رابعة طب**.

---

## 🚀 Key Modules & Capabilities

### 1. Main Dashboard
- **Dynamic Academic Overview:**
  - Dynamic counters: Total Subjects, Total Lectures, Completed Lectures, Remaining Lectures, Overall Completion %, Completed Tasks, Pending Tasks.
  - Automatically recalculates on every lecture or task completion toggle.
- **Live Examination Countdown:**
  - Initial target: **February 19, 2027**.
  - Real-time countdown clock (Days, Hours, Minutes, Seconds) with automatic updates.
  - Edit Exam Date & Time dialog.
  - Status indicator for active countdown, examination day, or concluded examination.
- **Today's Overview & Quick Actions:**
  - Instant progress snapshot of today's schedule and shortcuts to add tasks/lectures.

### 2. Subjects & Lecture Management
- **Preloaded 4th-Year Medical Curriculum:**
  1. **Pediatrics:** 16 Branches (Neonatology, Nutritional Disorders, Respiratory, Hematology, Gastroenterology, Cardiology, Nephrology, Neurology, Endocrine & Adolescence, Infection, Allergy, Rheumatology, Immunology, Oncology, Genetics, Hepatology) — 46 comprehensive lectures.
  2. **Anesthesia:** 1 Branch (General Anesthesia & Perioperative Care) — 11 lectures.
  3. **Psychiatry:** 1 Branch (Psychiatry Lectures) — 10 lectures.
  4. **Tropical Medicine:** 1 Branch (Tropical Medicine Lectures) — 17 lectures.
  5. **Rheumatology:** 1 Branch (Rheumatology Lectures) — 6 lectures.
- **Full Hierarchy & Dynamic CRUD:**
  - Subject &rarr; Branch &rarr; Lectures.
  - Add, edit, and delete subjects, branches, and individual lectures with confirmation dialogs.
  - Completion checkbox per lecture with timestamp logging and study notes modal.
  - Real-time lecture search filter per subject.

### 3. Interactive Dual Calendar (Gregorian & Hijri)
- **Simultaneous Date Systems:**
  - Every calendar cell displays both Gregorian and Hijri dates powered by native JavaScript `Intl.DateTimeFormat` with the standard Islamic Umm al-Qura calendar (`islamic-umalqura`).
- **Multi-View Modes:**
  - Monthly matrix, Weekly view, and Daily view.
- **Two-Option Task Scheduling:**
  - **Option A (Custom Task):** Completely unrestricted custom title and description.
  - **Option B (Subject-Linked Task):** Dependent dropdowns (Select Subject &rarr; Select Branch/Lecture). Selecting a lecture automatically sets the task title to the selected lecture title.
- **Task Details Modal:**
  - Click any task to inspect details, modify date, edit description, toggle completion, or delete.

### 4. Today's Tasks (Daily Agenda)
- Dedicated sidebar page displaying the current day's agenda.
- Real-time synchronization with the Calendar. Checking off a task here instantly marks it in the Calendar and updates all dashboard metrics.
- Navigation controls for Yesterday, Today, Tomorrow, and upcoming days.

### 5. Topic Progression & Academic Analytics
- **Study Activity & Velocity Chart:**
  - Pure HTML5 Canvas interactive visualization (14-Day Velocity, Weekly Performance, and Cumulative Progression).
- **Productivity & Streak Diagnostics:**
  - Current study streak & longest streak calculated strictly from recorded completion timestamps.
  - Most productive day and active study days count.
- **Automated Diagnostic Insights:**
  - Most advanced subject vs. least advanced subject.
  - Highlighted list of subjects requiring attention (< 40% completion).
  - Total remaining workload computation.
- **Subject Comparison Horizontal Benchmarks:**
  - Comparative progress bars across all five medical departments.

### 6. Settings & Data Protection
- Edit final examination date & time.
- JSON Academic Data Export & Import / Backup Restore with schema validation.
- Reset to default medical curriculum.
- In-App Firebase configuration interface.

---

## 🛠️ Step-by-Step Firebase Configuration

To activate Google Sign-In and Cloud Firestore synchronization across your laptop, tablet, and smartphone:

### Step 1: Create a Firebase Project
1. Visit the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**, name it (e.g. `rabia-tib-medical`), and create it.

### Step 2: Enable Google Authentication
1. In your Firebase console sidebar, navigate to **Build** &rarr; **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, select **Google** and toggle **Enable**.
4. Set your support email and click **Save**.
5. In **Settings** &rarr; **Authorized domains**, ensure `localhost` (for local development) and your GitHub Pages domain (e.g. `yourusername.github.io`) are listed.

### Step 3: Create Cloud Firestore Database
1. In the sidebar, navigate to **Build** &rarr; **Firestore Database**.
2. Click **Create database**.
3. Choose your nearest server location (e.g. `eur3 (europe-west)` or `nam5 (us-central)`).
4. Start in **Production mode** or **Test mode**.
5. Go to the **Rules** tab in Firestore and paste the contents of `firestore.rules` (also shown below):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    match /{document=**} {
      allow read, write: false;
    }
  }
}
```
6. Click **Publish**.

### Step 4: Register Web App & Add Credentials
1. Go to **Project Settings** (gear icon) &rarr; **General**.
2. Under *Your apps*, click the **Web icon (`</>`)** to register an app.
3. Copy your `firebaseConfig` object values.
4. You can configure credentials in either of two ways:
   - **Method A (Direct in file):** Open `js/firebase-config.js` and replace the placeholder values in `DEFAULT_FIREBASE_CONFIG`.
   - **Method B (Directly in application):** Open the application, click **Explore in Offline / Guest Session**, go to **Settings** &rarr; **Firebase Config**, paste your keys, and click **Connect & Reload**.

---

## 🚀 Deployment to GitHub Pages

The application is 100% static (Vanilla HTML/CSS/JS) and runs on GitHub Pages:

1. Create a new GitHub repository (e.g. `rabia-tib`).
2. Push all project files to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial release of رابعة طب Medical Academic Management System"
   git branch -M main
   git remote add origin https://github.com/<your-username>/rabia-tib.git
   git push -u origin main
   ```
3. In your GitHub repository, click **Settings** &rarr; **Pages**.
4. Under **Build and deployment** &rarr; **Source**, select `Deploy from a branch`.
5. Select branch `main` and folder `/ (root)`, then click **Save**.
6. In your Firebase Console under **Authentication &rarr; Settings &rarr; Authorized domains**, add `<your-username>.github.io`.
7. Your app is now live at: `https://<your-username>.github.io/rabia-tib/`

---

## 📁 Project File Structure

```text
├── index.html                   # Core single-page application entry point
├── firestore.rules              # Multi-user security rules ensuring private student data
├── README.md                    # Detailed documentation and setup guide
├── assets/
│   └── logo.svg                 # Regal gold geometric numeral "4" emblem
├── css/
│   ├── variables.css            # Color palette (Navy & Gold), typography, and shadows
│   ├── main.css                 # Layout grid, right-side sidebar, top header, responsiveness
│   ├── components.css           # Luxury cards, buttons, checkboxes, modals, auth view
│   └── views.css                # Dashboard, Subjects, Calendar, Today, Analytics, Settings
└── js/
    ├── app.js                   # Application controller, modal handling, navigation
    ├── state.js                 # Central state manager, reactive event bus, analytics math
    ├── db.js                    # Cloud Firestore integration & local fallback
    ├── auth.js                  # Google Sign-In & guest session controller
    ├── countdown.js             # Live exam countdown timer controller
    ├── hijri.js                 # Gregorian & Umm al-Qura Hijri Intl date formatter
    ├── initial-curriculum.js    # Preloaded initial 4th-year curriculum
    ├── firebase-config.js       # Firebase configuration credentials loader
    └── views/
        ├── dashboard.js         # Academic stats cards, countdown widget, quick actions
        ├── subjects.js          # Subject, branch, and lecture tree with notes & CRUD
        ├── calendar.js          # Month/Week/Day calendar with Hijri dates and tasks
        ├── today.js             # Daily agenda checklist
        ├── analytics.js         # Canvas activity charts & automated diagnostic insights
        └── settings.js          # Exam date editor, JSON export/import, profile tools
```

---

## 🔒 Security & Multi-User Separation
Every student signs in with their personal Google Account. Data is stored under Firestore document path `users/{userId}`. Firestore Security Rules enforce that student A can never read, modify, or delete records belonging to student B.

