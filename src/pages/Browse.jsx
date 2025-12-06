import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "./Browse.css";


const API_URL = 'https://quizquest-production.up.railway.app/api';

function Browse() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

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

  const filteredChallenges = challenges
    .filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((c) =>
      filter === 'all' ? true : c.difficulty === filter
    );

  if (loading) {
    return <div className="loading">Loading challenges...</div>;
  }

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h1>Browse Challenges</h1>
        <Link to="/create" className="btn btn-primary">
          + Create Challenge
        </Link>
      </div>

      {/* Search Bar */}
      <div className="browse-controls">
        <input
          type="text"
          className="search-bar"
          placeholder="Search challenges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filter Buttons */}
        <div className="filter-bar">
          {['all', 'easy', 'medium', 'hard'].map((level) => (
            <button
              key={level}
              className={filter === level ? 'active' : ''}
              onClick={() => setFilter(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Grid of Challenges */}
      <div className="challenges-grid">
        {filteredChallenges.length === 0 ? (
          <p className="no-challenges">No challenges found.</p>
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
                <span className="questions">
                  {challenge.questions?.length || 0} questions
                </span>
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
