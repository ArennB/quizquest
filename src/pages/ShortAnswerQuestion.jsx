import React from "react";
import "./Play.css";

export default function ShortAnswerQuestion({ question, value, onChange }) {
  return (
    <div className="short-answer-container">
      {question.description && <p className="short-answer-desc">{question.description}</p>}
      <input
        className="short-answer-input"
        type="text"
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
        placeholder="Type your answer here"
      />
    </div>
  );
}
