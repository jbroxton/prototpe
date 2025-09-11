import React from 'react';

export type JiraEditFormProps = {
  keyId: string;
  initialSummary: string;
  initialDescription?: string;
  initialLabels?: string[];
  baselineUpdated: string;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
  onSave?: (payload: { summary: string; description?: string; labels?: string[]; baselineUpdated: string }) => void;
};

export function JiraEditForm(props: JiraEditFormProps) {
  const {
    keyId,
    initialSummary,
    initialDescription,
    initialLabels,
    baselineUpdated,
    isLoading,
    error,
    success,
    onSave,
  } = props;
  const labelsJoined = (initialLabels || []).join(',');
  const missingSummary = !initialSummary || initialSummary.trim().length === 0;
  return (
    <form aria-busy={!!isLoading} className="jira-edit-form">
      <div className="field">
        <label>Summary</label>
        <input name="summary" defaultValue={initialSummary} />
        {missingSummary && <div className="text-xs text-rose-400">Summary is required</div>}
      </div>
      <div className="field">
        <label>Description</label>
        <textarea name="description" defaultValue={initialDescription || ''} />
      </div>
      <div className="field">
        <label>Labels</label>
        <input name="labels" defaultValue={labelsJoined} />
      </div>
      <input type="hidden" name="baselineUpdated" value={baselineUpdated} />
      {error && <div className="text-sm text-rose-400">{error}</div>}
      {success && <div className="text-sm text-emerald-400">Updated successfully</div>}
      <div className="actions">
        <button type="button" disabled={!!isLoading || missingSummary} onClick={() => {
          if (!onSave) return;
          const labels = (labelsJoined || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          onSave({ summary: initialSummary, description: initialDescription, labels, baselineUpdated });
        }}>Save</button>
      </div>
    </form>
  );
}

export default JiraEditForm;
