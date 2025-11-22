import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

function Browse() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, easy, medium, hard

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await axios.get(`${API_URL}/challenges/`);
      setChallenges(response.data);
    } catch (err) {
      setError('Failed to load challenges');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = filter === 'all' 
    ? challenges 
    : challenges.filter(c => c.difficulty === filter);

  if (loading) {
    return <div className="loading">Loading challenges...</div>;
  }

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h1>Browse Challenges</h1>
        <Link to="/create" className="btn btn-primary">
          Create New Challenge
        </Link>
      </div>

      <div className="filter-bar">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'easy' ? 'active' : ''} 
          onClick={() => setFilter('easy')}
        >
          Easy
        </button>
        <button 
          className={filter === 'medium' ? 'active' : ''} 
          onClick={() => setFilter('medium')}
        >
          Medium
        </button>
        <button 
          className={filter === 'hard' ? 'active' : ''} 
          onClick={() => setFilter('hard')}
        >
          Hard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="challenges-grid">
        {filteredChallenges.length === 0 ? (
          <p className="no-challenges">No challenges found. Be the first to create one!</p>
        ) : (
          filteredChallenges.map((challenge) => (
            <div key={challenge.id} className="challenge-card">
              <div className="challenge-header">
                <h3>{challenge.title}</h3>
                <span className={`difficulty-badge ${challenge.difficulty}`}>
                  {challenge.difficulty}
                </span>
              </div>
              <p className="challenge-description">{challenge.description}</p>
              <div className="challenge-meta">
                <span className="theme">{challenge.theme}</span>
                <span className="questions">{challenge.questions?.length || 0} questions</span>
              </div>
              <div className="challenge-stats">
                <span>⭐ {challenge.average_rating?.toFixed(1) || 'N/A'}</span>
                <span>👥 {challenge.total_attempts || 0} attempts</span>
              </div>
              <Link to={`/play/${challenge.id}`} className="btn btn-primary">
                Start Challenge
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Browse;
