# Product Manager Pre-Launch Checklist

**Before sharing repository with team** - Complete these tasks:

---

## ✅ **CRITICAL TASKS (Must Complete)**

### 1. Firebase Project Setup ⏱️ ~30 min
- [ ] Create Firebase project at https://console.firebase.google.com/
- [ ] Name it "QuizQuest"
- [ ] Register web app
- [ ] **COPY & SAVE** all Firebase config values to secure location (password manager)
- [ ] Enable Authentication:
  - [ ] Email/Password
  - [ ] Google Sign-In
  - [ ] Anonymous
- [ ] Create Firestore Database:
  - [ ] Start in test mode
  - [ ] Choose region (us-central1 or closest to users)
- [ ] Note Firebase Console URL to share with team

**Firebase Credentials to Save**:
```
API Key: AIza...
Auth Domain: quizquest-xxxxx.firebaseapp.com
Project ID: quizquest-xxxxx
Storage Bucket: quizquest-xxxxx.appspot.com
Messaging Sender ID: 123456789
App ID: 1:123456789:web:xxxxx
```

---

### 2. Repository & GitHub Setup ⏱️ ~20 min
- [ ] Verify `.gitignore` includes `.env.local` ✅ (already done)
- [ ] Verify `.env.example` exists ✅ (already done)
- [ ] Commit current changes:
  ```bash
  git add .
  git commit -m "docs: add comprehensive project documentation"
  git push origin feature/challenge-creator
  ```
- [ ] Merge to main or keep on feature branch (your choice)
- [ ] Add all team members as collaborators:
  - GitHub repo → Settings → Collaborators → Add people
  - [ ] Da'karri Jenkins
  - [ ] Elias Zegeye
  - [ ] Erin McCoomer
  - [ ] Stephen Ganthier

---

### 3. Create GitHub Issues ⏱️ ~30 min
Use `GITHUB_ISSUES_SETUP.md` as guide:

- [ ] Create at least Phase 1 issues (#1-4)
- [ ] Create Phase 2 issues (#5-8) 
- [ ] Assign issues to team members based on roles
- [ ] Create labels: `phase-1`, `phase-2`, `auth`, `ui`, `backend`, etc.
- [ ] Optional: Create GitHub Project Board with columns:
  - Backlog
  - To Do
  - In Progress
  - In Review
  - Done

---

### 4. Team Communication Setup ⏱️ ~15 min
- [ ] Create team communication channel (Slack/Discord/Teams)
- [ ] Share channel link with team
- [ ] Pin important links in channel:
  - GitHub repository
  - Firebase console
  - Documentation files
- [ ] Schedule first team meeting
  - [ ] Set date/time for Week 1 kickoff
  - [ ] Set recurring standup time (daily, 15 min)
  - [ ] Set weekly demo time

---

### 5. Share Firebase Credentials Securely ⏱️ ~10 min
**DO NOT share via regular email or commit to repo!**

Options:
- [ ] Use password manager shared vault (1Password, LastPass)
- [ ] Share via encrypted message (Signal, Keybase)
- [ ] Share in person or over secure video call
- [ ] OR: Give each team member "Editor" access to Firebase project directly

If sharing the config values:
```
Create a private message/document with:

"Firebase Configuration for QuizQuest:

VITE_FIREBASE_API_KEY=your_actual_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

Instructions:
1. Create .env.local file in project root
2. Copy these values into it
3. NEVER commit this file to Git
4. Restart dev server after creating file"
```

---

### 6. Prepare Kickoff Meeting Agenda ⏱️ ~15 min
- [ ] Review PRD together
- [ ] Walk through IMPLEMENTATION_GUIDE.md
- [ ] Confirm team roles & responsibilities
- [ ] Review Phase 1 tasks
- [ ] Assign first issues
- [ ] Set expectations:
  - [ ] Daily standups
  - [ ] Weekly demos
  - [ ] PR review process
  - [ ] Communication channels
- [ ] Q&A session

---

## 📋 **OPTIONAL BUT RECOMMENDED**

### Documentation
- [ ] Update TEAM_ONBOARDING.md with:
  - Your contact info
  - Team chat link
  - Meeting times
  - Firebase console URL

### Tools & Services
- [ ] Set up project management tool (Jira, Trello, GitHub Projects)
- [ ] Create shared Google Drive folder for docs
- [ ] Set up CI/CD (can wait until later)

### Code Quality
- [ ] Review ESLint configuration
- [ ] Set up Prettier (code formatting)
- [ ] Add pre-commit hooks (optional)

---

## 📤 **READY TO SHARE CHECKLIST**

Before telling team "we're ready to start":

- [ ] Firebase project created and configured
- [ ] Firebase credentials saved securely
- [ ] All documentation committed and pushed
- [ ] `.env.example` exists in repo
- [ ] `.gitignore` protects `.env.local`
- [ ] Team members added as GitHub collaborators
- [ ] GitHub issues created (at least Phase 1)
- [ ] Team communication channel created
- [ ] Firebase credentials shared securely with team
- [ ] Kickoff meeting scheduled
- [ ] You've tested the setup yourself:
  ```bash
  npm install
  # (create .env.local with credentials)
  npm run dev
  # App loads without errors
  ```

---

## 📧 **Message to Send Team**

Once checklist complete, send this:

```
Subject: 🚀 QuizQuest - Ready to Start Building!

Hey team,

We're ready to start building QuizQuest! Here's everything you need:

📦 **Repository**: https://github.com/ArennB/quizquest
📚 **Setup Guide**: See TEAM_ONBOARDING.md in the repo
🔐 **Firebase Credentials**: [Link to secure location or "Check your DM"]
💬 **Team Chat**: [Link to Slack/Discord]

🎯 **Next Steps**:
1. Clone the repository
2. Follow TEAM_ONBOARDING.md setup instructions
3. Get your Firebase credentials from [secure location]
4. Check GitHub Issues for your first tasks
5. Join team chat

📅 **Kickoff Meeting**: [Date/Time]
We'll review the plan, answer questions, and start Sprint 1.

⏰ **Daily Standups**: [Time] in [Channel/Link]
⏰ **Weekly Demos**: [Day/Time]

Your assigned role:
- [Name]: [Role and main responsibilities]
- [Name]: [Role and main responsibilities]
...

See you at kickoff!

[Your name]
```

---

## 🎉 You're All Set!

Estimated total setup time: **2-2.5 hours**

Once you complete this checklist, your team can start coding immediately!

---

## ⚠️ Common Mistakes to Avoid

- ❌ Committing `.env.local` to Git
- ❌ Sharing Firebase credentials in plain text email
- ❌ Not testing setup yourself first
- ❌ Not clearly assigning roles/tasks
- ❌ Starting without a communication channel
- ❌ Not scheduling regular check-ins

---

**Good luck! 🚀**
