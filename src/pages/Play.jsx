import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import axios from 'axios';
import ShortAnswerQuestion from './ShortAnswerQuestion';
import "./Play.css";


const API_URL = 'https://quizquest-production.up.railway.app/api';

function Play() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // single or array for multi
  const [shortAnswer, setShortAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
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
    const currentQuestion = challenge.questions[currentQuestionIndex];
    if (currentQuestion.type === 'multiple_choice' && Array.isArray(currentQuestion.correct_answers) && currentQuestion.correct_answers.length > 1) {
      // Multi-answer: toggle in array
      let selected = Array.isArray(selectedAnswer) ? [...selectedAnswer] : [];
      if (selected.includes(answerIndex)) {
        selected = selected.filter(idx => idx !== answerIndex);
      } else {
        selected.push(answerIndex);
      }
      setSelectedAnswer(selected);
    } else {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleNext = () => {
    const currentQuestion = challenge.questions[currentQuestionIndex];
    let answerToStore = null;
    if (currentQuestion.type === 'short_answer') {
      if (!shortAnswer.trim()) return;
      answerToStore = shortAnswer.trim();
    } else if (currentQuestion.type === 'multiple_choice' && Array.isArray(currentQuestion.correct_answers) && currentQuestion.correct_answers.length > 1) {
      if (!Array.isArray(selectedAnswer) || selectedAnswer.length === 0) return;
      answerToStore = selectedAnswer;
    } else {
      if (selectedAnswer === null) return;
      answerToStore = selectedAnswer;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerToStore;
    setAnswers(newAnswers);

    setSelectedAnswer(null);

    if (currentQuestionIndex < challenge.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      const nextQ = challenge.questions[currentQuestionIndex + 1];
      if (nextQ.type === 'short_answer') {
        setShortAnswer(newAnswers[currentQuestionIndex + 1] || "");
        setSelectedAnswer(null);
      } else if (nextQ.type === 'multiple_choice' && Array.isArray(nextQ.correct_answers) && nextQ.correct_answers.length > 1) {
        setSelectedAnswer(Array.isArray(newAnswers[currentQuestionIndex + 1]) ? newAnswers[currentQuestionIndex + 1] : []);
        setShortAnswer("");
      } else {
        setSelectedAnswer(newAnswers[currentQuestionIndex + 1] ?? null);
        setShortAnswer("");
      }
    } else {
      submitChallenge(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevQ = challenge.questions[currentQuestionIndex - 1];
      if (prevQ.type === 'short_answer') {
        setShortAnswer(answers[currentQuestionIndex - 1] || "");
        setSelectedAnswer(null);
      } else {
        setSelectedAnswer(answers[currentQuestionIndex - 1] ?? null);
        setShortAnswer("");
      }
    }
  };

  const submitChallenge = async (finalAnswers) => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    // Calculate score
    let correctCount = 0;
    challenge.questions.forEach((question, index) => {
      if (question.type === 'short_answer') {
        const userAns = (finalAnswers[index] || '').trim().toLowerCase();
        const acceptable = (question.acceptable_answers || []).map(a => a.trim().toLowerCase());
        if (acceptable.includes(userAns)) {
          correctCount++;
        }
      } else if (question.type === 'multiple_choice' && Array.isArray(question.correct_answers) && question.correct_answers.length > 1) {
        // Multi-answer: arrays must match (order-insensitive)
        const userAns = Array.isArray(finalAnswers[index]) ? finalAnswers[index].slice().sort() : [];
        const correctAns = question.correct_answers.slice().sort();
        if (userAns.length === correctAns.length && userAns.every((v, i) => v === correctAns[i])) {
          correctCount++;
        }
      } else {
        if (finalAnswers[index] === question.correct_answer || (Array.isArray(question.correct_answers) && question.correct_answers.length === 1 && finalAnswers[index] === question.correct_answers[0])) {
          correctCount++;
        }
      }
    });
    const score = (correctCount / challenge.questions.length) * 100;

    try {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      const submitted_answers = challenge.questions.map((q, idx) => ({
        question_id: q.question_id,
        text: q.options ? q.options[finalAnswers[idx]] : finalAnswers[idx],
        time_spent: 0
      }));

      const response = await axios.post(`${API_URL}/attempts/`, {
        user_uid: user.uid,
        email: user.email,
        display_name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        challenge: parseInt(id),
        total_time: totalTime,
        submitted_answers: finalAnswers
      });

      setAnswers(finalAnswers);
      window.sessionStorage.setItem('lastAttemptXP', JSON.stringify(response.data.xp_breakdown));
      window.sessionStorage.setItem('lastAttemptTime', totalTime);
      window.sessionStorage.setItem('lastAttemptScore', response.data.score || score);
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
    // Get score from backend (which handles both multiple choice and short answer)
    const backendScore = parseInt(window.sessionStorage.getItem('lastAttemptScore') || '0');
    const score = backendScore;
    
    // For display purposes, estimate correct count
    const estimatedCorrectCount = Math.round((score / 100) * challenge.questions.length);
    
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
              {estimatedCorrectCount} out of {challenge.questions.length} correct
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
            <button
              onClick={() => setShowReview(!showReview)}
              className="btn btn-secondary"
            >
              {showReview ? 'Hide Review' : 'Review Answers'}
            </button>
            <button onClick={() => navigate('/browse')} className="btn btn-secondary">
              Browse More
            </button>
            <button onClick={() => navigate('/leaderboard')} className="btn btn-primary">
              Leaderboard
            </button>
          </div>

          {showReview && (
            <div className="review-section">
              <h3>Question Review</h3>
              {challenge.questions.map((question, idx) => {
                const userAnswer = answers[idx];
                const correctAnswer = question.correct_answer;
                const isCorrect = userAnswer === correctAnswer;

                return (
                  <div key={idx} className={`review-question ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="review-question-header">
                      <span className="review-question-number">Question {idx + 1}</span>
                      <span className={`review-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    <div className="review-question-text">{question.question_text}</div>
                    <div className="review-answers">
                      {question.options.map((option, optIdx) => {
                        const isUserAnswer = userAnswer === optIdx;
                        const isCorrectAnswer = correctAnswer === optIdx;
                        
                        let className = 'review-answer';
                        if (isUserAnswer && isCorrectAnswer) {
                          className += ' correct-answer';
                        } else if (isUserAnswer && !isCorrectAnswer) {
                          className += ' your-wrong-answer';
                        } else if (isCorrectAnswer) {
                          className += ' correct-answer';
                        }

                        return (
                          <div key={optIdx} className={className}>
                            {isUserAnswer && (
                              <span className="review-answer-label your">Your Answer</span>
                            )}
                            {isCorrectAnswer && !isUserAnswer && (
                              <span className="review-answer-label correct">Correct Answer</span>
                            )}
                            <span className="review-answer-text">
                              {String.fromCharCode(65 + optIdx)}. {option}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
        <h3 className="question-text">{currentQuestion.question_text}</h3>
        {currentQuestion.type === 'short_answer' ? (
          <ShortAnswerQuestion
            question={currentQuestion}
            value={shortAnswer}
            onChange={setShortAnswer}
          />
        ) : (
          <>
            {Array.isArray(currentQuestion.correct_answers) && currentQuestion.correct_answers.length > 1 && (
              <div className="multi-answer-hint" style={{marginBottom: '8px', color: '#007bff', fontWeight: 'bold'}}>
                <span style={{display: 'inline-block', marginRight: 6, fontSize: '1.1em'}}>☑️</span> Select all that apply (multiple correct answers)
              </div>
            )}
            <div className="answers-grid">
              {currentQuestion.options.map((option, index) => {
                if (Array.isArray(currentQuestion.correct_answers) && currentQuestion.correct_answers.length > 1) {
                  // Multi-answer: use checkboxes
                  return (
                    <label key={index} className={`answer-option checkbox-option ${Array.isArray(selectedAnswer) && selectedAnswer.includes(index) ? 'selected' : ''}`} style={{display: 'flex', alignItems: 'center', cursor: 'pointer', borderRadius: 4}}>
                      <input
                        type="checkbox"
                        checked={Array.isArray(selectedAnswer) && selectedAnswer.includes(index)}
                        onChange={() => handleAnswerSelect(index)}
                        style={{width: 20, height: 20, accentColor: '#007bff', marginRight: 10, borderRadius: 3}}
                      />
                      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="option-text">{option}</span>
                    </label>
                  );
                } else {
                  // Single-answer: use button
                  return (
                    <button
                      key={index}
                      className={`answer-option ${selectedAnswer === index ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="option-text">{option}</span>
                    </button>
                  );
                }
              })}
            </div>
          </>
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
            disabled={
              currentQuestion.type === 'short_answer' ? !shortAnswer.trim() :
              (Array.isArray(currentQuestion.correct_answers) && currentQuestion.correct_answers.length > 1
                ? !Array.isArray(selectedAnswer) || selectedAnswer.length === 0
                : selectedAnswer === null)
            }
          >
            {currentQuestionIndex === challenge.questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Play;
