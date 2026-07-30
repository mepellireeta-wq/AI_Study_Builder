import React, { useState } from 'react';
import { Eye, Upload, CheckCircle2, AlertCircle, Sparkles, RefreshCw, FileText } from 'lucide-react';
import { API } from '../services/api';

export default function CVEngineCard({ onFeedResultsToRebalance }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await API.gradeSheet(formData);
    setResult(res);
    setLoading(false);
  };

  const handleApplyToLoadBalancer = () => {
    if (result && result.topics_needing_review && onFeedResultsToRebalance) {
      onFeedResultsToRebalance(result.topics_needing_review);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
      
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">CV Engine — Vision AI Handwritten Sheet Grader</h3>
            <p className="text-xs text-slate-400">Gemini Vision AI + EasyOCR Performance Extractor (Module 4)</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-semibold">
          Gemini 2.5 Vision
        </span>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleGrade} className="space-y-4">
        <div className="border-2 border-dashed border-slate-800 hover:border-pink-500/50 transition-all rounded-xl p-6 text-center bg-slate-950/60 relative cursor-pointer flex flex-col items-center justify-center min-h-[160px]">
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />

          {!preview ? (
            <div className="flex flex-col items-center pointer-events-none">
              <Upload className="w-8 h-8 text-pink-400 mb-2 animate-bounce" />
              <span className="text-xs font-bold text-slate-200">Drag & Drop handwritten sheet image here</span>
              <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, JPEG (Practice test or assignment sheet)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-pink-500/30" />
              <div className="text-left">
                <span className="text-xs font-bold text-pink-300 block">{file?.name}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Ready for Vision AI Analysis</span>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-pink-500/20 disabled:opacity-40"
        >
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing Handwriting with Gemini Vision AI...' : 'Grade Practice Sheet (CV Engine)'}</span>
        </button>
      </form>

      {/* Results Output */}
      {result && (
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-slate-200">Handwriting Assessment Report</span>
            </div>
            
            {/* Score Pill */}
            <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 text-pink-300 text-sm font-black">
              Score: {result.score || 88}%
            </div>
          </div>

          {/* Mastered & Review Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Mastered Topics ({result.topics_mastered?.length || 0})
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {(result.topics_mastered || []).map((t, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">• {t}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/20">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-3.5 h-3.5" /> Topics Needing Review ({result.topics_needing_review?.length || 0})
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {(result.topics_needing_review || []).map((t, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">• {t}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feedback */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="font-bold text-pink-400 block mb-1">🤖 Gemini Constructive AI Feedback:</span>
            {result.feedback}
          </div>

          {/* Automatic Integration with Load Balancer */}
          <button
            type="button"
            onClick={handleApplyToLoadBalancer}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-cyan-500/30 shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Feed Results to ML Load Balancer (Auto-Increase Study Target)</span>
          </button>
        </div>
      )}

    </div>
  );
}
