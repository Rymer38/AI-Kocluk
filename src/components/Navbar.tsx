import React, { useState } from 'react';
import {
  LayoutDashboard,
  FilePlus,
  CalendarDays,
  Bot,
  Brain,
  BookOpen,
  Trophy,
  Flame,
  Target,
  Sparkles,
  User,
  ShieldCheck,
  Database,
  Layers,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import { TargetGoal, UserAccount } from '../types';
import { getDaysUntilYKS } from '../utils/helpers';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  targetGoal: TargetGoal;
  openAddExam: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  targetGoal,
  openAddExam,
  currentUser,
  onOpenAuth,
  onOpenAdmin,
  onOpenBackup,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { days, hours } = getDaysUntilYKS();

  const navItems = [
    { id: 'dashboard', label: 'Genel Analiz', icon: LayoutDashboard },
    { id: 'exams', label: 'Deneme Takibi', icon: FilePlus },
    { id: 'schedule', label: 'Haftalık To-Do & AI Önerileri', icon: CalendarDays },
    { id: 'quiz', label: 'İnteraktif Test', icon: Brain },
    { id: 'coach', label: 'YKS AI Koçu', icon: Bot },
    { id: 'wrong-notebook', label: 'Yanlış Defterim', icon: BookOpen },
    { id: 'goals', label: 'Hedef & Başarı', icon: Trophy },
  ];

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'ekicia926@gmail.com' || currentUser?.username === 'admin';

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-2">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-3 shadow-xs">
            {/* Top Header Bar */}
            <div className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5 sm:pb-3 gap-2">
              {/* Logo & Title */}
              <div className="flex items-center space-x-2.5 cursor-pointer group shrink-0" onClick={() => setActiveTab('dashboard')}>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-sm sm:text-lg text-slate-900 dark:text-white tracking-tight">
                      TYT Analiz & Koç
                    </span>
                    <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                      AI
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
                    YKS Derece Hazırlık & Performance Dashboard
                  </p>
                </div>
              </div>

              {/* Right Header Controls */}
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {/* Countdown Badge (Tablet & Up) */}
                <div className="hidden sm:flex items-center space-x-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 px-2.5 py-1.5 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="hidden md:inline">YKS 2027:</span>
                  <span className="font-bold font-mono text-xs">{days}G {hours}S</span>
                </div>

                {/* Backup & GitHub Guide Button */}
                <button
                  onClick={onOpenBackup}
                  className="hidden md:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  title="Yedekleme ve GitHub rehberi"
                >
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>Yedek / Rehber</span>
                </button>

                {/* Admin Panel Trigger (Only if Admin) */}
                {isAdmin && (
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center space-x-1 bg-amber-500 hover:bg-amber-600 text-slate-950 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs"
                    title="Üst Düzey Yetkili Paneli"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Yetkili</span>
                  </button>
                )}

                {/* User Account / Auth Modal Trigger */}
                <button
                  onClick={onOpenAuth}
                  className="flex items-center space-x-1 sm:space-x-1.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/60 transition-all"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="max-w-[80px] sm:max-w-none truncate">{currentUser ? currentUser.username : 'Giriş'}</span>
                </button>

                {/* Quick Add Exam Action */}
                <button
                  onClick={openAddExam}
                  className="flex items-center space-x-1 sm:space-x-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/25"
                >
                  <FilePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Deneme Gir</span>
                </button>
              </div>
            </div>

            {/* Bottom Navigation Tabs for Desktop/Tablet */}
            <nav className="flex space-x-1.5 overflow-x-auto pt-2 no-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Dock (For Smartphones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/90 dark:border-slate-800/90 px-3 py-2 shadow-2xl backdrop-blur-lg flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center space-y-0.5 text-[10px] font-bold ${
            activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Analiz</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center space-y-0.5 text-[10px] font-bold ${
            activeTab === 'schedule' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span>Program</span>
        </button>

        {/* Featured Center Add Exam Button */}
        <button
          onClick={openAddExam}
          className="flex flex-col items-center -mt-5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white p-3 rounded-full shadow-lg shadow-indigo-500/40 border-2 border-white dark:border-slate-900"
          title="Deneme Gir"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('coach')}
          className={`flex flex-col items-center space-y-0.5 text-[10px] font-bold ${
            activeTab === 'coach' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span>AI Koç</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center space-y-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400"
        >
          <Menu className="w-5 h-5" />
          <span>Daha Fazla</span>
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex justify-end md:hidden">
          <div className="w-4/5 max-w-sm bg-white dark:bg-slate-900 h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-extrabold text-base text-slate-900 dark:text-white">
                    Tüm Özellikler
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Countdown in drawer */}
              <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-950/50 p-3 rounded-2xl border border-amber-200/60 dark:border-amber-800/60 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>YKS 2027 Kalan: <strong className="font-mono">{days} Gün {hours} Saat</strong></span>
              </div>

              {/* Menu Items */}
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Extra Utilities */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    onOpenBackup();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>Yedekleme & GitHub Rehberi</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 text-slate-950"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Üst Düzey Yetkili Paneli</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 text-center text-[10px] text-slate-400">
              YKS TYT Analiz & Koç v2.5
            </div>
          </div>
        </div>
      )}
    </>
  );
};


