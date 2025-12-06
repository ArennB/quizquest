import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";

const API_URL = "http://localhost:8000/api";
const MIN_CHOICES = 2;
const MAX_CHOICES = 8;
const DEFAULT_CHOICES = 4;

export default function ChallengeEdit() {
  const { id } = useParams();   // challenge ID from URL
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // FORM STATE
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("General");
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([]);

  // ---------------------------
  // FETCH EXISTING CHALLENGE
  // ---------------------------
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await axios.get(`${API_URL}/challenges/${id}`);

        const challenge = response.data;

        const normalized = (challenge.questions || []).map(q => {
          const options = q.options || q.choices || [];
          let correct_answers = q.correct_answers;
          if (correct_answers == null && q.correct_answer != null) {
            correct_answers = [q.correct_answer];
          }
          if (!Array.isArray(correct_answers)) {
            correct_answers = Array.isArray(correct_answers) ? correct_answers : [];
          }
          const choices_count = Math.max(DEFAULT_CHOICES, options.length || DEFAULT_CHOICES);
          // pad options if necessary
          const opts = options.slice(0, choices_count);
          while (opts.length < choices_count) opts.push('');
          return {
            question_text: q.question_text || "",
            options: opts,
            correct_answers: correct_answers.length ? correct_answers : [0],
            choices_count
          };
        });

        // Pre-fill form
        setTitle(challenge.title);
        setDescription(challenge.description);
        setTheme(challenge.theme);
        setDifficulty(challenge.difficulty);
        setQuestions(challenge.questions);

        setLoading(false);
      } catch (err) {
        setError("Failed to load challenge.");
        console.error(err);
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id]);

  // ---------------------------
  // HANDLE QUESTION/OPTION CHANGES
  // ---------------------------
  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleToggleCorrect = (qIndex, oIndex) => {
    const updated = [...questions];
    const arr = updated[qIndex].correct_answers || [];
    if (arr.includes(oIndex)) {
      updated[qIndex].correct_answers = arr.filter(x => x !== oIndex);
    } else {
      updated[qIndex].correct_answers = [...arr, oIndex];
    }
    setQuestions(updated);
  };

  const handleChoicesCountChange = (qIndex, newCount) => {
    const updated = [...questions];
    const q = updated[qIndex];
    const count = parseInt(newCount, 10);
    const opts = q.options.slice(0, count);
    while (opts.length < count) opts.push('');
    q.options = opts;
    q.correct_answers = (q.correct_answers || []).filter(i => i < count);
    if ((q.correct_answers || []).length === 0) {
      q.correct_answers = [0];
    }
    q.choices_count = count;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question_text: "", options: ["", "", "", ""], correct_answer: 0 },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // ---------------------------
  // SUBMIT EDIT
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    setSaving(true);

    try {
      await axios.put(`${API_URL}/challenges/${id}/`, {
        title,
        description,
        difficulty,
        theme,
        questions,
      });

      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError("Failed to save changes.");
    }

    setSaving(false);
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  if (loading) return <h2>Loading challenge…</h2>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="edit-page">
      <h1>Edit Challenge</h1>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Challenge Info</h2>

          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Theme</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option>General</option>
            <option>Science</option>
            <option>History</option>
            <option>Sports</option>
            <option>Entertainment</option>
            <option>Geography</option>
            <option>Technology</option>
          </select>

          <label>Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <h2>Questions</h2>
        <button type="button" onClick={addQuestion}>
          Add Question
        </button>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="question-block">
            <h3>
              Question {qIndex + 1}
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(qIndex)} type="button">
                  Remove
                </button>
              )}
            </h3>

            <label>Question Text</label>
            <input
              value={q.question_text}
              onChange={(e) =>
                handleQuestionChange(qIndex, "question_text", e.target.value)
              }
            />

            <div className="form-row">
              <label>Number of Options</label>
              <select
                value={q.choices_count || q.options.length}
                onChange={(e) => handleChoicesCountChange(qIndex, e.target.value)}
              >
                {Array.from({length: MAX_CHOICES - MIN_CHOICES + 1}, (_, i) => MIN_CHOICES + i).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="options-grid">
              {q.options.map((option, oIndex) => (
                <div key={oIndex}>
                  <label>
                    <input
                      type="checkbox"
                      checked={(q.correct_answers || []).includes(oIndex)}
                      onChange={() =>
                        handleToggleCorrect(qIndex, oIndex)
                      }
                    />
                    Correct
                  </label>

                  <input
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(qIndex, oIndex, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}