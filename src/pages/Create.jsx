import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

function Create() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('General');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([
    { type: 'multiple_choice', question_text: '', options: ['', '', '', ''], correct_answer: 0, question_id: `q_${Date.now()}` }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    // If type changes, reset fields
    if (field === 'type') {
      if (value === 'multiple_choice') {
        newQuestions[index] = {
          type: 'multiple_choice',
          question_text: '',
          options: ['', '', '', ''],
          correct_answer: 0,
          question_id: newQuestions[index].question_id || `q_${Date.now()}`
        };
      } else if (value === 'forced_recall') {
        newQuestions[index] = {
          type: 'forced_recall',
          text: '',
          table_title: '',
          description: '',
          table_entries: [],
          question_id: newQuestions[index].question_id || `q_${Date.now()}`
        };
      }
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
      { type: 'multiple_choice', question_text: '', options: ['', '', '', ''], correct_answer: 0, question_id: `q_${Date.now()}` }
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
      if (q.options.some(opt => !opt.trim())) {
        setError(`Question ${i + 1} has empty options`);
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
        questions
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
                <select value={question.type} onChange={e => handleQuestionChange(qIndex, 'type', e.target.value)}>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="forced_recall">Forced Recall</option>
                </select>
              </div>

              {question.type === 'multiple_choice' ? (
                <>
                  <div className="form-group">
                    <label>Question Text</label>
                    <input
                      type="text"
                      value={question.question_text}
                      onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                      required
                      placeholder="Enter your question"
                    />
                  </div>
                  <div className="options-grid">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="option-input">
                        <label>
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correct_answer === oIndex}
                            onChange={() => handleQuestionChange(qIndex, 'correct_answer', oIndex)}
                          />
                          Option {String.fromCharCode(65 + oIndex)}
                        </label>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          required
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Question Text</label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)}
                      required
                      placeholder="Enter your forced-recall question"
                    />
                  </div>
                  <div className="form-group">
                    <label>Table Title</label>
                    <input
                      type="text"
                      value={question.table_title || ''}
                      onChange={e => handleQuestionChange(qIndex, 'table_title', e.target.value)}
                      placeholder="e.g. Characters Table"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={question.description || ''}
                      onChange={e => handleQuestionChange(qIndex, 'description', e.target.value)}
                      placeholder="Describe the forced-recall task"
                    />
                  </div>
                  <div className="form-group">
                    <ForcedRecallEditor
                      question={question}
                      onChange={(field, value) => handleQuestionChange(qIndex, field, value)}
                    />
                  </div>
                </>
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
