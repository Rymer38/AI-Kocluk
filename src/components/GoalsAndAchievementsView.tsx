import React, { useState } from 'react';
import { Trophy, Award, Target, Flame, Sparkles, Zap, CheckCircle2, RefreshCw, GraduationCap } from 'lucide-react';
import { Achievement, TargetGoal, ExamRecord } from '../types';
import { MOTIVATION_QUOTES } from '../data/mockData';
import { estimateTYTScore } from '../utils/helpers';

interface GoalsAndAchievementsViewProps {
  achievements: Achievement[];
  targetGoal: TargetGoal;
  onUpdateTargetGoal: (goal: TargetGoal) => void;
  exams: ExamRecord[];
}

export const GoalsAndAchievementsView: React.FC<GoalsAndAchievementsViewProps> = ({
  achievements,
  targetGoal,
  onUpdateTargetGoal,
  exams,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [targetNet, setTargetNet] = useState(targetGoal.targetNet);
  const [targetDept, setTargetDept] = useState(targetGoal.targetDepartment);
  const [targetUni, setTargetUni] = useState(targetGoal.targetUniversity);

  const [quoteIndex, setQuoteIndex] = useState(0);

  const currentAvgNet =
    exams.length > 0
      ? Math.round((exams.reduce((acc, e) => acc + e.totalNet, 0) / exams.length) * 100) / 100
      : 0;

  const currentEstScore = estimateTYTScore(currentAvgNet);
  const targetEstScore = estimateTYTScore(targetNet);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTargetGoal({
      targetNet,
      targetDepartment: targetDept,
      targetUniversity: targetUni,
      targetRank: targetGoal.targetRank,
    });
    setIsEditingGoal(false);
  };

  const currentQuote = MOTIVATION_QUOTES[quoteIndex % MOTIVATION_QUOTES.length];

  // University Program Matching Estimates
  const universityPrograms = [
    { uni: 'Boğaziçi / İTÜ', dept: 'Bilgisayar Mühendisliği', minNet: 102.5, minScore: 470 },
    { uni: 'ODTÜ / Hacettepe', dept: 'Elektrik-Elektronik Müh.', minNet: 98.0, minScore: 450 },
    { uni: 'İTÜ / YTÜ', dept: 'Yazılım / Bilgisayar Müh.', minNet: 92.5, minScore: 432 },
    { uni: 'Ankara / Marmara', dept: 'Tıp Fakültesi', minNet: 96.0, minScore: 445 },
    { uni: 'İstanbul Üni / Galatasaray', dept: 'Hukuk Fakültesi', minNet: 85.0, minScore: 405 },
    { uni: 'Eskişehir / İzmir Yüksek Tek.', dept: 'Endüstri Mühendisliği', minNet: 82.0, minScore: 395 },
  ];

  return (
    <div className="space-y-6">
      {/* Daily Motivation Quote Bento Header */}
      <div className="bg-slate-900 text-white rounded-[28px] p-6 shadow-xl border border-amber-900/40 relative overflow-hidden flex items-center justify-between bento-card-bg">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="flex items-center space-x-2 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
            <span>GÜNÜN YKS MOTİVASYONU</span>
          </div>
          <p className="text-base sm:text-lg font-black italic leading-relaxed text-white">
            "{currentQuote.quote}"
          </p>
          <p className="text-xs text-amber-200/80 font-bold">— {currentQuote.author}</p>
        </div>

        <button
          onClick={() => setQuoteIndex((prev) => prev + 1)}
          className="p-3.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-2xl text-white transition-all z-10 shadow-xs"
          title="Sözü Değiştir"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Target Goal & Robot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target Net Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Hedef Derece Paneli
              </h3>
            </div>
            <button
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
            >
              {isEditingGoal ? 'İptal' : 'Hedefi Düzenle'}
            </button>
          </div>

          {isEditingGoal ? (
            <form onSubmit={handleSaveGoal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Hedef Net (0 - 120)</label>
                <input
                  type="number"
                  step="0.5"
                  value={targetNet}
                  onChange={(e) => setTargetNet(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-extrabold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Hedef Bölüm</label>
                <input
                  type="text"
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Hedef Üniversite</label>
                <input
                  type="text"
                  value={targetUni}
                  onChange={(e) => setTargetUni(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-xs"
              >
                Hedefleri Kaydet
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Hedef Hayalin</span>
                <h4 className="font-black text-slate-900 dark:text-white text-base">
                  {targetGoal.targetDepartment}
                </h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold">
                  {targetGoal.targetUniversity}
                </p>
              </div>

              {/* Progress meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="text-slate-600 dark:text-slate-400">Ortalama: {currentAvgNet} Net</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">Hedef: {targetGoal.targetNet} Net</span>
                </div>

                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, (currentAvgNet / targetGoal.targetNet) * 100))}%`,
                    }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 text-center font-medium">
                  Hedefe ulaşmak için <span className="font-bold text-slate-700 dark:text-slate-200">+{Math.max(0, Math.round((targetGoal.targetNet - currentAvgNet) * 100) / 100)} Net</span> daha kazanmalısın.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Matching University Programs Robot */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Mevcut & Hedef Netine Göre Üniversite Program Rehberi
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {universityPrograms.map((prog, idx) => {
              const isAchieved = currentAvgNet >= prog.minNet;
              const isTargetReached = targetGoal.targetNet >= prog.minNet;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isAchieved
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : isTargetReached
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                        {prog.dept}
                      </span>
                      <span className="text-[11px] text-slate-500 block font-medium">{prog.uni}</span>
                    </div>
                    {isAchieved ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Kazanılıyor
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {prog.minNet} Net
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements Badges Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            Başarı Rozetleri & Kazanımlar
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                ach.isUnlocked
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800/80'
                  : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200/80 dark:border-slate-800 grayscale opacity-70'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  ach.isUnlocked
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <Award className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{ach.title}</h4>
                  {ach.isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 fill-amber-100" />}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight font-medium">
                  {ach.description}
                </p>

                {ach.isUnlocked ? (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block font-mono">
                    Kazanıldı ({ach.unlockedAt})
                  </span>
                ) : (
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      İlerleme: {ach.currentProgress} / {ach.targetProgress}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
