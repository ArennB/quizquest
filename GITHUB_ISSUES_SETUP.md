# QuizQuest - GitHub Issues Setup Guide

Create these issues in your GitHub repository to organize work:

## Phase 1 Issues (Week 1)

### Issue #1: Project Setup & Dependencies
**Assignee**: Project Lead  
**Labels**: `setup`, `phase-1`
```markdown
## Description
Install all required dependencies and set up project infrastructure

## Tasks
- [ ] Install react-router-dom
- [ ] Install and configure Tailwind CSS
- [ ] Install lucide-react for icons
- [ ] Install react-hot-toast for notifications
- [ ] Install zustand (optional state management)
- [ ] Install react-hook-form
- [ ] Install clsx and date-fns
- [ ] Create folder structure (components, pages, contexts, hooks, services, utils)
- [ ] Configure Tailwind in vite.config.js

## Acceptance Criteria
- All dependencies installed without errors
- Folder structure matches IMPLEMENTATION_GUIDE.md
- Dev server runs successfully
```

### Issue #2: Firebase Authentication Setup
**Assignee**: Project Lead (Da'karri/Arenn)  
**Labels**: `auth`, `phase-1`, `firebase`
```markdown
## Description
Implement authentication system with Firebase

## Tasks
- [ ] Create AuthContext.jsx
- [ ] Implement signUp with email/password
- [ ] Implement signIn with email/password
- [ ] Implement Google sign-in
- [ ] Implement anonymous sign-in
- [ ] Implement sign-out
- [ ] Create user document in Firestore on signup
- [ ] Create useAuth custom hook

## Acceptance Criteria
- Users can sign up with email/password
- Users can sign in with Google
- Anonymous users can access app
- User data saved to Firestore
- Auth state persists on page refresh
```

### Issue #3: Layout Components & Navigation
**Assignee**: Project Lead  
**Labels**: `ui`, `phase-1`
```markdown
## Description
Create reusable layout components and navigation

## Tasks
- [ ] Create Header component with navigation
- [ ] Create Footer component
- [ ] Implement responsive navigation menu
- [ ] Show user info when logged in
- [ ] Add login/signup buttons when logged out
- [ ] Create ProtectedRoute component
- [ ] Set up routing structure in App.jsx

## Acceptance Criteria
- Header shows on all pages
- Navigation links work correctly
- User menu displays when authenticated
- Protected routes redirect to login
- Mobile-responsive design
```

### Issue #4: Home Page & Hero Section
**Assignee**: Any team member  
**Labels**: `ui`, `phase-1`
```markdown
## Description
Create landing/home page with hero section

## Tasks
- [ ] Design hero section
- [ ] Add "Get Started" / "Browse Challenges" CTAs
- [ ] Show featured challenges (placeholder)
- [ ] Add app description/value proposition
- [ ] Ensure responsive design

## Acceptance Criteria
- Visually appealing landing page
- Clear call-to-action buttons
- Works on mobile and desktop
```

---

## Phase 2 Issues (Week 2)

### Issue #5: Challenge Creator - Metadata Form
**Assignee**: Elias  
**Labels**: `challenge-creator`, `phase-2`
```markdown
## Description
Create form for challenge metadata (title, description, theme, difficulty)

## Tasks
- [ ] Create CreateChallenge page
- [ ] Add form inputs for title, description, theme
- [ ] Add difficulty selector (easy/medium/hard)
- [ ] Add tags input
- [ ] Add form validation
- [ ] Implement draft saving

## Acceptance Criteria
- Form validates required fields
- Can save challenge as draft
- Error messages display clearly
```

### Issue #6: Question Builder Component
**Assignee**: Elias  
**Labels**: `challenge-creator`, `phase-2`
```markdown
## Description
Build component for adding/editing questions

## Tasks
- [ ] Create QuestionBuilder component
- [ ] Support multiple choice questions
- [ ] Support short answer questions
- [ ] Add/remove questions functionality
- [ ] Reorder questions (drag & drop or buttons)
- [ ] Validate question data
- [ ] Set points per question
- [ ] Optional: Add timer per question

## Acceptance Criteria
- Can add both question types
- Can delete questions
- Can reorder questions
- Validation works correctly
```

### Issue #7: Challenge Service & Publishing
**Assignee**: Elias  
**Labels**: `challenge-creator`, `phase-2`, `backend`
```markdown
## Description
Create service for challenge CRUD operations

## Tasks
- [ ] Create quizService.js
- [ ] Implement createChallenge()
- [ ] Implement updateChallenge()
- [ ] Implement deleteChallenge()
- [ ] Implement publishChallenge()
- [ ] Implement getChallengeById()
- [ ] Implement getUserChallenges()
- [ ] Add proper error handling

## Acceptance Criteria
- Challenges save to Firestore correctly
- Published challenges visible to all users
- Draft challenges only visible to creator
- Error handling works
```

### Issue #8: My Challenges Page
**Assignee**: Elias  
**Labels**: `challenge-creator`, `phase-2`
```markdown
## Description
Page to view and manage user's created challenges

## Tasks
- [ ] Create MyChallenges page
- [ ] List user's challenges (published & drafts)
- [ ] Show challenge statistics (play count, avg score)
- [ ] Edit button → Navigate to edit mode
- [ ] Delete button with confirmation
- [ ] Filter by published/draft

## Acceptance Criteria
- Shows all user challenges
- Can edit existing challenges
- Can delete challenges with confirmation
- Stats display correctly
```

---

## Phase 3 Issues (Week 3)

### Issue #9: Quiz Player UI
**Assignee**: Erin  
**Labels**: `quiz-player`, `phase-3`
```markdown
## Description
Create quiz playing interface

## Tasks
- [ ] Create PlayQuiz page
- [ ] Display question text and number
- [ ] Render multiple choice options
- [ ] Render text input for short answer
- [ ] Progress indicator (e.g., "Question 3 of 10")
- [ ] Next/Submit buttons
- [ ] Timer component (optional per question)
- [ ] Results screen

## Acceptance Criteria
- Questions display correctly
- User can select/input answers
- Progress shows accurately
- Results show at end
```

### Issue #10: Quiz Logic & Scoring
**Assignee**: Erin  
**Labels**: `quiz-player`, `phase-3`, `backend`
```markdown
## Description
Implement quiz taking logic and score calculation

## Tasks
- [ ] Validate answers (client & server-side)
- [ ] Calculate score
- [ ] Track time per question and total
- [ ] Save attempt to Firestore
- [ ] Handle anonymous users
- [ ] Calculate XP earned
- [ ] Update user stats after completion

## Acceptance Criteria
- Correct/incorrect answers validated properly
- Score calculated accurately
- Attempt saved with all data
- Anonymous users can play
- XP awarded correctly
```

---

## Suggested Labels to Create

Create these labels in your GitHub repository:
- `phase-1` - Foundation & Auth
- `phase-2` - Challenge Creator
- `phase-3` - Quiz Player
- `phase-4` - Gamification
- `phase-5` - Social Features
- `phase-6` - Polish
- `phase-7` - Testing & Deployment
- `setup` - Project setup tasks
- `auth` - Authentication related
- `ui` - User interface
- `backend` - Backend/Firebase logic
- `bug` - Bug fixes
- `documentation` - Documentation updates
- `challenge-creator` - Challenge creation features
- `quiz-player` - Quiz playing features
- `firebase` - Firebase related

---

## Project Board Columns

Create a GitHub Project Board with these columns:
1. **📋 Backlog** - Future tasks
2. **📌 To Do** - Current sprint tasks
3. **🚧 In Progress** - Currently being worked on
4. **👀 In Review** - Pull request open
5. **✅ Done** - Completed tasks

---

## How to Use

1. Create issues from this list
2. Assign to appropriate team members
3. Add to project board
4. Team members move cards as they progress
5. Close issues when PRs are merged
