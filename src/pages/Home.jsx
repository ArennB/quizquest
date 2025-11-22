import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>QuizQuest</h1>
        <p>Challenge yourself with trivia quizzes and compete with friends!</p>
        <div className="cta-buttons">
          <Link to="/browse" className="btn btn-primary">
            Browse Challenges
          </Link>
          <Link to="/create" className="btn btn-secondary">
            Create Challenge
          </Link>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>🎯 Take Challenges</h3>
          <p>Test your knowledge across various topics and difficulty levels</p>
        </div>
        <div className="feature-card">
          <h3>🏆 Compete</h3>
          <p>Climb the leaderboard and prove you're the best</p>
        </div>
        <div className="feature-card">
          <h3>✨ Create</h3>
          <p>Design your own quizzes and challenge others</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
