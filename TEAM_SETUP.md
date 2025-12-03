# QuizQuest Team Setup Guide

## For Product Manager: Pre-Launch Checklist

### ✅ Phase 1: Firebase Setup (Do This First)

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Project name: `QuizQuest`
   - Enable Google Analytics: Optional (recommended)
   - Click "Create project"

2. **Register Web App**
   - In project dashboard, click the Web icon (`</>`)
   - App nickname: `QuizQuest Web`
   - **DO NOT** check "Also set up Firebase Hosting" (we'll do later)
   - Click "Register app"
   - **COPY** the configuration object that appears
   - Click "Continue to console"

3. **Enable Authentication**
   - Left sidebar → Authentication
   - Click "Get started"
   - Sign-in methods tab:
     - Click "Email/Password" → Enable → Save
     - Click "Google" → Enable → Add support email → Save
     - Click "Anonymous" → Enable → Save

4. **Enable Firestore Database**
   - Left sidebar → Firestore Database
   - Click "Create database"
   - Start in **test mode** (we'll add security rules later)
   - Location: Choose closest to your team (e.g., `us-east1`)
   - Click "Enable"

5. **Configure Security Settings**
   - In Authentication → Settings
   - Authorized domains: Add `localhost` (should already be there)
   - Later add your production domain

---

### ✅ Phase 2: Share Firebase Config with Team

1. **Fill in `.env.example`**
   - Open the Firebase config you copied
   - In your project, create/update `.env.example`:
   
   ```env
   # Leave these BLANK - team members will fill with real values
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```

2. **Create Shared Document** (Google Doc or team chat)
   - Title: "QuizQuest Firebase Configuration"
   - Paste the REAL values:
   
   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=quizquest-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=quizquest-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=quizquest-xxxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```
   
   - Share with team members only
   - Instruct them to create `.env.local` with these values

3. **Add Team Members to Firebase** (Optional but recommended)
   - Firebase Console → Project settings (gear icon)
   - Users and permissions tab
   - Click "Add member"
   - Add each team member's email with "Editor" role

---

### ✅ Phase 3: Repository & Documentation Setup

1. **Commit Essential Files**
   ```bash
   git add .env.example
   git add .gitignore
   git add IMPLEMENTATION_GUIDE.md
   git add TEAM_SETUP.md
   git add README.md
   git commit -m "docs: add team setup guides and Firebase config template"
   git push origin feature/challenge-creator
   ```

2. **Create GitHub Issues/Tasks** (Recommended)
   - Go to your GitHub repo
   - Create issues for Phase 1 tasks:
     - Issue #1: "Set up Tailwind CSS and base styling"
     - Issue #2: "Create AuthContext and auth service"
     - Issue #3: "Build Login and Signup pages"
     - Issue #4: "Create Header/Navigation component"
     - Issue #5: "Set up react-router-dom routing"
   - Assign issues to team members based on roles

3. **Create Project Board** (Optional but helpful)
   - GitHub → Projects → New project
   - Use "Team backlog" template
   - Create columns: To Do, In Progress, Review, Done
   - Add your issues to the board

---

### ✅ Phase 4: Team Communication Setup

1. **Set Up Team Communication Channel**
   - Options: Slack, Discord, Teams, or WhatsApp
   - Create channels:
     - `#general` - General discussion
     - `#dev` - Development questions/updates
     - `#standup` - Daily standup updates
     - `#bugs` - Bug reports

2. **Schedule First Team Meeting**
   - Duration: 1-2 hours
   - Agenda:
     - Project overview (15 min)
     - Walk through PRD (15 min)
     - Environment setup (30 min)
     - Role assignments review (15 min)
     - Phase 1 task breakdown (15 min)
     - Q&A (remaining time)

3. **Create Shared Calendar**
   - Weekly team sync (1 hour)
   - Daily standup (15 min) - async in chat is fine
   - Demo day at end of each phase

---

### ✅ Phase 5: Pre-Meeting Prep

**Send this to your team 24 hours before first meeting:**

```
Team QuizQuest! 🚀

Before our kickoff meeting tomorrow, please complete:

1. ✅ Clone the repo: https://github.com/ArennB/quizquest
2. ✅ Install Node.js v18+ (check: node --version)
3. ✅ Run: npm install
4. ✅ Read IMPLEMENTATION_GUIDE.md (Sections 1-4)
5. ✅ Join our team chat: [link]
6. ✅ Review your assigned role in Section 6 of the guide

In the meeting, I'll share Firebase credentials and we'll get everyone's dev environment running.

See you tomorrow!
```

---

## Meeting Day Checklist

### During First Team Meeting:

- [ ] Share screen and walk through IMPLEMENTATION_GUIDE.md
- [ ] Share Firebase config in private doc/chat
- [ ] Everyone creates `.env.local` file together
- [ ] Everyone runs `npm run dev` successfully
- [ ] Review Phase 1 tasks and assign specific work
- [ ] Set next meeting date
- [ ] Answer questions

### After Meeting:

- [ ] Send meeting notes to team
- [ ] Pin Firebase config in team chat
- [ ] Update GitHub issues if needed
- [ ] Check in with team members on progress

---

## Role Assignments Reminder

Based on your PRD, confirm these with your team:

| Team Member | Role | Phase 1 Focus |
|-------------|------|---------------|
| Da'karri/Arenn | Project Lead & Auth | Firebase setup, AuthContext, auth service |
| Elias | Challenge Creator | Component library (buttons, cards, forms) |
| Erin | Quiz Player & Logic | Routing setup, basic page structure |
| Stephen | Gamification & Profile | Styling system, Tailwind config |
| [5th Member] | Social & Leaderboards | Layout components (Header, Footer) |

---

## Quick Links for Team

- **Implementation Guide**: `IMPLEMENTATION_GUIDE.md`
- **Project PRD**: [Share your PRD document]
- **GitHub Repo**: https://github.com/ArennB/quizquest
- **Firebase Console**: https://console.firebase.google.com/project/your-project-id
- **React Docs**: https://react.dev
- **Firebase Docs**: https://firebase.google.com/docs

---

## Troubleshooting (Have These Ready)

**"I can't install dependencies"**
- Check Node version: `node --version` (need 18+)
- Try: `rm -rf node_modules package-lock.json && npm install`

**"Firebase not connecting"**
- Check `.env.local` exists in root directory
- Verify no extra spaces in environment variables
- Restart dev server: Stop and run `npm run dev` again

**"Git issues"**
- Make sure you're added as collaborator on GitHub
- Check branch: `git branch` (should show feature branches)
- Pull latest: `git pull origin main`

---

## Success Criteria for Week 1

By end of Week 1, everyone should have:
- [ ] Dev environment running locally
- [ ] Firebase connected and working
- [ ] Made at least 1 commit to a feature branch
- [ ] Created at least 1 component/page
- [ ] Basic navigation working between pages

---

Good luck, team! Let's build something awesome! 🎯✨
