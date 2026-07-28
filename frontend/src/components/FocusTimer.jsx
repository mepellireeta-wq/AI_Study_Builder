import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flame, CheckCircle, Clock, BookOpen } from 'lucide-react';

export default function FocusTimer({ topics, onLogSession }) {
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || '');
  const [timerMode, setTimerMode] = useState('focus'); // 'focus' (25m) or 'break' (5m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Sync selected topic if initial topics list loads asynchronously
  useEffect(() => {
    if (!selectedTopicId && topics.length > 0) {
      setSelectedTopicId(topics[0].id);
    }
  }, [topics, selectedTopicId]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setCompletedSessions((prev) => prev + 1);
      
      // Auto-log 0.5 hours (approx 25 mins) if focus mode
      if (timerMode === 'focus' && selectedTopicId) {
        onLogSession(selectedTopicId, 0.5);
      }
      
      // Switch mode
      if (timerMode === 'focus') {
        setTimerMode('break');
        setTimeLeft(5 * 60);
      } else {
        setTimerMode('focus');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, timerMode, selectedTopicId, onLogSession]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (mode = timerMode) => {
    setIsActive(false);
    setTimerMode(mode);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = timerMode === 'focus' ? 25 * 60 : 5 * 60;
  const progressPct = ((totalDuration - timeLeft) / totalDuration) * 100;

  const currentTopic = topics.find(t => String(t.id) === String(selectedTopicId));

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 shadow-xl mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">AI Pomodoro & Deep Work Focus Timer</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Track high-intensity study blocks and automatically update completed hours</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => resetTimer('focus')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              timerMode === 'focus' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            25m Focus Session
          </button>
          <button
            onClick={() => resetTimer('break')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              timerMode === 'break' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            5m Short Break
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Topic Selector & Session Stats */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" /> Select Subject for this Session
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 shadow-inner"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Completed: {t.completed_hours}h / {t.target_hours}h)
                </option>
              ))}
            </select>
          </div>

          {currentTopic && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Active Target Module:</span>
                <span className="font-bold text-cyan-300">{currentTopic.name}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subject Mastery Level:</span>
                <span className="font-bold text-indigo-400">{currentTopic.confidence}/10 Confidence</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-indigo-500 h-2 transition-all duration-300"
                  style={{ width: `${(currentTopic.completed_hours / currentTopic.target_hours) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <p className="text-[11px] text-slate-400">Completed Sessions</p>
              <p className="text-xl font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" /> {completedSessions}
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <p className="text-[11px] text-slate-400">Focus Hours Logged</p>
              <p className="text-xl font-bold text-cyan-400 mt-1 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" /> {(completedSessions * 0.5).toFixed(1)} hrs
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Circular Timer & Controls */}
        <div className="flex flex-col items-center justify-center">
          
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="104"
                cy="104"
                r="90"
                stroke="#1e293b"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="104"
                cy="104"
                r="90"
                stroke={timerMode === 'focus' ? '#6366f1' : '#10b981'}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={565.48}
                strokeDashoffset={565.48 - (565.48 * progressPct) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Central Display */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black font-mono text-white tracking-wider">
                {formatTime(timeLeft)}
              </span>
              <span className={`text-xs font-semibold uppercase mt-1 tracking-widest ${
                timerMode === 'focus' ? 'text-indigo-400' : 'text-emerald-400'
              }`}>
                {timerMode === 'focus' ? 'Deep Focus' : 'Short Break'}
              </span>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center space-x-4 mt-6">
            <button
              onClick={toggleTimer}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                isActive 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" /> <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" /> <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={() => resetTimer()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
