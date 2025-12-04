import { useState, useEffect } from 'react';
import ForcedRecallQuestion from './ForcedRecallQuestion';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import axios from 'axios';
import "./Play.css";


const API_URL = 'http://localhost:8000/api';

function Play() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [forcedRecallAnswers, setForcedRecallAnswers] = useState({});
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (!startTime || showResult) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, showResult]);

  const fetchChallenge = async () => {
    try {
      const response = await axios.get(`${API_URL}/challenges/${id}/`);
      setChallenge(response.data);
      setAnswers(new Array(response.data.questions.length).fill(null));
      setStartTime(Date.now()); // Start timer when challenge loads
    } catch (err) {
      setError('Failed to load challenge');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setForcedRecallAnswers({}); // reset forced recall answers if switching back
  };

  const handleForcedRecallChange = (entryId, value) => {
    setForcedRecallAnswers(prev => ({ ...prev, [entryId]: value }));
    setSelectedAnswer(null); // reset selectedAnswer if using forced recall
  };

  const handleNext = () => {
    const currentQuestion = challenge.questions[currentQuestionIndex];
    let answerToStore = null;
    if (currentQuestion.type === 'forced_recall') {
      answerToStore = { table_entries: forcedRecallAnswers, question_id: currentQuestion.question_id, time_spent: 0 };
      if (Object.keys(forcedRecallAnswers).length === 0) return; // require at least one entry
    } else {
      if (selectedAnswer === null) return;
      answerToStore = selectedAnswer;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerToStore;
    setAnswers(newAnswers);

    setForcedRecallAnswers({});
    setSelectedAnswer(null);

    if (currentQuestionIndex < challenge.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Pre-fill selectedAnswer/forcedRecallAnswers for next question if needed
      const nextQ = challenge.questions[currentQuestionIndex + 1];
      if (nextQ.type === 'forced_recall') {
        setForcedRecallAnswers(newAnswers[currentQuestionIndex + 1]?.table_entries || {});
      } else {
        setSelectedAnswer(newAnswers[currentQuestionIndex + 1] ?? null);
      }
    } else {
      submitChallenge(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevQ = challenge.questions[currentQuestionIndex - 1];
      if (prevQ.type === 'forced_recall') {
        setForcedRecallAnswers(answers[currentQuestionIndex - 1]?.table_entries || {});
        setSelectedAnswer(null);
      } else {
        setSelectedAnswer(answers[currentQuestionIndex - 1] ?? null);
        setForcedRecallAnswers({});
      }
    }
  };

  const submitChallenge = async (finalAnswers) => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      // Prepare answers for backend: forced-recall answers are objects, others are indices
      const submitted_answers = challenge.questions.map((q, idx) => {
        if (q.type === 'forced_recall') {
          return {
            question_id: q.question_id,
            table_entries: finalAnswers[idx]?.table_entries || {},
            time_spent: 0
          };
        } else {
          return {
            question_id: q.question_id,
            text: q.options ? q.options[finalAnswers[idx]] : finalAnswers[idx],
            time_spent: 0
          };
        }
      });

      const response = await axios.post(`${API_URL}/attempts/`, {
        user_uid: user.uid,
        email: user.email,
        display_name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        challenge: parseInt(id),
        submitted_answers,
        total_time: totalTime
      });

      setAnswers(finalAnswers);
      window.sessionStorage.setItem('lastAttemptXP', JSON.stringify(response.data.xp_breakdown));
      window.sessionStorage.setItem('lastAttemptTime', totalTime);
      setShowResult(true);
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.detail || 
                       JSON.stringify(err.response?.data) || 
                       err.message || 
                       'Failed to submit challenge';
      setError(errorMsg);
    }
  };

  if (loading) {
    return <div className="loading">Loading challenge...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!challenge || !challenge.questions || challenge.questions.length === 0) {
    return <div className="error-message">No questions found in this challenge.</div>;
  }

  if (showResult) {
    const correctCount = answers.filter((ans, idx) => 
      ans === challenge.questions[idx].correct_answer
    ).length;
    const score = (correctCount / challenge.questions.length) * 100;
    
    // Get XP breakdown and time from session storage
    const xpData = JSON.parse(window.sessionStorage.getItem('lastAttemptXP') || '{}');
    const completionTime = parseInt(window.sessionStorage.getItem('lastAttemptTime') || '0');
    const minutes = Math.floor(completionTime / 60);
    const seconds = completionTime % 60;

    return (
      <div className="result-page">
        <div className="result-container">
          <h1>Challenge Complete! 🎉</h1>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score.toFixed(0)}%</span>
            </div>
            <p className="score-text">
              {correctCount} out of {challenge.questions.length} correct
            </p>
            <p className="time-text">
              ⏱️ Completed in {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
            </p>
          </div>

          {xpData.total_xp && (
            <div className="xp-display">
              <h2 className="xp-earned">+{xpData.total_xp} XP Earned! ⭐</h2>
              <div className="xp-breakdown">
                <div className="xp-item">
                  <span>Base XP:</span>
                  <span>{xpData.base_xp} XP</span>
                </div>
                <div className="xp-item">
                  <span>Difficulty Bonus ({challenge.difficulty}):</span>
                  <span>×{xpData.difficulty_multiplier}</span>
                </div>
                {xpData.first_time_bonus > 0 && (
                  <div className="xp-item bonus">
                    <span>First Time Bonus:</span>
                    <span>+{xpData.first_time_bonus} XP 🎊</span>
                  </div>
                )}
                {xpData.perfect_bonus > 0 && (
                  <div className="xp-item bonus">
                    <span>Perfect Score Bonus:</span>
                    <span>+{xpData.perfect_bonus} XP 💯</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="result-actions">
            <button onClick={() => navigate('/browse')} className="btn btn-secondary">
              Browse More Challenges
            </button>
            <button onClick={() => navigate('/leaderboard')} className="btn btn-primary">
              View Leaderboard
            </button>
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
          <div className="timer">
            ⏱️ {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="question-counter">
          Question {currentQuestionIndex + 1} of {challenge.questions.length}
        </span>
      </div>

      <div className="question-container">
        <h3 className="question-text">{currentQuestion.type === 'forced_recall' ? currentQuestion.text : currentQuestion.question_text}</h3>
        {currentQuestion.type === 'forced_recall' ? (
          <ForcedRecallQuestion
            question={currentQuestion}
            value={forcedRecallAnswers}
            onChange={handleForcedRecallChange}
          />
        ) : (
          <div className="answers-grid">
            {currentQuestion.options && currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`answer-option ${selectedAnswer === index ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(index)}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
        )}

        <div className="navigation-buttons">
          <button 
            onClick={handlePrevious} 
            className="btn btn-secondary"
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          <button 
            onClick={handleNext} 
            className="btn btn-primary"
            disabled={currentQuestion.type === 'forced_recall' ? Object.keys(forcedRecallAnswers).length === 0 : selectedAnswer === null}
          >
            {currentQuestionIndex === challenge.questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Play;
