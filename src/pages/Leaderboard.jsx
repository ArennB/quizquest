import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/`);
      // Sort by total XP descending
      const sortedUsers = response.data.sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0));
      setUsers(sortedUsers);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p>See how you rank against other players</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="leaderboard-table">
        <div className="table-header">
          <span className="rank">Rank</span>
          <span className="username">Player</span>
          <span className="score">Total XP</span>
          <span className="challenges">Challenges</span>
          <span className="avg-time">Avg Time</span>
        </div>

        {users.length === 0 ? (
          <p className="no-data">No players yet. Be the first!</p>
        ) : (
          users.map((user, index) => {
            const avgMinutes = Math.floor((user.average_time || 0) / 60);
            const avgSeconds = (user.average_time || 0) % 60;
            const timeDisplay = avgMinutes > 0 
              ? `${avgMinutes}m ${avgSeconds}s` 
              : `${avgSeconds}s`;
            
            return (
              <div key={user.firebase_uid} className={`leaderboard-row ${index < 3 ? 'top-three' : ''}`}>
                <span className="rank">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </span>
                <span className="username">{user.display_name || 'Anonymous'}</span>
                <span className="score">{user.total_xp || 0} XP</span>
                <span className="challenges">{user.challenges_completed || 0}</span>
                <span className="avg-time">{timeDisplay}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
