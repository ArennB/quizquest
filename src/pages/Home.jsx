import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>QuizQuest</h1>
        <p>Challenge yourself with trivia quizzes and compete with friends!</p>
        {/* Removed CTA buttons */}
      </div>

      <div className="features">
        <Link to="/browse" className="feature-card feature-btn">
          <h3>🎯 Take Challenges</h3>
          <p>Test your knowledge across various topics and difficulty levels</p>
        </Link>
        <Link to="/leaderboard" className="feature-card feature-btn">
          <h3>🏆 Compete</h3>
          <p>Climb the leaderboard and prove you're the best</p>
        </Link>
        <Link to="/create" className="feature-card feature-btn">
          <h3>✨ Create</h3>
          <p>Design your own quizzes and challenge others</p>
        </Link>
      </div>
    </div>
  );
}

export default Home;
