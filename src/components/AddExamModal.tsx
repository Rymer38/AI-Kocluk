import React, { useState } from 'react';
import { X, Calculator, Sparkles, Check, AlertCircle } from 'lucide-react';
import { ExamRecord, SubjectKey, TopicScore, TargetGoal } from '../types';
import { calculateNet, estimateTYTScore, getSubjectDetails } from '../utils/helpers';
import { TYT_TOPICS } from '../data/mockData';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExam: (exam: ExamRecord, analysisText?: string) => void;
  targetGoal: TargetGoal;
}

export const AddExamModal: React.FC<AddExamModalProps> = ({
  isOpen,
  onClose,
  onSaveExam,
  targetGoal,
}) => {
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Subject States
  const [turkce, setTurkce] = useState({ correct: 30, wrong: 5, empty: 5, time: 45 });
  const [sosyal, setSosyal] = useState({ correct: 14, wrong: 4, empty: 2, time: 15 });
  const [matematik, setMatematik] = useState({ correct: 22, wrong: 4, empty: 14, time: 65 });
  const [fen, setFen] = useState({ correct: 12, wrong: 4, empty: 4, time: 20 });

  if (!isOpen) return null;

  const netTurkce = calculateNet(turkce.correct, turkce.wrong);
  const netSosyal = calculateNet(sosyal.correct, sosyal.wrong);
  const netMat = calculateNet(matematik.correct, matematik.wrong);
  const netFen = calculateNet(fen.correct, fen.wrong);

  const totalCorrect = turkce.correct + sosyal.correct + matematik.correct + fen.correct;
  const totalWrong = turkce.wrong + sosyal.wrong + matematik.wrong + fen.wrong;
  const totalEmpty = turkce.empty + sosyal.empty + matematik.empty + fen.empty;
  const totalNet = calculateNet(totalCorrect, totalWrong);
  const estimatedScore = estimateTYTScore(totalNet);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAnalyzing(true);

    // Generate topic breakdowns automatically from defaults if not manually edited
    const generateTopicsForSub = (subKey: SubjectKey, correct: number, wrong: number, empty: number) => {
      const topicList = TYT_TOPICS[subKey] || [];
      const count = topicList.length;
      return topicList.map((tName, idx) => ({
        id: `t-${subKey}-${idx}`,
        name: tName,
        subjectKey: subKey,
        correct: Math.floor(correct / count),
        wrong: Math.ceil(wrong / count),
        empty: Math.floor(empty / count),
        totalQuestions: 5,
      }));
    };

    const newExamRecord: ExamRecord = {
      id: `exam-${Date.now()}`,
      title: title.trim(),
      publisher: publisher.trim() || 'Genel Yayın',
      date,
      subjects: {
        turkce: { ...turkce, net: netTurkce, topics: generateTopicsForSub('turkce', turkce.correct, turkce.wrong, turkce.empty), timeSpentMinutes: turkce.time },
        sosyal: { ...sosyal, net: netSosyal, topics: generateTopicsForSub('sosyal', sosyal.correct, sosyal.wrong, sosyal.empty), timeSpentMinutes: sosyal.time },
        matematik: { ...matematik, net: netMat, topics: generateTopicsForSub('matematik', matematik.correct, matematik.wrong, matematik.empty), timeSpentMinutes: matematik.time },
        fen: { ...fen, net: netFen, topics: generateTopicsForSub('fen', fen.correct, fen.wrong, fen.empty), timeSpentMinutes: fen.time },
      },
      totalCorrect,
      totalWrong,
      totalEmpty,
      totalNet,
      estimatedScore,
      notes,
    };

    let aiAnalysis = '';
    try {
      const res = await fetch('/api/ai/analyze-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examRecord: newExamRecord, targetGoal }),
      });
      const data = await res.json();
      if (data.analysis) {
        aiAnalysis = data.analysis;
      }
    } catch (err) {
      console.error('AI analysis request failed:', err);
    } finally {
      setIsAnalyzing(false);
      onSaveExam(newExamRecord, aiAnalysis);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
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
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Yeni TYT Denemesi Kaydet
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Doğru, yanlış ve boş sayılarınızı girin, yapay zeka anında analiz etsin.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deneme Sınavı Adı *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: 3D Türkiye Geneli TYT-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Yayın Evi / Kurum
              </label>
              <input
                type="text"
                placeholder="Örn: Bilgi Sarmal, Özdebir, MEB"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Çözülme Tarihi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Realtime Live Calculated Totals Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-blue-100 font-medium block">Hesaplanan Toplam Net</span>
              <span className="text-2xl font-extrabold">{totalNet.toFixed(2)} Net</span>
            </div>
            <div className="flex space-x-4 text-xs border-l border-blue-400/40 pl-4">
              <div>
                <span className="text-blue-200 block">Doğru</span>
                <span className="font-bold text-sm text-emerald-300">{totalCorrect}</span>
              </div>
              <div>
                <span className="text-blue-200 block">Yanlış</span>
                <span className="font-bold text-sm text-red-300">{totalWrong}</span>
              </div>
              <div>
                <span className="text-blue-200 block">Boş</span>
                <span className="font-bold text-sm text-amber-300">{totalEmpty}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-blue-200 block">Tahmini Puan</span>
              <span className="text-lg font-bold">{estimatedScore} Puan</span>
            </div>
          </div>

          {/* Subjects Score Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Türkçe (40) */}
            <SubjectInputBlock
              subjectKey="turkce"
              title="Türkçe (40 Soru)"
              values={turkce}
              setValues={setTurkce}
              net={netTurkce}
              maxQuestions={40}
            />

            {/* Temel Matematik (40) */}
            <SubjectInputBlock
              subjectKey="matematik"
              title="Temel Matematik (40 Soru)"
              values={matematik}
              setValues={setMatematik}
              net={netMat}
              maxQuestions={40}
            />

            {/* Sosyal (20) */}
            <SubjectInputBlock
              subjectKey="sosyal"
              title="Sosyal Bilgiler (20 Soru)"
              values={sosyal}
              setValues={setSosyal}
              net={netSosyal}
              maxQuestions={20}
            />

            {/* Fen (20) */}
            <SubjectInputBlock
              subjectKey="fen"
              title="Fen Bilimleri (20 Soru)"
              values={fen}
              setValues={setFen}
              net={netFen}
              maxQuestions={20}
            />
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sınav Hakkında Notlar & Hislerin
            </label>
            <textarea
              rows={2}
              placeholder="Örn: Süre yetiştiremedim, Geometride sorular uzundu, Fizik optik zordu..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              İptal
            </button>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Yapay Zeka Analiz Ediyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Kaydet & AI Analizi Başlat</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-component for individual subject inputs
interface SubjectInputBlockProps {
  subjectKey: SubjectKey;
  title: string;
  values: { correct: number; wrong: number; empty: number; time: number };
  setValues: React.Dispatch<React.SetStateAction<{ correct: number; wrong: number; empty: number; time: number }>>;
  net: number;
  maxQuestions: number;
}

const SubjectInputBlock: React.FC<SubjectInputBlockProps> = ({
  subjectKey,
  title,
  values,
  setValues,
  net,
  maxQuestions,
}) => {
  const details = getSubjectDetails(subjectKey);

  const handleCorrectChange = (val: number) => {
    const c = Math.max(0, Math.min(maxQuestions, val));
    const rem = maxQuestions - c;
    const w = Math.min(values.wrong, rem);
    const e = rem - w;
    setValues({ ...values, correct: c, wrong: w, empty: e });
  };

  const handleWrongChange = (val: number) => {
    const rem = maxQuestions - values.correct;
    const w = Math.max(0, Math.min(rem, val));
    const e = rem - w;
    setValues({ ...values, wrong: w, empty: e });
  };

  return (
    <div className={`p-4 rounded-xl border ${details.borderColor} ${details.bgColor} space-y-3`}>
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
        <span className={`font-bold text-xs ${details.textColor}`}>{title}</span>
        <span className="font-extrabold text-xs bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md shadow-xs">
          Net: <span className={details.textColor}>{net.toFixed(2)}</span>
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <label className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            Doğru
          </label>
          <input
            type="number"
            min={0}
            max={maxQuestions}
            value={values.correct}
            onChange={(e) => handleCorrectChange(parseInt(e.target.value) || 0)}
            className="w-full text-center px-2 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-red-600 dark:text-red-400 mb-1">
            Yanlış
          </label>
          <input
            type="number"
            min={0}
            max={maxQuestions - values.correct}
            value={values.wrong}
            onChange={(e) => handleWrongChange(parseInt(e.target.value) || 0)}
            className="w-full text-center px-2 py-1.5 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-amber-600 dark:text-amber-400 mb-1">
            Boş
          </label>
          <input
            type="number"
            disabled
            value={values.empty}
            className="w-full text-center px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Süre (Dk)
          </label>
          <input
            type="number"
            min={0}
            value={values.time}
            onChange={(e) => setValues({ ...values, time: parseInt(e.target.value) || 0 })}
            className="w-full text-center px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
          />
        </div>
      </div>
    </div>
  );
};
