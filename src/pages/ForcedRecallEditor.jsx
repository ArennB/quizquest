import React from "react";
import "./Create.css";

export default function ForcedRecallEditor({ question, onChange }) {
  // question.table_entries: array of { entry_id, label, acceptable_answers, points, order }
  const handleEntryChange = (idx, field, value) => {
    const newEntries = [...(question.table_entries || [])];
    newEntries[idx][field] = value;
    onChange('table_entries', newEntries);
  };

  const addEntry = () => {
    const newEntries = [...(question.table_entries || []), {
      entry_id: `entry_${Date.now()}`,
      label: '',
      acceptable_answers: [''],
      points: 10,
      order: (question.table_entries?.length || 0)
    }];
    onChange('table_entries', newEntries);
  };

  const removeEntry = (idx) => {
    const newEntries = (question.table_entries || []).filter((_, i) => i !== idx);
    onChange('table_entries', newEntries);
  };

  return (
    <div className="forced-recall-editor">
      <h4>Forced Recall Table Entries</h4>
      <button type="button" className="btn btn-secondary" onClick={addEntry}>Add Entry</button>
      {(question.table_entries || []).map((entry, idx) => (
        <div key={entry.entry_id} className="forced-recall-entry-block">
          <label>Label</label>
          <input
            type="text"
            value={entry.label}
            onChange={e => handleEntryChange(idx, 'label', e.target.value)}
            placeholder="e.g. Character Name"
          />
          <label>Acceptable Answers (comma separated)</label>
          <input
            type="text"
            value={entry.acceptable_answers.join(', ')}
            onChange={e => handleEntryChange(idx, 'acceptable_answers', e.target.value.split(',').map(s => s.trim()))}
            placeholder="e.g. John, Johnny"
          />
          <label>Points</label>
          <input
            type="number"
            value={entry.points}
            onChange={e => handleEntryChange(idx, 'points', parseInt(e.target.value) || 0)}
            min={0}
          />
          <button type="button" className="btn btn-danger" onClick={() => removeEntry(idx)}>Remove Entry</button>
        </div>
      ))}
    </div>
  );
}
