import React, { useState } from 'react';
import { Upload, X, FileText, AlertCircle, Loader2 } from 'lucide-react';

export default function AssignmentUploadModal({ isOpen, onClose, topics, onAddAssignment }) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState(topics[0]?.name || '');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !dueDate) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      onAddAssignment({
        id: Date.now(),
        title,
        topic,
        date: dueDate,
        status: 'Upcoming',
        fileName: file ? file.name : null
      });

      setIsSubmitting(false);
      setTitle('');
      setDueDate('');
      setFile(null);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold mb-4 text-indigo-400 flex items-center gap-2">
          <Upload className="w-5 h-5" /> Upload Assignment
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Assignment Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Neural Networks Homework"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {topics.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Due Date *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Attachment (PDF/DOC, max 5MB)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600"
            />
            {file && (
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Selected: {file.name}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/2 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700 text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                'Submit Assignment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}