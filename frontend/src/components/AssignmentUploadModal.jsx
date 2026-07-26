import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function AssignmentUploadModal({ isOpen, onClose, onAddTopic }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    setIsAnalyzing(true);
    setParsedData(null);

    // Simulate AI parsing delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setParsedData({
        detectedTitle: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        suggestedHours: Math.floor(Math.random() * 10) + 8,
        initialConfidence: 5,
        extractedKeywords: ["Data Structures", "Algorithms", "Complexity", "Graph Theory"]
      });
    }, 1200);
  };

  const handleConfirmImport = () => {
    if (parsedData) {
      onAddTopic({
        id: Date.now(),
        name: parsedData.detectedTitle,
        target_hours: parsedData.suggestedHours,
        confidence: parsedData.initialConfidence
      });
      onClose();
      setSelectedFile(null);
      setParsedData(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-700 shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Upload Assignment / Syllabus</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`mt-5 border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            dragActive 
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]' 
              : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
          }`}
        >
          <input 
            type="file" 
            id="assignment-file-input" 
            className="hidden" 
            onChange={handleChange}
            accept=".pdf,.docx,.txt,.png,.jpg"
          />

          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>

          <p className="text-sm font-semibold text-white mb-1">
            Drag & drop your assignment file here
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Supports PDF, DOCX, TXT, PNG syllabus documents
          </p>

          <label
            htmlFor="assignment-file-input"
            className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
          >
            <span>Browse Computer</span>
          </label>
        </div>

        {/* AI Analysis Preview */}
        {isAnalyzing && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-indigo-300 font-medium">Analyzing assignment contents with AI OCR & parser...</p>
          </div>
        )}

        {parsedData && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Extracted Module:</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Ready to Import
              </span>
            </div>
            
            <h4 className="text-sm font-bold text-white capitalize">{parsedData.detectedTitle}</h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div>Recommended Target: <span className="font-bold text-cyan-400">{parsedData.suggestedHours} hrs</span></div>
              <div>Initial Confidence: <span className="font-bold text-indigo-400">{parsedData.initialConfidence}/10</span></div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {parsedData.extractedKeywords.map((kw, i) => (
                <span key={i} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirmImport}
            disabled={!parsedData}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all ${
              parsedData 
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Add Module to Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
}
