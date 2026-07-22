import React, { useState } from 'react';
import {
  TrendingUp,
  FileText,
  Target,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Plus,
  ArrowUpDown,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
} from 'lucide-react';
import { ExamRecord, TargetGoal, SubjectKey } from '../types';
import { PerformanceCharts } from './PerformanceCharts';
import { getSubjectDetails } from '../utils/helpers';

interface DashboardViewProps {
  exams: ExamRecord[];
  targetGoal: TargetGoal;
  openAddExam: () => void;
  openComparison: () => void;
  setActiveTab: (tab: string) => void;
  onDeleteExam: (examId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  exams,
  targetGoal,
  openAddExam,
  openComparison,
  setActiveTab,
  onDeleteExam,
}) => {
  const [expandedExamId, setExpandedExamId] = useState<string | null>(exams[0]?.id || null);
  const [examToDelete, setExamToDelete] = useState<ExamRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmDelete = (id: string) => {
    onDeleteExam(id);
    setExamToDelete(null);
    if (expandedExamId === id) {
      setExpandedExamId(null);
    }
    showToast('Deneme sınavı başarıyla silindi.');
  };

  const totalExams = exams.length;
  const latestExam = exams[exams.length - 1];

  const avgNet =
    totalExams > 0
      ? Math.round((exams.reduce((acc, e) => acc + e.totalNet, 0) / totalExams) * 100) / 100
      : 0;

  const highestNet =
    totalExams > 0 ? Math.max(...exams.map((e) => e.totalNet)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Stat Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Son Deneme Net */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Son Deneme Neti
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {latestExam ? `${latestExam.totalNet}` : '0'}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 120 Net</span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
            {latestExam ? latestExam.title : 'Henüz deneme girilmedi'}
          </p>
        </div>

        {/* Card 2: Ortalama Net */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Ortalama Net
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {avgNet}
            </span>
            <span className="text-xs font-semibold text-slate-400">Net Avg</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            {totalExams} Sınav Kaydı Mevcut
          </p>
        </div>

        {/* Card 3: En Yüksek Net */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Zirve Rekor Net
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {highestNet}
            </span>
            <span className="text-xs font-semibold text-slate-400">Net Rekor</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
            Tahmini Puan: {latestExam ? latestExam.estimatedScore : 0}
          </p>
        </div>

        {/* Card 4: Hedef Net Farkı */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Hedef Net Kalan
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {targetGoal.targetNet}
            </span>
            <span className="text-xs font-semibold text-slate-400">Net Hedef</span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
            {targetGoal.targetDepartment}
          </p>
        </div>
      </div>

      {/* Latest AI Analysis Callout Bento Banner */}
      {latestExam && latestExam.aiAnalysis && (
        <div className="bg-slate-900 text-white rounded-[28px] p-6 shadow-xl border border-indigo-900/50 relative overflow-hidden space-y-3 bento-card-bg">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-amber-200">
                Yapay Zeka Son Deneme Raporu: {latestExam.title}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('coach')}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center space-x-1.5 border border-white/10"
            >
              <span>Koçla Tartış</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {latestExam.aiAnalysis}
          </p>
        </div>
      )}

      {/* Recharts Visual Charts Section */}
      <PerformanceCharts exams={exams} targetGoal={targetGoal} />

      {/* Past Exams History Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Son Çözülen Deneme Sınavları
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sınav detayları, net kırılımları ve notlarınız
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={openComparison}
              className="flex items-center space-x-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200/50 dark:border-indigo-800/50 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sınavları Karşılaştır</span>
            </button>

            <button
              onClick={openAddExam}
              className="flex items-center space-x-1.5 bg-indigo-600 text-white hover:bg-indigo-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Sınav Gir</span>
            </button>
          </div>
        </div>

        {/* List of Exams */}
        <div className="space-y-3">
          {exams.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Henüz kaydedilmiş bir deneme sınavı bulunmuyor
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Yeni bir deneme neti girerek takibe başlayabilir ve analiz raporlarını görüntüleyebilirsiniz.
                </p>
              </div>
              <button
                onClick={openAddExam}
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>İlk Denemeyi Gir</span>
              </button>
            </div>
          ) : (
            exams.map((exam) => {
              const isExpanded = expandedExamId === exam.id;

              return (
                <div
                  key={exam.id}
                  className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden transition-all bg-slate-50/50 dark:bg-slate-950/30"
                >
                  {/* Summary Header Row */}
                  <div
                    onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                    className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex flex-wrap items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {exam.title}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          {exam.publisher}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block">{exam.date}</span>
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-5">
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 block">
                          {exam.totalNet} Net
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          Tahmini: {exam.estimatedScore} Puan
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExamToDelete(exam);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
                        title="Denemeyi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-4">
                      {/* Subject Nets Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-blue-200/60 dark:border-blue-900/60 shadow-xs">
                          <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 block">Türkçe</span>
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            {exam.subjects.turkce.net} Net
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {exam.subjects.turkce.correct}D / {exam.subjects.turkce.wrong}Y
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/60 shadow-xs">
                          <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">Temel Matematik</span>
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            {exam.subjects.matematik.net} Net
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {exam.subjects.matematik.correct}D / {exam.subjects.matematik.wrong}Y
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200/60 dark:border-amber-900/60 shadow-xs">
                          <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block">Sosyal Bilgiler</span>
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            {exam.subjects.sosyal.net} Net
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {exam.subjects.sosyal.correct}D / {exam.subjects.sosyal.wrong}Y
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-purple-200/60 dark:border-purple-900/60 shadow-xs">
                          <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 block">Fen Bilimleri</span>
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            {exam.subjects.fen.net} Net
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {exam.subjects.fen.correct}D / {exam.subjects.fen.wrong}Y
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      {exam.notes && (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                            Öğrenci Notu:
                          </span>
                          <p className="text-slate-600 dark:text-slate-400 italic">"{exam.notes}"</p>
                        </div>
                      )}

                      {/* Action Row */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setExamToDelete(exam)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-bold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Bu Deneme Sınavını Sil</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            {/* Header with Top-Left X Close Button */}
            <div className="flex items-center border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
              <button
                onClick={() => setExamToDelete(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                title="Kapat"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2.5 flex-1">
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Deneme Sınavını Sil
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sınav kaydını kalıcı olarak silmek istediğinizden emin misiniz?
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                {examToDelete.title} ({examToDelete.publisher})
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Tarih: {examToDelete.date} • Net: <strong className="text-indigo-600 dark:text-indigo-400">{examToDelete.totalNet} Net</strong>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                onClick={() => setExamToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleConfirmDelete(examToDelete.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-xs"
              >
                Evet, Denemeyi Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-extrabold text-xs flex items-center space-x-2 animate-bounce">
          <Trash2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
