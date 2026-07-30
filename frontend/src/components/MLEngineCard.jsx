import React, { useState } from 'react';
import { Cpu, Zap, AlertTriangle, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { API } from '../services/api';

export default function MLEngineCard({ topics, onUpdatePrediction }) {
  const [topicName, setTopicName] = useState(topics[0]?.name || "Data Structures");
  const [userEst, setUserEst] = useState(5.0);
  const [difficulty, setDifficulty] = useState(4);
  const [quizScore, setQuizScore] = useState(75.0);
  const [confidence, setConfidence] = useState(3);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      user_est: Number(userEst),
      difficulty: Number(difficulty),
      quiz_score: Number(quizScore),
      confidence: Number(confidence)
    };

    const res = await API.predictTTM(payload);
    setResult(res);
    setLoading(false);

    if (res && onUpdatePrediction) {
      onUpdatePrediction(topicName, res.predicted_ttm);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
      
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">ML Engine — Time-to-Mastery (TTM) Predictor</h3>
            <p className="text-xs text-slate-400">Pacing Error & Burnout Risk AI Model (Module 3)</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          XGBoost ML Live
        </span>
      </div>

      {/* Form & Controls */}
      <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Topic Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Topic</label>
          <select 
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {topics.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* User Estimate */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Time Estimate (Hours)</label>
          <input 
            type="number"
            step="0.5"
            min="0.5"
            max="40"
            value={userEst}
            onChange={(e) => setUserEst(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Topic Difficulty (1 - 5)</label>
          <input 
            type="range"
            min="1"
            max="5"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Easy (1)</span>
            <span className="font-bold text-cyan-400">Level {difficulty}</span>
            <span>Hard (5)</span>
          </div>
        </div>

        {/* Quiz Score */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Past Quiz Score (%)</label>
          <input 
            type="number"
            min="0"
            max="100"
            value={quizScore}
            onChange={(e) => setQuizScore(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Confidence */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Self Confidence Score (1 - 5)</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(val => (
              <button
                type="button"
                key={val}
                onClick={() => setConfidence(val)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                  confidence === val 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ★ {val}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <div className="md:col-span-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Running ML Inference...' : 'Predict Required Study Time (ML Engine)'}</span>
          </button>
        </div>

      </form>

      {/* Results Card */}
      {result && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">ML Prediction Output for {topicName}</span>
            </div>
            
            {/* Status Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              result.status_code === 'BURNOUT_RISK'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : result.status_code === 'PROCRASTINATION_RISK'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {result.status_code === 'BURNOUT_RISK' && <AlertTriangle className="w-3.5 h-3.5" />}
              {result.status_code === 'BALANCED' && <CheckCircle className="w-3.5 h-3.5" />}
              <span>{result.risk_level}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">User Estimate</span>
              <span className="text-xl font-black text-slate-200 mt-1 block">{result.user_est} hrs</span>
            </div>

            <div className="p-3 rounded-lg bg-indigo-950/60 border border-indigo-500/40">
              <span className="text-[10px] text-indigo-300 block uppercase font-bold">Predicted TTM</span>
              <span className="text-xl font-black text-indigo-400 mt-1 block">{result.predicted_ttm} hrs</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Pacing Error Ratio (EER)</span>
              <span className="text-xl font-black text-cyan-400 mt-1 block">{result.eer}x</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-cyan-400 block mb-1">🤖 AI ML Recommendation:</span>
            {result.recommendation}
          </div>
        </div>
      )}

    </div>
  );
}
