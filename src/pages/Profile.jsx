import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { getMyQuizzes, deleteQuiz } from "../services/challengeService";
import axios from "axios";

const API_URL = "http://localhost:8000/api"; 

export default function Profile() {
  const { currentUser } = useAuth();
  const [myQuizzes, setMyQuizzes] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    getMyQuizzes(currentUser.uid)
      .then(res => setMyQuizzes(res.data))
      .catch(err => console.error(err));
  }, [currentUser]);
  
  const handleDelete = async (id, title) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    if (!currentUser) {
      alert("You must be logged in to delete quizzes.");
      return;
    }
    
    try {
      // ensure we always send the UID header
      await deleteQuiz(id, currentUser.uid);

      setMyQuizzes(prev => prev.filter(q => q.id !== id));
      alert(`quiz "${title}" deleted`);
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message || err);
      // show backend message if present
      const msg = err.response?.data?.error || err.response?.statusText || "Failed to delete quiz.";
      alert(msg);
    }
  };



  // Temporary placeholder data (replace later with backend)
  const level = 1;
  const xp = 40;
  const nextLevelXp = 100;

  const xpPercent = (xp / nextLevelXp) * 100;

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Profile</h1>
      
      <h3>Your Created Quizzes</h3>
      
      {myQuizzes.length === 0 && <p>No quizzes created yet.</p>}
      
      {myQuizzes.map(quiz => (
        <div key={quiz.id} style={{
          padding: "10px",
          background: "#000000",
          borderRadius: "10px",
          marginBottom: "10px"
        }}>
          <h4>{quiz.title}</h4>
          <p>Difficulty: {quiz.difficulty}</p>
          <p>Theme: {quiz.theme}</p>

          <button 
            onClick={() => handleDelete(quiz.id, quiz.title)}
            style={{ marginRight: "10px" }}
          >
            Delete
          </button>

          <button onClick={() => alert("TODO: Edit page")}>
            Edit
          </button>
        </div>
      ))}

      {/* USER INFO */}
      <div style={{ marginTop: "1rem" }}>
        <h3>User Info</h3>
        <p><strong>Email:</strong> {currentUser?.email}</p>
        <p><strong>UID:</strong> {currentUser?.uid}</p>
      </div>

      {/* LEVEL + XP BAR */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Level {level}</h2>

        <div
          style={{
            height: "20px",
            width: "100%",
            background: "#ddd",
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "5px",
          }}
        >
          <div
            style={{
              width: `${xpPercent}%`,
              height: "100%",
              background: "#4caf50",
              transition: "0.3s",
            }}
          ></div>
        </div>

        <p>{xp} / {nextLevelXp} XP</p>
      </div>

      {/* BADGES */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Badges</h2>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <span style={{
            padding: "6px 12px",
            background: "#eee",
            borderRadius: "8px"
          }}>
            🥉 Beginner
          </span>

          <span style={{
            padding: "6px 12px",
            background: "#eee",
            borderRadius: "8px"
          }}>
            ⭐ First Quiz
          </span>
        </div>
      </div>
    </div>
  );
}
