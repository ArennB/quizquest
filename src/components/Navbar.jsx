import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          QuizQuest
        </Link>

        <div className="nav-menu">
          <Link to="/browse" className="nav-link">Browse</Link>
          <Link to="/create" className="nav-link">Create</Link>
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
          {currentUser && <Link to="/profile" className="nav-link">Profile</Link>}
        </div>

        <div className="nav-auth">
          {currentUser ? (
            <>
              <span className="user-email">{currentUser.email}</span>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

