import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AddExamModal } from './components/AddExamModal';
import { ExamComparisonModal } from './components/ExamComparisonModal';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { PracticeQuizView } from './components/PracticeQuizView';
import { AICoachChatView } from './components/AICoachChatView';
import { WrongQuestionNotebook } from './components/WrongQuestionNotebook';
import { GoalsAndAchievementsView } from './components/GoalsAndAchievementsView';
import { AuthModal } from './components/AuthModal';
import { AdminUsersModal } from './components/AdminUsersModal';
import { BackupAndGithubModal } from './components/BackupAndGithubModal';

import { ExamRecord, StudyTask, WrongQuestionItem, TargetGoal, Achievement, UserAccount } from './types';
import { storage } from './utils/helpers';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => storage.getCurrentUser());

  // State loaded from LocalStorage (or initial defaults)
  const [exams, setExams] = useState<ExamRecord[]>(() => storage.getExams());
  const [tasks, setTasks] = useState<StudyTask[]>(() => storage.getTasks());
  const [targetGoal, setTargetGoal] = useState<TargetGoal>(() => storage.getTargetGoal());
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestionItem[]>(() =>
    storage.getWrongQuestions()
  );
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    storage.getAchievements()
  );

  // Modals
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Reload all state after JSON backup import
  const handleReloadAllState = () => {
    setExams(storage.getExams());
    setTasks(storage.getTasks());
    setTargetGoal(storage.getTargetGoal());
    setWrongQuestions(storage.getWrongQuestions());
    setAchievements(storage.getAchievements());
    setCurrentUser(storage.getCurrentUser());
  };

  // Persist State Updates
  const handleSaveExam = (newExam: ExamRecord, aiAnalysisText?: string) => {
    const examWithAnalysis = {
      ...newExam,
      aiAnalysis: aiAnalysisText || newExam.aiAnalysis,
    };
    const updated = [...exams, examWithAnalysis];
    setExams(updated);
    storage.saveExams(updated);
  };

  const handleDeleteExam = (examId: string) => {
    const updated = exams.filter((e) => e.id !== examId);
    setExams(updated);
    storage.saveExams(updated);
  };

  const handleUpdateTasks = (updatedTasks: StudyTask[]) => {
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
  };

  const handleUpdateTargetGoal = (newGoal: TargetGoal) => {
    setTargetGoal(newGoal);
    storage.saveTargetGoal(newGoal);
  };

  const handleSaveWrongQuestions = (items: WrongQuestionItem[]) => {
    setWrongQuestions(items);
    storage.saveWrongQuestions(items);
  };

  const handleAddWrongQuestionSingle = (item: WrongQuestionItem) => {
    const updated = [item, ...wrongQuestions];
    setWrongQuestions(updated);
    storage.saveWrongQuestions(updated);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        targetGoal={targetGoal}
        openAddExam={() => setIsAddExamOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-12 md:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            exams={exams}
            targetGoal={targetGoal}
            openAddExam={() => setIsAddExamOpen(true)}
            openComparison={() => setIsComparisonOpen(true)}
            setActiveTab={setActiveTab}
            onDeleteExam={handleDeleteExam}
          />
        )}

        {activeTab === 'exams' && (
          <DashboardView
            exams={exams}
            targetGoal={targetGoal}
            openAddExam={() => setIsAddExamOpen(true)}
            openComparison={() => setIsComparisonOpen(true)}
            setActiveTab={setActiveTab}
            onDeleteExam={handleDeleteExam}
          />
        )}

        {activeTab === 'schedule' && (
          <WeeklyScheduleView
            tasks={tasks}
            onUpdateTasks={handleUpdateTasks}
            exams={exams}
            targetNet={targetGoal.targetNet}
          />
        )}

        {activeTab === 'quiz' && (
          <PracticeQuizView onAddWrongQuestion={handleAddWrongQuestionSingle} />
        )}

        {activeTab === 'coach' && (
          <AICoachChatView exams={exams} targetGoal={targetGoal} />
        )}

        {activeTab === 'wrong-notebook' && (
          <WrongQuestionNotebook
            wrongQuestions={wrongQuestions}
            onSaveWrongQuestions={handleSaveWrongQuestions}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsAndAchievementsView
            achievements={achievements}
            targetGoal={targetGoal}
            onUpdateTargetGoal={handleUpdateTargetGoal}
            exams={exams}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 YKS TYT Deneme Analizi & Yapay Zeka Koçu • Tüm Hakları Saklıdır
          </span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            Gemini 3.6 Flash AI Entegrasyonu ile Güçlendirildi
          </span>
        </div>
      </footer>

      {/* Modals */}
      <AddExamModal
        isOpen={isAddExamOpen}
        onClose={() => setIsAddExamOpen(false)}
        onSaveExam={handleSaveExam}
        targetGoal={targetGoal}
      />

      <ExamComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        exams={exams}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(usr) => setCurrentUser(usr)}
        onLogout={() => {
          storage.saveCurrentUser(null);
          setCurrentUser(null);
        }}
      />

      <AdminUsersModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
      />

      <BackupAndGithubModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onRestoreCompleted={handleReloadAllState}
      />
    </div>
  );
}

