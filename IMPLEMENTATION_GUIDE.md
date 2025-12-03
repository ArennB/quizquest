# QuizQuest Implementation Guide

## Table of Contents
1. [Project Setup & Environment](#1-project-setup--environment)
2. [Firebase Configuration](#2-firebase-configuration)
3. [Project Architecture](#3-project-architecture)
4. [Data Models](#4-data-models)
5. [Phase-by-Phase Implementation](#5-phase-by-phase-implementation)
6. [Team Task Distribution](#6-team-task-distribution)
7. [Development Workflow](#7-development-workflow)
8. [Testing Strategy](#8-testing-strategy)
9. [Running the app (local & deploy)](#9-running-the-app-local--deploy)

---

## 1. Project Setup & Environment

### 1.1 Prerequisites
Each team member needs:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **VS Code** (recommended) or preferred IDE
- **Firebase CLI**: `npm install -g firebase-tools`
- **Browser**: Chrome/Firefox with React DevTools extension

### 1.2 Initial Setup Steps

```bash
# Clone the repository
git clone https://github.com/ArennB/quizquest.git
cd quizquest

# Install dependencies
npm install

# Create environment file (see section 2)
cp .env.example .env.local

# Start development server
npm run dev
```

### 1.3 Project Dependencies to Add

```bash
# Routing
npm install react-router-dom

# State Management (optional, but recommended for complex state)
npm install zustand

# Form Handling
npm install react-hook-form

# UI Components & Styling
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Icons
npm install lucide-react

# Utilities
npm install clsx
npm install date-fns

# Toast Notifications
npm install react-hot-toast
```

---

## 2. Firebase Configuration

### 2.1 Firebase Project Setup

**One team member (project lead) should:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "QuizQuest"
3. Enable Google Analytics (optional)
4. Register web app
5. Copy configuration values

### 2.2 Enable Firebase Services

In Firebase Console:

**Authentication:**
- Go to Authentication → Get Started
- Enable sign-in methods:
  - Email/Password
  - Google (recommended)
  - Anonymous (for single player mode)

**Firestore Database:**
- Go to Firestore Database → Create Database
- Start in **test mode** (we'll add security rules later)
- Choose your region (closest to your target users)

**Storage (Optional for future):**
- Go to Storage → Get Started
- For user-uploaded images/avatars

### 2.3 Environment Variables

Create `.env.local` file:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Create `.env.example` (commit this, NOT .env.local):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Update `.gitignore`:
```
.env.local
.env*.local
```

---

## 3. Project Architecture

### 3.1 Folder Structure

```
quizquest/
├── public/
│   └── assets/          # Static images, icons
├── src/
│   ├── assets/          # React-imported assets
│   ├── components/      # Reusable UI components
│   │   ├── common/      # Buttons, Cards, Inputs, etc.
│   │   ├── layout/      # Header, Footer, Sidebar
│   │   ├── auth/        # Login, Signup components
│   │   ├── quiz/        # Quiz-related components
│   │   └── leaderboard/ # Leaderboard components
│   ├── pages/           # Route-level page components
│   │   ├── Home.jsx
│   │   ├── Browse.jsx
│   │   ├── PlayQuiz.jsx
│   │   ├── CreateChallenge.jsx
│   │   ├── Profile.jsx
│   │   └── Leaderboard.jsx
│   ├── contexts/        # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── GameContext.jsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useFirestore.js
│   │   └── useQuiz.js
│   ├── services/        # Firebase & API services
│   │   ├── authService.js
│   │   ├── quizService.js
│   │   ├── userService.js
│   │   └── leaderboardService.js
│   ├── utils/           # Helper functions
│   │   ├── validators.js
│   │   ├── calculations.js
│   │   └── constants.js
│   ├── styles/          # Global styles
│   │   └── globals.css
│   ├── firebase.js      # Firebase config (already exists)
│   ├── App.jsx
│   └── main.jsx
├── .env.local
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── IMPLEMENTATION_GUIDE.md (this file)
└── vite.config.js
```

### 3.2 Routing Structure

```jsx
// src/App.jsx structure
<Router>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Home />} />
    <Route path="/browse" element={<Browse />} />
    <Route path="/play/:challengeId" element={<PlayQuiz />} />
    <Route path="/leaderboard/:challengeId" element={<Leaderboard />} />
    
    {/* Auth Routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    
    {/* Protected Routes (require authentication) */}
    <Route element={<ProtectedRoute />}>
      <Route path="/create" element={<CreateChallenge />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/my-challenges" element={<MyChallenges />} />
    </Route>
  </Routes>
</Router>
```

---

## 4. Data Models

### 4.1 Firestore Collections Structure

#### **Collection: `users`**
```javascript
{
  userId: "auto-generated-id",
  email: "user@example.com",
  displayName: "PlayerName",
  photoURL: "https://...",
  createdAt: Timestamp,
  stats: {
    totalXP: 0,
    challengesCompleted: 0,
    challengesCreated: 0,
    averageScore: 0,
    currentStreak: 0,
    longestStreak: 0
  },
  badges: [
    {
      badgeId: "first_quiz",
      earnedAt: Timestamp,
      name: "Quiz Beginner"
    }
  ]
}
```

#### **Collection: `challenges`**
```javascript
{
  challengeId: "auto-generated-id",
  title: "90s Cartoons Quiz",
  description: "Test your knowledge of 90s cartoons!",
  theme: "Cartoons",
  difficulty: "medium", // easy, medium, hard
  creatorId: "user-id",
  creatorName: "PlayerName",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isPublished: true,
  playCount: 0,
  averageScore: 0,
  averageTime: 0, // in seconds
  questions: [
    {
      questionId: "q1",
      type: "multiple_choice", // or "short_answer"
      text: "What is the name of the main character in Rugrats?",
      options: ["Tommy", "Chuckie", "Angelica", "Phil"], // only for multiple_choice
      correctAnswer: "Tommy", // or index 0 for multiple_choice
      points: 10,
      timeLimit: 30 // seconds (optional)
    }
  ],
  tags: ["90s", "cartoons", "nostalgia"],
  settings: {
    allowReplay: true,
    showCorrectAnswers: true,
    requireSignIn: false
  }
}
```

#### **Collection: `attempts`**
```javascript
{
  attemptId: "auto-generated-id",
  challengeId: "challenge-id",
  userId: "user-id", // null for anonymous
  userName: "PlayerName",
  startedAt: Timestamp,
  completedAt: Timestamp,
  totalTime: 120, // seconds
  score: 80, // percentage
  correctAnswers: 8,
  totalQuestions: 10,
  xpEarned: 200,
  answers: [
    {
      questionId: "q1",
      userAnswer: "Tommy",
      isCorrect: true,
      timeSpent: 15 // seconds
    }
  ],
  badgesEarned: ["first_quiz"]
}
```

#### **Collection: `leaderboards`** (subcollection under challenges)
```javascript
// Path: challenges/{challengeId}/leaderboard/{userId}
{
  userId: "user-id",
  userName: "PlayerName",
  bestScore: 90,
  bestTime: 95, // seconds
  attempts: 3,
  lastPlayedAt: Timestamp,
  rank: null // calculated on query
}
```

#### **Collection: `badges`** (master list)
```javascript
{
  badgeId: "first_quiz",
  name: "Quiz Beginner",
  description: "Complete your first quiz",
  icon: "🎯",
  category: "achievement",
  criteria: {
    type: "challenges_completed",
    threshold: 1
  }
}
```

### 4.2 Security Rules (Firebase)

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Challenges collection
    match /challenges/{challengeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.creatorId == request.auth.uid;
      
      // Leaderboard subcollection
      match /leaderboard/{userId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
    
    // Attempts collection
    match /attempts/{attemptId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.uid in resource.data.viewers);
      allow create: if true; // Allow anonymous attempts
      allow update: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Badges collection (read-only for users)
    match /badges/{badgeId} {
      allow read: if true;
      allow write: if false; // Only admins via console
    }
  }
}
```

---

## 5. Phase-by-Phase Implementation

### **PHASE 1: Foundation & Authentication (Week 1)**
**Goal:** Set up project infrastructure and user authentication

#### Tasks:
1. **Project Setup** (Day 1)
   - Install all dependencies
   - Set up Tailwind CSS
   - Create folder structure
   - Set up routing with react-router-dom

2. **Authentication System** (Days 2-3)
   - Create AuthContext
   - Build Login/Signup pages
   - Implement Google & Email/Password auth
   - Create ProtectedRoute component
   - Add user profile creation in Firestore

3. **Layout Components** (Days 4-5)
   - Header/Navigation with auth state
   - Footer
   - Home page with hero section
   - Basic styling and theme

**Deliverable:** Users can sign up, log in, and navigate the app

---

### **PHASE 2: Challenge Creation (Week 2)**
**Goal:** Build the challenge creator interface (FR8-FR10)

#### Tasks:
1. **Challenge Creator UI** (Days 1-3)
   - Create CreateChallenge page
   - Form for challenge metadata (title, description, theme, difficulty)
   - Question builder component
   - Support multiple choice questions
   - Support short answer questions
   - Add/remove/reorder questions

2. **Challenge Service** (Day 4)
   - `quizService.js` with CRUD operations
   - Save draft challenges
   - Publish challenges
   - Validate challenge data

3. **My Challenges Page** (Day 5)
   - List user's created challenges
   - Edit/Delete functionality
   - View statistics

**Deliverable:** Users can create, edit, and publish trivia challenges

---

### **PHASE 3: Core Gameplay (Week 3)**
**Goal:** Build quiz-taking functionality (FR1-FR4)

#### Tasks:
1. **Quiz Player UI** (Days 1-3)
   - PlayQuiz page component
   - Question display component
   - Answer input (multiple choice & text)
   - Timer component
   - Progress indicator
   - Results screen

2. **Quiz Logic** (Days 4-5)
   - Answer validation
   - Score calculation
   - Time tracking
   - Save attempt to Firestore
   - Handle anonymous players

**Deliverable:** Users can play quizzes and see their results

---

### **PHASE 4: Gamification & Progression (Week 4)**
**Goal:** Implement XP, badges, and stats (FR5-FR6, FR13-FR14)

#### Tasks:
1. **XP System** (Days 1-2)
   - Calculate XP based on performance
   - Update user stats after quiz completion
   - Display XP gains

2. **Badge System** (Days 3-4)
   - Define badge criteria
   - Check badge eligibility after quiz
   - Award badges
   - Display badges on profile

3. **User Profile** (Day 5)
   - Profile page with stats
   - Display badges
   - Show completed challenges
   - Edit profile information

**Deliverable:** Users earn XP and badges, can view their profile

---

### **PHASE 5: Social Features & Leaderboards (Week 5)**
**Goal:** Add leaderboards and sharing (FR7, FR15)

#### Tasks:
1. **Leaderboards** (Days 1-3)
   - Per-challenge leaderboards
   - Global leaderboard
   - Ranking algorithms
   - Real-time updates

2. **Browse & Discovery** (Days 4-5)
   - Browse challenges page
   - Search and filter
   - Sort by popularity, date, difficulty
   - Share challenge links
   - Challenge detail view

**Deliverable:** Users can browse challenges and compete on leaderboards

---

### **PHASE 6: Game Modes & Polish (Week 6)**
**Goal:** Implement game modes and polish UX (FR11-FR12)

#### Tasks:
1. **Game Modes** (Days 1-2)
   - Single Player mode (anonymous)
   - Multiplayer mode (authenticated)
   - Mode selection UI

2. **UI/UX Polish** (Days 3-5)
   - Responsive design refinement
   - Loading states
   - Error handling
   - Toast notifications
   - Animations
   - Accessibility improvements

**Deliverable:** Polished, production-ready app

---

### **PHASE 7: Testing & Deployment (Week 7)**
**Goal:** Test thoroughly and deploy

#### Tasks:
1. **Testing** (Days 1-3)
   - Manual testing all features
   - Fix bugs
   - Performance optimization
   - Cross-browser testing

2. **Deployment** (Days 4-5)
   - Set up Firebase Hosting
   - Configure production environment
   - Deploy application
   - Set up CI/CD (optional)

**Deliverable:** Live QuizQuest application

---

## 6. Team Task Distribution

### Suggested Roles (5-person team)

#### **Role 1: Project Lead & Authentication (Da'karri or Arenn)**
- Firebase setup and configuration
- Authentication system
- User management
- Overall architecture decisions

#### **Role 2: Challenge Creator (Elias)**
- Challenge creation interface
- Question builder
- Challenge CRUD operations
- Form validation

#### **Role 3: Quiz Player & Game Logic (Erin)**
- Quiz playing interface
- Answer validation
- Score calculation
- Timer and progress tracking

#### **Role 4: Gamification & Profile (Stephen)**
- XP and badge systems
- User profiles
- Stats tracking
- Progression logic

#### **Role 5: Social & Leaderboards (Remaining member)**
- Leaderboard system
- Browse/discovery page
- Sharing functionality
- Search and filtering

### Parallel Work Streams

**Week 1-2:**
- Person 1: Auth + Layout
- Person 2: Challenge Creator
- Person 3: Component library (buttons, cards, inputs)
- Person 4: Data models & services setup
- Person 5: Styling system & theme

**Week 3-4:**
- Person 1: User profile
- Person 2: Challenge editing/management
- Person 3: Quiz player
- Person 4: Gamification
- Person 5: Browse page

**Week 5-6:**
- Person 1: Testing & bug fixes
- Person 2: Leaderboards
- Person 3: UI polish
- Person 4: Performance optimization
- Person 5: Documentation

---

## 7. Development Workflow

### 7.1 Git Workflow

**Branch Naming Convention:**
```
feature/feature-name    (new features)
fix/bug-description     (bug fixes)
refactor/what-changed   (code refactoring)
```

**Workflow:**
```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feature/challenge-creator

# Make changes and commit
git add .
git commit -m "feat: add question builder component"

# Push and create PR
git push origin feature/challenge-creator
# Create Pull Request on GitHub

# After PR approval
git checkout main
git pull origin main
git branch -d feature/challenge-creator
```

**Commit Message Convention:**
```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

### 7.2 Code Review Process

1. Create PR with clear description
2. At least 1 team member reviews
3. Run app locally to test
4. Check for conflicts
5. Merge to main after approval

### 7.3 Daily Standups (15 min)

Each person answers:
1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers?

### 7.4 Weekly Demos

End of each week: Demo completed features to team

---

## 8. Testing Strategy

### 8.1 Manual Testing Checklist

**Authentication:**
- [ ] Sign up with email
- [ ] Sign in with email
- [ ] Sign in with Google
- [ ] Anonymous access
- [ ] Logout
- [ ] Password reset

**Challenge Creation:**
- [ ] Create new challenge
- [ ] Add multiple choice questions
- [ ] Add short answer questions
- [ ] Edit existing challenge
- [ ] Delete challenge
- [ ] Publish challenge

**Quiz Playing:**
- [ ] Start quiz
- [ ] Answer questions
- [ ] Timer works correctly
- [ ] Submit quiz
- [ ] View results
- [ ] Replay quiz

**Gamification:**
- [ ] XP awarded correctly
- [ ] Badges unlock
- [ ] Stats update
- [ ] Profile displays correctly

**Leaderboards:**
- [ ] Scores recorded
- [ ] Rankings correct
- [ ] Real-time updates

### 8.2 Cross-Browser Testing

Test on:
- Chrome (desktop & mobile)
- Firefox
- Safari
- Edge

### 8.3 Responsive Testing

Test on:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

---

## 9. Running the app (local & deploy)

### Prerequisites
- Node.js v18+ and npm (or yarn)
- Firebase CLI: `npm install -g firebase-tools`
- A filled `.env.local` (copy from `.env.example` and add your Firebase values)

### Local development (fast start)
```bash
# from project root
npm install
cp .env.example .env.local      # then fill values in .env.local
npm run dev                     # start Vite dev server (http://localhost:5173)
# or if using yarn
# yarn
# yarn dev
```

### Using Firebase emulators (optional, recommended for safe testing)
1. Start emulators for Auth/Firestore:
```bash
firebase emulators:start
```
2. Ensure your local Firebase config (firebase.json) points to emulator ports, or use the SDK to connect to emulators when NODE_ENV is development.

### Build & deploy
```bash
# Build production bundle
npm run build

# Preview production locally
npm run preview

# Deploy to Firebase Hosting (ensure firebase project is selected)
firebase deploy --only hosting
```

### Common issues & quick fixes
- Env changes not applied: restart dev server after editing `.env.local`.
- Port conflicts: change Vite port in `vite.config.js` or kill the process using the port.
- Broken deps: `rm -rf node_modules && npm install`.
- Firebase auth/firestore not working: confirm `.env.local` values match the Firebase Console and that the correct project is selected (`firebase use <projectId>`).

---

## Next Steps

1. **Today:** All team members complete setup checklist
2. **This Week:** Complete Phase 1 (Foundation & Auth)
3. **Week 2:** Begin Phase 2 (Challenge Creator)
4. **Schedule:** Weekly team syncs every [Day/Time]

---

**Questions?** Discuss with your team lead or in team chat!

Good luck building QuizQuest! 🚀🎯
