import React from "react";
import "./Play.css";

export default function ForcedRecallQuestion({ question, value, onChange }) {
  if (!question.table_entries || !Array.isArray(question.table_entries)) {
    return <div className="error-message">Invalid forced-recall question format.</div>;
  }

  return (
    <div className="forced-recall-table-container">
      {question.table_title && <h4 className="forced-recall-title">{question.table_title}</h4>}
      {question.description && <p className="forced-recall-desc">{question.description}</p>}
      <table className="forced-recall-table">
        <thead>
          <tr>
            <th>Entry</th>
            <th>Your Answer</th>
          </tr>
        </thead>
        <tbody>
          {question.table_entries.map((entry, idx) => (
            <tr key={entry.entry_id || idx}>
              <td>{entry.label}</td>
              <td>
                <input
                  className="forced-recall-input"
                  type="text"
                  value={value[entry.entry_id] || ""}
                  onChange={e => onChange(entry.entry_id, e.target.value)}
                  autoComplete="off"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
