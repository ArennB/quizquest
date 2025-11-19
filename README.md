# QuizQuest 🎯

A community-driven trivia adventure platform where traditional quizzes are transformed into themed journeys. Create, play, and compete in custom trivia challenges with friends!

## 🚀 Quick Start

### Prerequisites
- **Node.js 20.19+** or **22.12+** (check with `node --version`)
- npm or yarn
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/ArennB/quizquest.git
cd quizquest

# Install dependencies
npm install

# Get Firebase config from your team lead and create .env.local
cp .env.example .env.local
# Then fill in your Firebase credentials

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

## 📚 Documentation

- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Complete technical implementation plan
- **[TEAM_SETUP.md](./TEAM_SETUP.md)** - Team onboarding and Firebase setup
- **[PRD](./PRD.md)** - Product Requirements Document

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **Firebase** - Authentication & Database
- **React Router** - Navigation
- **Tailwind CSS** - Styling

## 👥 Team

- **Da'karri Jenkins, Elias Zegeye, Arenn Banks, Erin McCoomer, Stephen Ganthier**

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔥 Features

- ✅ User authentication (Email/Password, Google, Anonymous)
- 🎮 Create custom trivia challenges
- 📊 Leaderboards and scoring
- 🏆 XP and badge systems
- 🌐 Social sharing
- 📱 Responsive design

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Commit: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details
