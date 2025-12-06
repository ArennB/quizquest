import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Play.css";
import { useAuth } from "../context/AuthContext";
import { getChallenge } from "../services/challengeService";

const API_URL = "http://localhost:8000/api";

export default function Play() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]); // array per question
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUser?.uid]);

  useEffect(() => {
    if (!startTime || showResult) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, showResult]);

  async function fetchChallenge() {
    try {
      setLoading(true);
      const res = await getChallenge(id);
      const data = res.data;
      setChallenge(data);
      setSelectedAnswers(new Array(data.questions?.length || 0).fill([]));
      setAnswers(new Array(data.questions?.length || 0).fill([]));
      setStartTime(Date.now());
      setError("");
    } catch (err) {
      console.error("Failed to load challenge:", err);
      setError("Failed to load challenge");
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerSelect(answerIndex) {
    const cur = selectedAnswers[currentQuestionIndex] || [];
    const has = cur.includes(answerIndex);
    const updated = has ? cur.filter(i => i !== answerIndex) : [...cur, answerIndex];
    const next = [...selectedAnswers];
    next[currentQuestionIndex] = updated;
    setSelectedAnswers(next);
  }

  function handleNext() {
    const curSel = selectedAnswers[currentQuestionIndex] || [];
    if (!curSel.length) return;
    const nextAnswers = [...answers];
    nextAnswers[currentQuestionIndex] = curSel;
    setAnswers(nextAnswers);

    if (currentQuestionIndex < (challenge?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      submitChallenge(nextAnswers);
    }
  }

  function handlePrevious() {
    setCurrentQuestionIndex(i => Math.max(0, i - 1));
  }

  async function submitChallenge(finalAnswers) {
    const user = currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    // compute score
    let correctCount = 0;
    (challenge.questions || []).forEach((q, idx) => {
      const selected = finalAnswers[idx] || [];
      const correct = q.correct_answers ?? (q.correct_answer != null ? [q.correct_answer] : []);
      const selSet = new Set(selected);
      const corrSet = new Set(Array.isArray(correct) ? correct : []);
      const equal = selSet.size === corrSet.size && [...selSet].every(x => corrSet.has(x));
      if (equal && corrSet.size > 0) correctCount++;
    });

    const score = (challenge.questions?.length ? (correctCount / challenge.questions.length) * 100 : 0);

    try {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      const res = await axios.post(`${API_URL}/attempts/`, {
        user_uid: user.uid,
        email: user.email,
        display_name: user.displayName || user.email?.split("@")[0] || "Anonymous",
        challenge: parseInt(id, 10),
        score,
        total_time: totalTime,
        answers: finalAnswers
      });

      setAnswers(finalAnswers);
      window.sessionStorage.setItem("lastAttemptXP", JSON.stringify(res.data.xp_breakdown || {}));
      window.sessionStorage.setItem("lastAttemptTime", totalTime.toString());
      setShowResult(true);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.response?.data?.detail || err.response?.data?.error || "Failed to submit challenge");
    }
  }

  if (loading) return <div className="loading">Loading challenge...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!challenge) return <div className="error-message">No challenge found.</div>;
  if (!challenge.questions || challenge.questions.length === 0) return <div className="error-message">No questions found in this challenge.</div>;

  if (showResult) {
    const correctCount = answers.filter((ans, idx) => {
      const correct = challenge.questions[idx].correct_answers ?? (challenge.questions[idx].correct_answer != null ? [challenge.questions[idx].correct_answer] : []);
      const selSet = new Set(ans || []);
      const corrSet = new Set(Array.isArray(correct) ? correct : []);
      return selSet.size === corrSet.size && [...selSet].every(x => corrSet.has(x));
    }).length;
    const score = (correctCount / challenge.questions.length) * 100;
    const xpData = JSON.parse(window.sessionStorage.getItem("lastAttemptXP") || "{}");
    const completionTime = parseInt(window.sessionStorage.getItem("lastAttemptTime") || "0", 10);
    const minutes = Math.floor(completionTime / 60);
    const seconds = completionTime % 60;

    return (
      <div className="result-page">
        <div className="result-container">
          <h1>Challenge Complete! 🎉</h1>
          <div className="score-display">
            <div className="score-circle"><span className="score-number">{score.toFixed(0)}%</span></div>
            <p>{correctCount} out of {challenge.questions.length} correct</p>
            <p>⏱️ Completed in {minutes > 0 ? `${minutes}m ` : ""}{seconds}s</p>
          </div>
          {xpData.total_xp && <div className="xp-display">You earned {xpData.total_xp} XP</div>}
          <div className="result-actions">
            <button onClick={() => navigate("/browse")} className="btn">Browse</button>
            <button onClick={() => navigate("/leaderboard")} className="btn">Leaderboard</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = challenge.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / challenge.questions.length) * 100;
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  return (
    <div className="play-page">
      <div className="play-header">
        <div className="header-top">
          <h2>{challenge.title}</h2>
          <div className="timer">⏱️ {minutes}:{seconds.toString().padStart(2, "0")}</div>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <span>Question {currentQuestionIndex + 1} of {challenge.questions.length}</span>
      </div>

      <div className="question-container">
        <h3>{currentQuestion.question_text}</h3>
        <div className="answers-grid">
          {currentQuestion.options.map((opt, idx) => (
            <button
              key={idx}
              className={`answer-option ${selectedAnswers[currentQuestionIndex]?.includes(idx) ? "selected" : ""}`}
              onClick={() => handleAnswerSelect(idx)}
            >
              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="option-text">{opt}</span>
            </button>
          ))}
        </div>

        <div className="navigation-buttons">
          <button onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="btn">Previous</button>
          <button onClick={handleNext} className="btn" disabled={(selectedAnswers[currentQuestionIndex] || []).length === 0}>
            {currentQuestionIndex === challenge.questions.length - 1 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
