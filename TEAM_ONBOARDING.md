# QuizQuest - Team Onboarding & Setup

## 🎯 Welcome to QuizQuest!

This document will help you get set up and start contributing.

---

## 📋 Your Personal Setup Checklist

### Step 1: Clone Repository
```bash
git clone https://github.com/ArennB/quizquest.git
cd quizquest
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Get Firebase Credentials
**Contact**: [Project Lead Name/Email]

You'll receive:
- Firebase API Key
- Firebase Project ID
- Other config values

### Step 4: Configure Environment
```bash
# Copy the example file
cp .env.example .env.local

# Open .env.local and paste the Firebase credentials you received
# DO NOT COMMIT THIS FILE!
```

### Step 5: Start Development Server
```bash
npm run dev
```

Visit: `http://localhost:5173`

### Step 6: Create Your Feature Branch
```bash
git checkout -b feature/your-name-feature-description
```

---

## 👥 Team Roles & Responsibilities

### Project Lead & Authentication (Da'karri/Arenn)
**Focus**: Firebase setup, authentication, user management
- Firebase configuration
- Login/Signup pages
- AuthContext
- Protected routes
- User profile creation

### Challenge Creator (Elias)
**Focus**: Challenge creation interface
- CreateChallenge page
- Question builder component
- Challenge CRUD operations
- My Challenges page
- Form validation

### Quiz Player & Game Logic (Erin)
**Focus**: Quiz playing experience
- PlayQuiz page
- Question display components
- Answer validation
- Score calculation
- Timer functionality
- Results screen

### Gamification & Profile (Stephen)
**Focus**: XP, badges, and user profiles
- XP calculation system
- Badge criteria & awarding
- User profile page
- Stats tracking
- Achievement displays

### Social & Leaderboards ([Team Member 5])
**Focus**: Community features
- Leaderboard system
- Browse challenges page
- Search & filtering
- Sharing functionality
- Challenge discovery

---

## 📅 Development Schedule

### Week 1: Foundation & Authentication
**Goal**: Users can sign up, log in, and navigate

**Team Focus**:
- Project Lead: Auth system + layout
- Others: Help with component library, styling setup

**Deliverable**: Working authentication and navigation

---

### Week 2: Challenge Creation (Current Sprint)
**Goal**: Users can create and publish challenges

**Team Focus**:
- Elias: Challenge creator (main feature)
- Others: Support components, styling

**Deliverable**: Functional challenge creation flow

---

### Week 3: Quiz Playing
**Goal**: Users can take quizzes and see results

**Team Focus**:
- Erin: Quiz player (main feature)
- Others: Results UI, animations

**Deliverable**: Full quiz playing experience

---

### Week 4: Gamification
**Goal**: XP, badges, and profiles work

**Team Focus**:
- Stephen: Gamification system
- Others: Profile UI enhancements

**Deliverable**: Working progression system

---

### Week 5: Social Features
**Goal**: Leaderboards and discovery

**Team Focus**:
- Team Member 5: Leaderboards
- Others: Browse page, search

**Deliverable**: Complete social features

---

### Week 6: Polish & Refinement
**Goal**: Production-ready app

**Team Focus**:
- Everyone: Bug fixes, responsive design, animations

**Deliverable**: Polished application

---

### Week 7: Testing & Deployment
**Goal**: Live application

**Team Focus**:
- Everyone: Testing, deployment

**Deliverable**: Deployed QuizQuest app

---

## 🔄 Daily Workflow

### Daily Standup (15 minutes)
**When**: [Choose time]  
**Where**: [Slack/Discord/Zoom]

**Format**: Each person answers:
1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers/questions?

### During Development
1. Work on your assigned feature
2. Commit frequently with clear messages
3. Push to your feature branch
4. Create PR when feature is complete
5. Request review from at least 1 teammate

### Weekly Demo (30-60 minutes)
**When**: [Choose day/time]  
**Format**: Each person demos their completed work

---

## 📝 Git Workflow

### Branch Naming
```
feature/your-feature-name
fix/bug-description
refactor/what-changed
```

### Commit Messages
```
feat: add question builder component
fix: resolve authentication redirect issue
docs: update setup instructions
style: format challenge creator page
refactor: simplify score calculation
```

### Pull Request Process
1. Push your branch: `git push origin feature/your-feature`
2. Create PR on GitHub
3. Write clear PR description
4. Request review
5. Address feedback
6. Merge after approval

---

## 🔧 Common Commands

```bash
# Start dev server
npm run dev

# Check for errors
npm run lint

# Build for production
npm run build

# Git commands
git status                    # Check your changes
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin branch-name   # Push to GitHub
git pull origin main          # Get latest main branch
```

---

## 📚 Important Files

- **README.md** - Quick start guide
- **IMPLEMENTATION_GUIDE.md** - Detailed technical guide
- **GITHUB_ISSUES_SETUP.md** - Issues to create
- **PRD.md** - Product requirements (if you have it)

---

## 🆘 Getting Help

### Stuck on Something?
1. Check IMPLEMENTATION_GUIDE.md
2. Check Firebase/React docs
3. Ask in team chat
4. Tag relevant team member

### Common Issues

**"Firebase not connecting"**
- Check .env.local exists and has values
- Restart dev server
- Verify Firebase config is correct

**"Dependencies not installing"**
- Delete `node_modules/` and run `npm install` again
- Check Node version: `node --version` (need 18+)

**"Git conflicts"**
- Pull latest main: `git pull origin main`
- Resolve conflicts in your editor
- Commit resolved changes

---

## 🎉 Ready to Start!

1. ✅ Repository cloned
2. ✅ Dependencies installed
3. ✅ Firebase credentials configured
4. ✅ Dev server running
5. ✅ Feature branch created
6. ✅ Reviewed your role and tasks
7. ✅ Joined team communication channel

**Next**: Check GitHub issues for your first task!

---

## 📞 Team Contacts

- **Project Lead**: [Email/Slack]
- **Team Chat**: [Link to Slack/Discord]
- **GitHub**: https://github.com/ArennB/quizquest
- **Firebase Console**: [Share URL after setup]

---

**Let's build something amazing! 🚀**
