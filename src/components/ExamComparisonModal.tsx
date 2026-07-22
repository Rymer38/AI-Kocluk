import React, { useState } from 'react';
import { X, ArrowRight, TrendingUp, TrendingDown, Minus, ArrowUpDown } from 'lucide-react';
import { ExamRecord, SubjectKey } from '../types';
import { getSubjectDetails } from '../utils/helpers';

interface ExamComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: ExamRecord[];
}

export const ExamComparisonModal: React.FC<ExamComparisonModalProps> = ({
  isOpen,
  onClose,
  exams,
}) => {
  const [selectedExamId1, setSelectedExamId1] = useState<string>(exams[0]?.id || '');
  const [selectedExamId2, setSelectedExamId2] = useState<string>(exams[1]?.id || exams[0]?.id || '');

  if (!isOpen) return null;

  const exam1 = exams.find((e) => e.id === selectedExamId1) || exams[0];
  const exam2 = exams.find((e) => e.id === selectedExamId2) || exams[1] || exams[0];

  const subjectsKeys: SubjectKey[] = ['turkce', 'matematik', 'sosyal', 'fen'];

  const getNetDiff = (net2: number, net1: number) => {
    const diff = net2 - net1;
    if (diff > 0) {
      return (
        <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+{diff.toFixed(2)} Net</span>
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="flex items-center space-x-1 text-red-600 dark:text-red-400 font-bold text-xs bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>{diff.toFixed(2)} Net</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1 text-slate-500 font-medium text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
        <Minus className="w-3.5 h-3.5" />
        <span>Fark Yok</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
        {/* Header */}
        <div className="flex items-center pb-4 border-b border-slate-100 dark:border-slate-700 gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
            title="Kapat"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2.5 flex-1">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Deneme Sınavları Karşılaştırma Matrisi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                İki deneme sınavını yan yana seçerek net ve süre farklarını görün.
              </p>
            </div>
          </div>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              1. Sınav (Referans/Önceki)
            </label>
            <select
              value={selectedExamId1}
              onChange={(e) => setSelectedExamId1(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.date} - {ex.title} ({ex.totalNet} Net)
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              2. Sınav (Karşılaştırılan/Yeni)
            </label>
            <select
              value={selectedExamId2}
              onChange={(e) => setSelectedExamId2(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.date} - {ex.title} ({ex.totalNet} Net)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        {exam1 && exam2 && (
          <div className="space-y-4">
            {/* Total Net Hero Comparison */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-5 rounded-2xl text-white flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block mb-1">1. Sınav ({exam1.publisher})</span>
                <span className="text-xl font-bold">{exam1.totalNet} Net</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{exam1.title}</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-400 mb-1">Toplam Net Değişimi</span>
                {getNetDiff(exam2.totalNet, exam1.totalNet)}
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block mb-1">2. Sınav ({exam2.publisher})</span>
                <span className="text-xl font-bold text-blue-400">{exam2.totalNet} Net</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{exam2.title}</span>
              </div>
            </div>

            {/* Subject Breakdown Rows */}
            <div className="divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 bg-slate-100 dark:bg-slate-900 p-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Ders Bölümü</span>
                <span>1. Sınav</span>
                <span>2. Sınav</span>
                <span>Fark / İlerleme</span>
              </div>

              {subjectsKeys.map((subKey) => {
                const details = getSubjectDetails(subKey);
                const net1 = exam1.subjects[subKey]?.net || 0;
                const net2 = exam2.subjects[subKey]?.net || 0;
                const time1 = exam1.subjects[subKey]?.timeSpentMinutes || 0;
                const time2 = exam2.subjects[subKey]?.timeSpentMinutes || 0;

                return (
                  <div
                    key={subKey}
                    className="grid grid-cols-4 p-3 text-xs items-center bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: details.color }} />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {details.name}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{net1} Net</span>
                      <span className="text-[10px] text-slate-400 block">{time1} dk</span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{net2} Net</span>
                      <span className="text-[10px] text-slate-400 block">{time2} dk</span>
                    </div>

                    <div>{getNetDiff(net2, net1)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-5 border-t border-slate-100 dark:border-slate-700 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
