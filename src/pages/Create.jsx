import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import axios from 'axios';

const API_URL = 'https://quizquest-production.up.railway.app/api';

function Create() {
    const addOption = (questionIndex) => {
      const newQuestions = [...questions];
      newQuestions[questionIndex].options.push('');
      setQuestions(newQuestions);
    };

    const removeOption = (questionIndex, optionIndex) => {
      const newQuestions = [...questions];
      if (newQuestions[questionIndex].options.length > 2) {
        newQuestions[questionIndex].options.splice(optionIndex, 1);
        // Remove the index from correct_answers if present, and shift others down
        if (Array.isArray(newQuestions[questionIndex].correct_answers)) {
          newQuestions[questionIndex].correct_answers = newQuestions[questionIndex].correct_answers
            .filter(idx => idx !== optionIndex)
            .map(idx => (idx > optionIndex ? idx - 1 : idx));
        }
        setQuestions(newQuestions);
      }
    };

    const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
      const newQuestions = [...questions];
      let correct = newQuestions[questionIndex].correct_answers || [];
      if (correct.includes(optionIndex)) {
        correct = correct.filter(idx => idx !== optionIndex);
      } else {
        correct = [...correct, optionIndex];
      }
      newQuestions[questionIndex].correct_answers = correct;
      setQuestions(newQuestions);
    };
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('General');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([
    { type: 'multiple_choice', question_text: '', options: ['', '', '', ''], correct_answers: [0] }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === null) {
      // Replace entire question object
      newQuestions[index] = value;
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { type: 'multiple_choice', question_text: '', options: ['', '', '', ''], correct_answers: [0] }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    // Validation
    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setError(`Question ${i + 1} is empty`);
        return;
      }
      if (q.type === 'multiple_choice' && q.options.some(opt => !opt.trim())) {
        setError(`Question ${i + 1} has empty options`);
        return;
      }
      if (q.type === 'short_answer' && (!q.acceptable_answers || q.acceptable_answers.length === 0 || q.acceptable_answers.every(a => !a.trim()))) {
        setError(`Question ${i + 1} must have at least one acceptable answer`);
        return;
      }
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/challenges/`, {
        title,
        description,
        theme,
        difficulty,
        creator_uid: user.uid,
        questions: questions.map(q => {
          // Clean up acceptable_answers to remove empty strings
          if (q.type === 'short_answer' && q.acceptable_answers) {
            return {
              ...q,
              acceptable_answers: q.acceptable_answers.filter(a => a.trim())
            };
          }
          return q;
        })
      });

      navigate(`/play/${response.data.id}`);
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.error || 
                       JSON.stringify(err.response?.data) || 
                       err.message || 
                       'Failed to create challenge';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <div className="create-header">
        <h1>Create New Challenge</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-section">
          <h2>Challenge Details</h2>
          
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Give your challenge a catchy title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe what this challenge is about"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="General">General</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Sports">Sports</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Geography">Geography</option>
                <option value="Technology">Technology</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>Questions</h2>
            <button type="button" onClick={addQuestion} className="btn btn-secondary">
              Add Question
            </button>
          </div>

          {questions.map((question, qIndex) => (
            <div key={qIndex} className="question-block">
              <div className="question-block-header">
                <h3>Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="btn btn-danger"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  value={question.type}
                  onChange={e => {
                    const value = e.target.value;
                    let newQ;
                    if (value === 'multiple_choice') {
                      newQ = { type: 'multiple_choice', question_text: '', options: ['', '', '', ''], correct_answers: [0] };
                    } else {
                      newQ = { type: 'short_answer', question_text: '', acceptable_answers: [''] };
                    }
                    handleQuestionChange(qIndex, null, newQ);
                  }}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="short_answer">Short-Answer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Question Text</label>
                <input
                  type="text"
                  value={question.question_text}
                  onChange={e => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                  required
                  placeholder="Enter your question"
                />
              </div>

              {question.type === 'multiple_choice' ? (
                <div className="options-grid">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="option-input">
                      <label>
                        <input
                          type="checkbox"
                          checked={Array.isArray(question.correct_answers) && question.correct_answers.includes(oIndex)}
                          onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                        />
                        Option {String.fromCharCode(65 + oIndex)}
                      </label>
                      <input
                        type="text"
                        className="option-input"
                        value={option}
                        onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                        required
                        placeholder="Insert option here"
                      />
                      {question.options.length > 2 && (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeOption(qIndex, oIndex)}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => addOption(qIndex)}>
                    + Add Option
                  </button>
                </div>
              ) : (
                <div className="form-group">
                  <label>Acceptable Answers (comma separated)</label>
                  <input
                    type="text"
                    value={question.acceptable_answers ? question.acceptable_answers.join(', ') : ''}
                    onChange={e => handleQuestionChange(qIndex, 'acceptable_answers', e.target.value.split(',').map(s => s.trim()))}
                    required
                    placeholder="e.g. answer1, answer2"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
          {loading ? 'Creating Challenge...' : 'Create Challenge'}
        </button>
      </form>
    </div>
  );
}

export default Create;
