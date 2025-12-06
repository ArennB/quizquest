# QuizQuest Backend (Python Cloud Functions)

Backend logic for QuizQuest trivia platform built with Firebase Cloud Functions and Python.

## 🎯 Backend Team Structure

### Team Member 1: Gamification System
**Files:** Lines 28-147 in `main.py`
- XP calculation (`calculate_xp`)
- Badge system (`check_and_award_badges`)
- Level progression logic

### Team Member 2: Leaderboard & Analytics
**Files:** Lines 153-258 in `main.py`
- Leaderboard updates (`update_leaderboard`)
- Challenge leaderboards (`get_leaderboard`)
- Global leaderboard (`get_global_leaderboard`)

### Team Member 3: Quiz Logic & Validation
**Files:** Lines 264-469 in `main.py`
- Score calculation (`calculate_score`)
- Quiz validation (`validate_quiz`)
- Stats updates (`update_challenge_stats`, `update_user_stats`)

---

## 🚀 Setup

### Prerequisites
- Python 3.11+
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project configured

### Installation

```bash
# Navigate to functions directory
cd functions

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

## 💻 Development

### Local Testing

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, test functions
python test_functions.py
```

### Test Individual Functions

```python
# test_functions.py
from main import calculate_xp

# Test XP calculation
result = calculate_xp.call({
    'score': 80,
    'totalTime': 120,
    'difficulty': 'medium'
})
print(f"XP Earned: {result['totalXP']}")
```

---

## 📝 Available Functions

### Callable Functions (Frontend calls these)

#### 1. `calculate_xp`
Calculate XP earned from quiz performance.

**Input:**
```python
{
    'score': 85.5,           # Score percentage (0-100)
    'totalTime': 120,        # Time in seconds
    'difficulty': 'medium',  # 'easy', 'medium', or 'hard'
}
```

**Output:**
```python
{
    'totalXP': 327,
    'breakdown': {
        'base': 100,
        'scoreBonus': 171,
        'timeBonus': 38,
        'perfectBonus': 0,
        'multiplier': 1.5
    }
}
```

**Frontend Usage:**
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const calculateXP = httpsCallable(functions, 'calculate_xp');

const result = await calculateXP({
  score: 85.5,
  totalTime: 120,
  difficulty: 'medium'
});

console.log('XP earned:', result.data.totalXP);
```

---

#### 2. `calculate_score`
Calculate quiz score from submitted answers.

**Input:**
```python
{
    'challengeId': 'quiz-123',
    'answers': [
        {
            'answer': 'Paris',
            'timeSpent': 15
        },
        {
            'answer': 'Option B',
            'timeSpent': 20
        }
    ]
}
```

**Output:**
```python
{
    'score': 80.0,
    'correctAnswers': 8,
    'totalQuestions': 10,
    'totalTime': 150,
    'isPerfectScore': False,
    'answerDetails': [...]
}
```

---

#### 3. `get_leaderboard`
Get ranked leaderboard for a challenge.

**Input:**
```python
{
    'challengeId': 'quiz-123',
    'limit': 10  # Optional, default 10
}
```

**Output:**
```python
{
    'leaderboard': [
        {
            'rank': 1,
            'userId': 'user-abc',
            'userName': 'PlayerOne',
            'bestScore': 95.5,
            'bestTime': 120,
            'attempts': 3
        },
        ...
    ]
}
```

---

#### 4. `get_global_leaderboard`
Get global leaderboard by total XP.

**Input:**
```python
{
    'limit': 10  # Optional, default 10
}
```

---

#### 5. `validate_quiz`
Validate quiz data before publishing.

**Input:**
```python
{
    'quizData': {
        'title': 'My Quiz',
        'description': '...',
        'theme': 'Science',
        'difficulty': 'medium',
        'questions': [...]
    }
}
```

**Output:**
```python
{
    'isValid': True,
    'errors': []
}
```

---

### Trigger Functions (Run automatically)

#### 1. `check_and_award_badges`
**Trigger:** When user document is updated  
**Purpose:** Check badge criteria and award new badges

#### 2. `update_leaderboard`
**Trigger:** When new attempt is created  
**Purpose:** Update challenge leaderboard

#### 3. `update_challenge_stats`
**Trigger:** When new attempt is created  
**Purpose:** Update challenge play count and averages

#### 4. `update_user_stats`
**Trigger:** When new attempt is created  
**Purpose:** Update user XP and completion stats

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
pytest tests/

# Run specific test
pytest tests/test_xp_calculation.py

# Run with coverage
pytest --cov=main tests/
```

### Integration Tests

```bash
# Start emulators
firebase emulators:start

# In another terminal
pytest tests/integration/
```

---

## 🚀 Deployment

### Deploy All Functions

```bash
firebase deploy --only functions
```

### Deploy Specific Function

```bash
firebase deploy --only functions:calculate_xp
```

### View Logs

```bash
firebase functions:log
```

---

## 📊 Backend Task Assignments

### Week 1-2: Core Functions

**Developer 1 (Gamification):**
- [ ] Implement `calculate_xp` function
- [ ] Create badge definitions
- [ ] Implement `check_and_award_badges` trigger
- [ ] Add level progression logic
- [ ] Write unit tests

**Developer 2 (Leaderboards):**
- [ ] Implement `update_leaderboard` trigger
- [ ] Create `get_leaderboard` function
- [ ] Implement `get_global_leaderboard`
- [ ] Add ranking algorithms
- [ ] Write unit tests

**Developer 3 (Quiz Logic):**
- [ ] Implement `calculate_score` function
- [ ] Create `validate_quiz` function
- [ ] Implement stats update triggers
- [ ] Add answer validation logic
- [ ] Write unit tests

### Week 3-4: Advanced Features

**Developer 1:**
- [ ] Add streak tracking
- [ ] Implement achievement milestones
- [ ] Create XP multipliers
- [ ] Add seasonal events

**Developer 2:**
- [ ] Add time-based leaderboards (daily, weekly)
- [ ] Implement analytics endpoints
- [ ] Create stats aggregation
- [ ] Add chart data endpoints

**Developer 3:**
- [ ] Add quiz difficulty auto-adjustment
- [ ] Implement anti-cheat validation
- [ ] Add quiz moderation
- [ ] Create bulk quiz imports

---

## 🔧 Configuration

### Environment Variables

Create `.env` file (don't commit):

```bash
FIREBASE_PROJECT_ID=quizquest-f6477
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL="..."
```

---

## 📚 Resources

- [Firebase Functions Python Docs](https://firebase.google.com/docs/functions/get-started?gen=2nd#python)
- [Cloud Firestore Python](https://firebase.google.com/docs/firestore/quickstart#python)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

## 🐛 Debugging

### Check Function Logs

```bash
# Real-time logs
firebase functions:log --only calculate_xp

# Specific time range
firebase functions:log --only calculate_xp --since 1h
```

### Common Issues

**ImportError: No module named 'firebase_functions'**
```bash
pip install firebase-functions
```

**Function not deploying**
```bash
# Check Python version
python --version  # Should be 3.11+

# Check requirements.txt
cat requirements.txt
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/xp-calculation`
2. Make changes in `functions/main.py`
3. Write tests
4. Test locally: `firebase emulators:start`
5. Commit: `git commit -m "feat: add XP calculation"`
6. Push: `git push origin feature/xp-calculation`
7. Create Pull Request

---

## 📞 Team Communication

- Questions about gamification → Developer 1
- Questions about leaderboards → Developer 2
- Questions about quiz logic → Developer 3

---

Good luck, backend team! 🚀
