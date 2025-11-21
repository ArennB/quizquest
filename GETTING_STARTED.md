# 🚀 QuizQuest - Getting Started Guide

**Welcome to the team!** This guide will get you set up and ready to contribute to QuizQuest.

---

## ⏰ Important Info

- **Deadline:** December 9, 2025 (19 days from today!)
- **Team Size:** 5 developers
- **Goal:** Build a working trivia app where users can create, play, and compete

---

## 📋 Step 1: Initial Setup (Do This First!)

### 1.1 Install Required Software

Make sure you have:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
  - Check version: `node --version`
- **Git** - [Download here](https://git-scm.com/)
  - Check version: `git --version`
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)

### 1.2 Get Access to the Repository

1. **Accept GitHub Invitation**
   - Check your email for GitHub collaboration invite
   - Click "Accept Invitation"

2. **Clone the Repository**
   ```bash
   # Open your terminal and navigate to where you want the project
   cd ~/Projects  # or wherever you keep projects
   
   # Clone the repo
   git clone https://github.com/ArennB/quizquest.git
   
   # Move into the project folder
   cd quizquest
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```
   This will take a few minutes. You should see a bunch of packages being installed.

### 1.3 Get Firebase Configuration

1. **Ask the team lead** (Arenn) for the Firebase configuration
2. **Create a file** called `.env.local` in the project root folder
3. **Copy and paste** the Firebase config they give you into that file

It should look like this:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=quizquest-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quizquest-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=quizquest-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 1.4 Test That Everything Works

```bash
npm run dev
```

- You should see: `Local: http://localhost:5173/`
- Open that URL in your browser
- You should see the QuizQuest app!

**✅ If you see the app, you're all set!**

---

## 🌳 Step 2: Understanding Git Branches

Think of branches like **separate workspaces** where you can work without affecting anyone else.

### The Main Branch
- `main` - This is the "official" version of the app
- **Never work directly on main!** Always create a branch first

### Your Feature Branches
- These are where YOU do your work
- Each new feature gets its own branch
- Example: `feature/login-page`, `feature/quiz-timer`

---

## 💻 Step 3: Daily Workflow (Follow This Every Day!)

### Starting Your Work Day

```bash
# 1. Make sure you're on main branch
git checkout main

# 2. Get the latest changes from everyone else
git pull origin main

# 3. Create YOUR new branch for today's work
git checkout -b feature/your-feature-name
# Examples: feature/login-page, feature/quiz-results, feature/leaderboard
```

### While You're Working

```bash
# Check what files you've changed
git status

# See exactly what you changed in files
git diff

# When you're ready to save your work (do this often!)
git add .
git commit -m "describe what you did"
```

**Commit Message Examples:**
- `"feat: add login form"`
- `"feat: create quiz player component"`
- `"fix: timer now stops correctly"`
- `"style: improve button styling"`

### End of Your Work Session (Pushing Your Code)

```bash
# Push your branch to GitHub
git push origin feature/your-feature-name

# The first time you push, you might see a message with a link
# That's normal! The link takes you to create a Pull Request
```

---

## 🔄 Step 4: Pull Requests (PRs)

A Pull Request is how you say "I'm done with this feature, please add it to the main app!"

### Creating a Pull Request

1. **Push your branch** (see above)
2. **Go to GitHub** in your browser: https://github.com/ArennB/quizquest
3. You'll see a yellow banner saying "Compare & pull request" - **click it**
4. **Fill out the form:**
   - Title: Short description (e.g., "Add login page")
   - Description: Explain what you built and how to test it
5. **Click "Create pull request"**

### What Happens Next

1. Another team member will **review your code**
2. They might ask questions or request changes
3. Once approved, someone will **merge** it into main
4. Your feature is now part of the app! 🎉

---

## 🔄 Step 5: Staying in Sync with the Team

**Do this at least once a day, or whenever someone's PR gets merged:**

```bash
# Save your current work first
git add .
git commit -m "work in progress"

# Switch to main and get updates
git checkout main
git pull origin main

# Go back to your branch
git checkout feature/your-feature-name

# Bring the new changes into your branch
git merge main
```

### If You See "CONFLICT" Messages (Don't Panic!)

1. Git will tell you which files have conflicts
2. Open those files - you'll see markers like this:
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Someone else's changes
   >>>>>>> main
   ```
3. **Decide what to keep** - edit the file to look how it should
4. **Remove the markers** (`<<<<<<<`, `=======`, `>>>>>>>`)
5. Save the file
6. Tell Git you fixed it:
   ```bash
   git add .
   git commit -m "fix: resolve merge conflicts"
   ```

---

## 📝 Step 6: Best Practices (Please Follow!)

### ✅ DO:
- **Pull from main daily** - Stay synced with the team
- **Commit often** - Small commits are better than huge ones
- **Write clear commit messages** - "feat: add timer" not "stuff"
- **Test your code** - Make sure it works before pushing
- **Ask for help** - In team chat if you're stuck
- **One feature per branch** - Don't mix unrelated changes

### ❌ DON'T:
- **Never work on the main branch directly**
- **Don't commit `.env.local`** - It's in .gitignore for a reason
- **Don't push broken code** - Test first!
- **Don't let your branch get too old** - Sync with main regularly
- **Don't be afraid to ask questions** - We're all learning!

---

## 🆘 Common Problems & Solutions

### "I messed up, how do I start over?"

```bash
# Throw away all your changes (careful!)
git reset --hard

# Or just specific files
git checkout -- filename.jsx
```

### "I'm on the wrong branch!"

```bash
# See all branches
git branch

# Switch to the right one
git checkout branch-name
```

### "I committed to main by accident!"

```bash
# Don't push! Instead:
git reset HEAD~1  # Undo the commit
git checkout -b feature/my-feature  # Create proper branch
git add .
git commit -m "your message"
```

### "I can't pull because I have uncommitted changes"

```bash
# Option 1: Commit your changes first
git add .
git commit -m "work in progress"
git pull origin main

# Option 2: Temporarily hide your changes
git stash
git pull origin main
git stash pop  # Brings your changes back
```

### "npm install isn't working"

```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Getting Help

1. **Check this guide first**
2. **Ask in team chat** - Someone else might have had the same issue
3. **Ask the team lead** - They're here to help!
4. **Google the error message** - Often leads to solutions

---

## 🎯 Your First Task

Once you're set up:

1. **Read the IMPLEMENTATION_GUIDE.md** - See the full plan
2. **Check your assigned role** - Section 6 of the Implementation Guide
3. **Join the team chat** - Get the link from your team lead
4. **Attend the kickoff meeting** - We'll assign first tasks there

---

## 📚 Quick Command Reference

```bash
# Setup (once)
git clone https://github.com/ArennB/quizquest.git
cd quizquest
npm install

# Daily workflow
git checkout main
git pull origin main
git checkout -b feature/my-feature
# ... do your work ...
git add .
git commit -m "description"
git push origin feature/my-feature

# Staying synced
git checkout main
git pull origin main
git checkout feature/my-feature
git merge main

# Helpful commands
git status              # What changed?
git branch              # What branch am I on?
git log --oneline       # Recent commits
npm run dev             # Start the app
```

---

## ✨ You're Ready!

You now know enough to start contributing to QuizQuest. Remember:

- **Communicate with your team** - We succeed together
- **Don't be afraid to break things** - That's what branches are for!
- **Ask questions** - There are no dumb questions
- **Have fun!** - We're building something cool 🎯

**Next:** Wait for your task assignment in the team meeting, then start coding!

---

**Questions?** Ask in team chat or reach out to Da'karri/Arenn.

Let's build this! 🚀
