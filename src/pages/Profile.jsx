import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { currentUser } = useAuth();

  // Temporary placeholder data (replace later with backend)
  const level = 1;
  const xp = 40;
  const nextLevelXp = 100;

  const xpPercent = (xp / nextLevelXp) * 100;

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
