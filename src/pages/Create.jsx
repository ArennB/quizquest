import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { createQuiz } from "../services/challengeService";

const MIN_CHOICES = 2;
const MAX_CHOICES = 8;
const DEFAULT_CHOICES = 4;

function Create() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('General');
  const [difficulty, setDifficulty] = useState('medium');

  const [questions, setQuestions] = useState([
    {
      type: "multiple_choice",
      question_text: "",
      options: Array(DEFAULT_CHOICES).fill(""),
      correct_answers: [],
      choices_count: DEFAULT_CHOICES
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === null) {
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

  const handleToggleCorrect = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    const arr = newQuestions[qIndex].correct_answers || [];
    const has = arr.includes(oIndex);
    newQuestions[qIndex].correct_answers = has ? arr.filter(x => x !== oIndex) : [...arr, oIndex];
    setQuestions(newQuestions);
  };

  const handleChoicesCountChange = (qIndex, newCount) => {
    const newQuestions = [...questions];
    const q = newQuestions[qIndex];
    const count = parseInt(newCount, 10);
    const opts = q.options.slice(0, count);
    while (opts.length < count) opts.push('');
    q.options = opts;
    q.correct_answers = (q.correct_answers || []).filter(i => i < count);
    if ((q.correct_answers || []).length === 0) q.correct_answers = [0];
    q.choices_count = count;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "multiple_choice",
        question_text: "",
        options: Array(DEFAULT_CHOICES).fill(""),
        correct_answers: [],
        choices_count: DEFAULT_CHOICES,
      }
    ]);
  };


  const removeQuestion = (index) => {
    if (questions.length > 1) setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
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
      if (!q.question_text || !q.question_text.trim()) {
        setError(`Question ${i + 1} is empty`);
        return;
      }
      if (!Array.isArray(q.options) || q.options.some(opt => !opt.trim())) {
        setError(`Question ${i + 1} has empty options`);
        return;
      }
      if (!Array.isArray(q.correct_answers) || q.correct_answers.length === 0) {
        setError(`Question ${i + 1} must have at least one correct answer`);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        title,
        description,
        theme,
        difficulty,
        creator_uid: currentUser.uid,
        questions
      };

      const response = await createQuiz(payload, currentUser.uid);
      navigate(`/play/${response.data.id}`);
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error creating quiz:', err.response?.data?.message || err.message);
      setError('Failed to create quiz. Please try again later.');
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

          {questions.map((q, qIndex) => (
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
                  value={q.type}
                  onChange={(e) => {
                    const value = e.target.value;

                    let newQ = { ...q };

                    if (value === "multiple_choice") {
                      newQ = {
                        type: "multiple_choice",
                        question_text: "",
                        choices_count: q.choices_count || 4,
                        options: q.options || ["", "", "", ""],
                        correct_answers: q.correct_answers || []
                      };
                    } else {
                      newQ = {
                        type: "short_answer",
                        question_text: "",
                        acceptable_answers: q.acceptable_answers || [""]
                      };
                    }

                    handleQuestionChange(qIndex, null, newQ);
                  }}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>
              <div className="form-group">
                <label>Question Text</label>
                <input
                  type="text"
                  value={q.question_text}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "question_text", e.target.value)
                  }
                  required
                  placeholder="Enter your question"
                />
              </div>
              {q.type === "multiple_choice" && (
                <>
                  <div className="options-grid">
                    {Array.from({ length: q.choices_count }).map((_, oIndex) => (
                      <div key={oIndex} className="option-input">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={q.correct_answers.includes(oIndex)}
                            onChange={() => handleToggleCorrect(qIndex, oIndex)}
                          />
                          Correct
                        </label>

                        <input
                          type="text"
                          value={q.options[oIndex] || ""}
                          onChange={(e) =>
                            handleOptionChange(qIndex, oIndex, e.target.value)
                          }
                          required
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="form-group">
                    <label>Number of Choices</label>
                    <input
                      type="number"
                      min={MIN_CHOICES}
                      max={MAX_CHOICES}
                      value={q.choices_count}
                      onChange={(e) =>
                        handleChoicesCountChange(qIndex, e.target.value)
                      }
                    />
                  </div>
                </>
              )}
              {q.type === "short_answer" && (
                <div className="form-group">
                  <label>Acceptable Answers (comma separated)</label>
                  <input
                    type="text"
                    value={
                      q.acceptable_answers
                        ? q.acceptable_answers.join(", ")
                        : ""
                    }
                    onChange={(e) =>
                      handleQuestionChange(
                        qIndex,
                        "acceptable_answers",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    required
                    placeholder="e.g. answer1, answer2"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
          {loading ? "Creating Challenge..." : "Create Challenge"}
        </button>
      </form>
    </div>
  );

}

export default Create;
