import ResetPassword from './pages/ResetPassword';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Browse from './pages/Browse';
import Play from './pages/Play';
import Create from './pages/Create';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';


import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>

              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />

              <Route path="/reset-password" element={<ResetPassword />} />
              {/* Redirect logged-in users AWAY from login/signup */}
              <Route 
                path="/login" 
                element={
                  <RedirectIfLoggedIn>
                    <Login />
                  </RedirectIfLoggedIn>
                } 
              />

              <Route 
                path="/signup" 
                element={
                  <RedirectIfLoggedIn>
                    <Signup />
                  </RedirectIfLoggedIn>
                } 
              />

              {/* Protected */}
              <Route 
                path="/play/:id"
                element={
                  <ProtectedRoute>
                    <Play />
                  </ProtectedRoute>
                }
              />

              <Route 
                path="/create"
                element={
                  <ProtectedRoute>
                    <Create />
                  </ProtectedRoute>
                }
              />

              <Route 
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />

              <Route 
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

function RedirectIfLoggedIn({ children }) {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/browse" replace />;
  }

  return children;
}

export default App;
