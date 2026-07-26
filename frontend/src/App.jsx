import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatCards from './components/StatCards';
import InteractiveTimeline from './components/InteractiveTimeline';
import TopicManager from './components/TopicManager';
import AnalyticsCharts from './components/AnalyticsCharts';
import AssignmentUploadModal from './components/AssignmentUploadModal';
import { fetchStudyPlan, fetchProjectStatus } from './services/api';

export default function App() {
  const [topics, setTopics] = useState([
    { id: 1, name: "Data Structures", target_hours: 10, confidence: 6 },
    { id: 2, name: "Machine Learning", target_hours: 15, confidence: 4 },
    { id: 3, name: "DBMS & SQL", target_hours: 8, confidence: 8 },
    { id: 4, name: "Python Programming", target_hours: 12, confidence: 7 }
  ]);

  const [studyPlan, setStudyPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [apiStatus, setApiStatus] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    // Load backend status and study schedule
    const loadBackendData = async () => {
      setLoadingPlan(true);
      const statusData = await fetchProjectStatus();
      setApiStatus(statusData?.Status || 'Online');

      const planData = await fetchStudyPlan();
      setStudyPlan(planData);
      setLoadingPlan(false);
    };

    loadBackendData();
  }, []);

  const handleAddTopicFromModal = (newTopic) => {
    setTopics(prev => [...prev, newTopic]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-16">
      
      {/* Top Header Navigation */}
      <Navbar 
        onOpenUpload={() => setIsUploadModalOpen(true)}
        apiStatus={apiStatus}
      />

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Metric Summary Cards */}
        <StatCards topics={topics} />

        {/* Two-Column Grid: Timeline & Topic Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Study Plan Timeline */}
          <div className="lg:col-span-6">
            <InteractiveTimeline 
              studyPlan={studyPlan} 
              loading={loadingPlan} 
            />
          </div>

          {/* Right Column: Topic & Confidence Manager */}
          <div className="lg:col-span-6">
            <TopicManager 
              topics={topics} 
              setTopics={setTopics} 
            />
          </div>

        </div>

        {/* Analytics & Performance Charts */}
        <AnalyticsCharts topics={topics} />

      </main>

      {/* Assignment Upload Modal */}
      <AssignmentUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddTopic={handleAddTopicFromModal}
      />

    </div>
  );
}
