

import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { userApi } from "../services/api";
import Leaderboard from "./Leaderboard";

export default function Profile() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      if (!currentUser?.uid) return;
      try {
        const response = await userApi.getById(currentUser.uid);
        setUserData(response.data);
      } catch (err) {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [currentUser]);

  // Level calculation (example: every 1000 XP = new level)
  const totalXp = userData?.total_xp || 0;
  const level = Math.floor(totalXp / 1000) + 1;
  const nextLevelXp = level * 1000;
  const xpPercent = ((totalXp % 1000) / 1000) * 100;


  if (loading) return <div>Loading profile...</div>;

  // If user not found (404), show new user message and leaderboard
  if (error) {
    return (
      <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <h1>Welcome, new QuizQuest user!</h1>
        <div className="info-message" style={{ margin: "1.5rem 0", background: "#f3f4f6", padding: "1.5rem", borderRadius: "10px" }}>
          <p>
            You don't have any profile data yet. Start playing quizzes to earn XP, unlock badges, and appear on the leaderboard!
          </p>
        </div>
        <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          <Leaderboard />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Profile</h1>

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

        <p>{totalXp} / {nextLevelXp} XP</p>
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
