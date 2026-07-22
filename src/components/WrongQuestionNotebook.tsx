import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle,
  Trash2,
  Filter,
  Camera,
  Upload,
  Sparkles,
  BarChart2,
  FolderOpen,
  Eye,
  X,
  AlertCircle,
  Lightbulb,
  Check,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { WrongQuestionItem, SubjectKey, ExamRecord } from '../types';
import { getSubjectDetails } from '../utils/helpers';
import { TYT_TOPICS } from '../data/mockData';

interface WrongQuestionNotebookProps {
  wrongQuestions: WrongQuestionItem[];
  onSaveWrongQuestions: (items: WrongQuestionItem[]) => void;
  exams?: ExamRecord[];
}

export const WrongQuestionNotebook: React.FC<WrongQuestionNotebookProps> = ({
  wrongQuestions,
  onSaveWrongQuestions,
  exams = [],
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'grouped' | 'analytics'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<WrongQuestionItem | null>(null);

  // Filters
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterExam, setFilterExam] = useState<string>('all');

  // New Question Form State
  const [selectedExamTitle, setSelectedExamTitle] = useState<string>(
    exams[0]?.title || 'Genel Yanlış Soru'
  );
  const [customExamTitle, setCustomExamTitle] = useState<string>('');
  const [subjectKey, setSubjectKey] = useState<SubjectKey>('matematik');
  const [topic, setTopic] = useState<string>(TYT_TOPICS.matematik[0]);
  const [questionText, setQuestionText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [notes, setNotes] = useState('');

  // AI Scanner State
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [aiScanSuccess, setAiScanSuccess] = useState(false);
  const [aiErrorMsg, setAiErrorMsg] = useState('');

  // Handle Image File Selection / Camera Capture
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setImageUrl(reader.result as string);
        setAiScanSuccess(false);
        setAiErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger Gemini AI Image Analysis
  const handleAnalyzeImageWithAI = async () => {
    if (!imageUrl) {
      setAiErrorMsg('Lütfen önce bir soru fotoğrafı yükleyin veya çekin.');
      return;
    }

    setIsScanningImage(true);
    setAiErrorMsg('');
    setAiScanSuccess(false);

    const targetExam = customExamTitle.trim() || selectedExamTitle;

    try {
      const res = await fetch('/api/ai/analyze-wrong-question-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageUrl,
          examTitle: targetExam,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        const {
          subjectKey: detectedSub,
          topic: detectedTopic,
          questionText: detectedQ,
          correctAnswerText: detectedSol,
          notes: detectedNote,
        } = data.analysis;

        if (detectedSub && ['matematik', 'turkce', 'fen', 'sosyal'].includes(detectedSub)) {
          setSubjectKey(detectedSub as SubjectKey);
        }
        if (detectedTopic) setTopic(detectedTopic);
        if (detectedQ) setQuestionText(detectedQ);
        if (detectedSol) setCorrectAnswer(detectedSol);
        if (detectedNote) setNotes(detectedNote);

        setAiScanSuccess(true);
      } else {
        setAiErrorMsg('Yapay zeka soru görselini tam okuyamadı. Lütfen manuel doldurun.');
      }
    } catch (err) {
      console.error('Image analysis failed:', err);
      setAiErrorMsg('Yapay zeka bağlantısında hata oluştu.');
    } finally {
      setIsScanningImage(false);
    }
  };

  const handleToggleResolved = (id: string) => {
    const updated = wrongQuestions.map((q) =>
      q.id === id ? { ...q, isResolved: !q.isResolved } : q
    );
    onSaveWrongQuestions(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = wrongQuestions.filter((q) => q.id !== id);
    onSaveWrongQuestions(updated);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() && !imageUrl) return;

    const finalExamTitle = customExamTitle.trim() || selectedExamTitle;

    const newItem: WrongQuestionItem = {
      id: `wq-${Date.now()}-${Math.random()}`,
      examTitle: finalExamTitle,
      subjectKey,
      topic: topic.trim() || 'Genel Konu',
      questionText: questionText.trim() || 'Fotoğraflı Yanlış Soru',
      imageUrl,
      correctAnswerText: correctAnswer.trim(),
      myWrongAnswerText: '',
      notes: notes.trim(),
      isResolved: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSaveWrongQuestions([newItem, ...wrongQuestions]);
    setIsAddOpen(false);
    setQuestionText('');
    setImageUrl('');
    setCorrectAnswer('');
    setNotes('');
    setCustomExamTitle('');
    setAiScanSuccess(false);
  };

  // Extract distinct exam titles from wrong questions list and exams prop
  const allExamTitles = Array.from(
    new Set([
      ...exams.map((e) => e.title),
      ...wrongQuestions.map((q) => q.examTitle).filter((t): t is string => Boolean(t)),
    ])
  );

  // Group wrong questions by exam title
  const groupedByExam: Record<string, WrongQuestionItem[]> = {};
  wrongQuestions.forEach((q) => {
    const title = q.examTitle || 'Genel Yanlış Sorular';
    if (!groupedByExam[title]) groupedByExam[title] = [];
    groupedByExam[title].push(q);
  });

  // Filtered List for "all" tab
  const filtered = wrongQuestions.filter((item) => {
    if (filterSubject !== 'all' && item.subjectKey !== filterSubject) return false;
    if (filterStatus === 'resolved' && !item.isResolved) return false;
    if (filterStatus === 'unresolved' && item.isResolved) return false;
    if (filterExam !== 'all' && (item.examTitle || 'Genel Yanlış Sorular') !== filterExam) return false;
    return true;
  });

  // Analytics Chart Data Preparation
  const chartData = Object.keys(groupedByExam).map((examName) => {
    const items = groupedByExam[examName];
    const turkceCount = items.filter((i) => i.subjectKey === 'turkce').length;
    const matCount = items.filter((i) => i.subjectKey === 'matematik').length;
    const fenCount = items.filter((i) => i.subjectKey === 'fen').length;
    const sosyalCount = items.filter((i) => i.subjectKey === 'sosyal').length;

    return {
      name: examName.length > 18 ? examName.substring(0, 16) + '...' : examName,
      fullName: examName,
      Türkçe: turkceCount,
      Matematik: matCount,
      Fen: fenCount,
      Sosyal: sosyalCount,
      totalWrong: items.length,
    };
  });

  // Frequency of weak topics calculated from uploaded photos across exams
  const topicFrequency: Record<string, { topic: string; subjectKey: SubjectKey; count: number; examNames: Set<string> }> = {};
  wrongQuestions.forEach((q) => {
    const key = `${q.subjectKey}-${q.topic}`;
    if (!topicFrequency[key]) {
      topicFrequency[key] = {
        topic: q.topic,
        subjectKey: q.subjectKey,
        count: 0,
        examNames: new Set(),
      };
    }
    topicFrequency[key].count += 1;
    if (q.examTitle) topicFrequency[key].examNames.add(q.examTitle);
  });

  const topWeakTopicsList = Object.values(topicFrequency)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="font-extrabold text-xl text-slate-900 dark:text-white">
              Dijital Yanlış & Boş Soru Defterim
            </h2>
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-full border border-red-200/50 dark:border-red-800/50">
              {wrongQuestions.filter((q) => !q.isResolved).length} Çözülecek Soru Fotoğrafı
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Denemelerindeki yanlış ve boş soruların fotoğrafını çekip yükleyin. Yapay zeka konuyu ve çözümü tespit edip deneme deneme takibini yapsın.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full lg:w-auto">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
          >
            <Camera className="w-4 h-4" />
            <span>Soru Fotoğrafı Yükle / Çek</span>
          </button>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[24px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Tüm Sorular ({wrongQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('grouped')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'grouped'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Denemelere Göre Grupla ({Object.keys(groupedByExam).length} Deneme)</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Deneme Yanlış & Konu Analizi</span>
        </button>
      </div>

      {/* TAB 1: ALL QUESTIONS GRID WITH FILTERS */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filtrele:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterExam}
                onChange={(e) => setFilterExam(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold outline-none"
              >
                <option value="all">Tüm Denemeler</option>
                {allExamTitles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold outline-none"
              >
                <option value="all">Tüm Dersler</option>
                <option value="turkce">Türkçe</option>
                <option value="matematik">Matematik & Geometri</option>
                <option value="fen">Fen Bilimleri</option>
                <option value="sosyal">Sosyal Bilgiler</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold outline-none"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="unresolved">Çözülecekler (Aktif)</option>
                <option value="resolved">Öğrenildi / Çözüldü</option>
              </select>
            </div>
          </div>

          {/* Grid of Question Cards */}
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">
                Kayıtlı Soru Fotoğrafı Bulunmuyor
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                "Soru Fotoğrafı Yükle / Çek" butonunu kullanarak deneme sınavlarındaki yapamadığınız soruları yükleyin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item) => {
                const subDetails = getSubjectDetails(item.subjectKey);
                return (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-slate-900 rounded-[24px] border p-5 shadow-xs transition-all flex flex-col justify-between space-y-3.5 ${
                      item.isResolved
                        ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/10 dark:bg-emerald-950/10'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full truncate ${subDetails.badgeBg}`}>
                          {subDetails.name} • {item.topic}
                        </span>
                        <button
                          onClick={() => handleToggleResolved(item.id)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shrink-0 transition-colors ${
                            item.isResolved
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-emerald-100'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{item.isResolved ? 'Öğrenildi' : 'Çözülecek'}</span>
                        </button>
                      </div>

                      {/* Exam Title Tag */}
                      {item.examTitle && (
                        <div className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{item.examTitle}</span>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-3">
                        {item.questionText}
                      </p>

                      {/* Image Thumbnail with Lightbox click */}
                      {item.imageUrl && (
                        <div
                          onClick={() => setPreviewImageModal(item)}
                          className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950/5 h-44 flex items-center justify-center"
                        >
                          <img
                            src={item.imageUrl}
                            alt="Soru Görseli"
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>Büyüt & Çözümü İncele</span>
                          </div>
                        </div>
                      )}

                      {item.correctAnswerText && (
                        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-xs">
                          <span className="font-extrabold text-emerald-800 dark:text-emerald-300">Doğru Çözüm: </span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2">{item.correctAnswerText}</span>
                        </div>
                      )}

                      {item.notes && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[11px] border border-amber-200/60 dark:border-amber-800/60">
                          <span className="font-bold text-amber-800 dark:text-amber-300">Altın Not: </span>
                          <span className="text-slate-700 dark:text-slate-300">{item.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Tarih: {item.createdAt}</span>
                      <div className="flex items-center space-x-2">
                        {item.imageUrl && (
                          <button
                            onClick={() => setPreviewImageModal(item)}
                            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                          >
                            Detay Gör
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GROUPED BY EXAM FOLDERS */}
      {activeTab === 'grouped' && (
        <div className="space-y-6">
          {Object.keys(groupedByExam).length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3">
              <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">
                Henüz Deneme Bazlı Soru Yüklenmedi
              </h3>
              <p className="text-xs text-slate-400">
                Soru eklerken deneme adını seçerek veya yazarak fotoğrafları deneme bazlı klasörleyebilirsiniz.
              </p>
            </div>
          ) : (
            Object.keys(groupedByExam).map((examTitle) => {
              const examItems = groupedByExam[examTitle];
              const resolvedCount = examItems.filter((i) => i.isResolved).length;

              // Subject count summary
              const subCounts: Record<string, number> = {};
              examItems.forEach((i) => {
                subCounts[i.subjectKey] = (subCounts[i.subjectKey] || 0) + 1;
              });

              return (
                <div
                  key={examTitle}
                  className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {examTitle}
                        </h3>
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200/60">
                          {examItems.length} Fotoğraflı Yanlış Soru
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Tamamlanan: {resolvedCount} / {examItems.length} soru
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {Object.keys(subCounts).map((sKey) => {
                        const sDetails = getSubjectDetails(sKey as SubjectKey);
                        return (
                          <span
                            key={sKey}
                            className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${sDetails.badgeBg}`}
                          >
                            {sDetails.name}: {subCounts[sKey]} Yanlış
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Horizontal Scroll / Grid of Questions for this Exam */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {examItems.map((item) => {
                      const subDetails = getSubjectDetails(item.subjectKey);
                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${subDetails.badgeBg}`}>
                                {subDetails.name} • {item.topic}
                              </span>
                              <button
                                onClick={() => handleToggleResolved(item.id)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.isResolved
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {item.isResolved ? 'Çözüldü ✓' : 'Bekliyor'}
                              </button>
                            </div>

                            <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 line-clamp-2">
                              {item.questionText}
                            </p>

                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt="Soru"
                                onClick={() => setPreviewImageModal(item)}
                                className="h-32 w-full object-contain bg-slate-950/10 rounded-xl cursor-pointer hover:opacity-90 border border-slate-200 dark:border-slate-800"
                              />
                            )}
                          </div>

                          <button
                            onClick={() => setPreviewImageModal(item)}
                            className="w-full py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 transition-colors"
                          >
                            Çözümü İncele
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: ANALYTICS & EXAM COMPARISON */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Chart Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                  <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Deneme Bazlı Yüklenen Yanlış Soru Dağılımı</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Her denemede çekip yüklediğin fotoğraflara göre ders bazlı yanlış soru sayıları
                </p>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                Grafik oluşturmak için en az 1 deneme için soru yüklemelisiniz.
              </div>
            ) : (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Türkçe" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Matematik" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Fen" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Sosyal" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Recurring Weak Topics List across Exams */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Fotoğraflı Yanlışlardan Tespit Edilen En Çok Yanlış Yapılan Konular
              </h3>
            </div>

            {topWeakTopicsList.length === 0 ? (
              <p className="text-xs text-slate-400">Henüz yeterli yanlış soru verisi yüklenmedi.</p>
            ) : (
              <div className="space-y-3">
                {topWeakTopicsList.map((item, idx) => {
                  const subDetails = getSubjectDetails(item.subjectKey);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${subDetails.badgeBg}`}>
                              {subDetails.name}
                            </span>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {item.topic}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Kayıtlı Denemeler: {Array.from(item.examNames).join(', ') || 'Genel'}
                          </p>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-black">
                        {item.count} Yanlış Fotoğrafı
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD WRONG QUESTION WITH AI PHOTO SCANNER */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Yanlış / Boş Soru Fotoğrafı Yükle
                </h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-4 text-xs font-medium">
              {/* Exam Selection */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2">
                <label className="block font-extrabold text-slate-900 dark:text-white">
                  A) Hangi Deneme Sınavına Ait? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={selectedExamTitle}
                    onChange={(e) => setSelectedExamTitle(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold outline-none"
                  >
                    {allExamTitles.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="Yeni Deneme Adı Yaz...">+ Yeni Deneme Adı Gir</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Veya Özel Deneme Adı (Örn: A Denemesi)"
                    value={customExamTitle}
                    onChange={(e) => setCustomExamTitle(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload & AI Scan Section */}
              <div className="space-y-2">
                <label className="block font-extrabold text-slate-900 dark:text-white">
                  B) Soru Fotoğrafı Yükle Veya Kamera İle Çek
                </label>

                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
                  {imageUrl ? (
                    <div className="relative group max-h-48 flex justify-center">
                      <img
                        src={imageUrl}
                        alt="Önizleme"
                        className="max-h-44 rounded-xl object-contain border border-slate-200 dark:border-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4">
                      <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        Fotoğraf Seç veya Kamera İle Çek
                      </span>
                      <span className="text-[10px] text-slate-400">
                        (PNG, JPG, JPEG - Maksimum 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {imageUrl && (
                    <button
                      type="button"
                      onClick={handleAnalyzeImageWithAI}
                      disabled={isScanningImage}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>
                        {isScanningImage
                          ? 'Yapay Zeka Fotoğrafı İnceliyor...'
                          : 'Gemini AI ile Fotoğrafı Tara & Konuyu Bul'}
                      </span>
                    </button>
                  )}

                  {aiScanSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>Soru konusu ve çözümü AI tarafından otomatik tespit edildi!</span>
                    </div>
                  )}

                  {aiErrorMsg && (
                    <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold">
                      {aiErrorMsg}
                    </div>
                  )}
                </div>
              </div>

              {/* Subject & Topic Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Ders Seçin *</label>
                  <select
                    value={subjectKey}
                    onChange={(e) => {
                      const sub = e.target.value as SubjectKey;
                      setSubjectKey(sub);
                      setTopic(TYT_TOPICS[sub][0]);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                  >
                    <option value="turkce">Türkçe</option>
                    <option value="matematik">Matematik & Geometri</option>
                    <option value="fen">Fen Bilimleri</option>
                    <option value="sosyal">Sosyal Bilgiler</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Alt Konu *</label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Örn: Köklü Sayılar veya Paragraf"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Soru Metni / Özeti *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Sorudaki istenen veya verilen bilgi özeti..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Doğru Cevap & Ayrıntılı Çözüm</label>
                <textarea
                  rows={2}
                  placeholder="Cevap C şıkkı, adım adım çözüm açıklaması..."
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Unutmaman Gereken Altın Püf Nokta</label>
                <input
                  type="text"
                  placeholder="Örn: Karekök içindeki ifade asla negatif olamaz!"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl shadow-xs"
                >
                  Görevi Deftere Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMAGE PREVIEW & DETAILED SOLUTION LIGHTBOX */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                  {previewImageModal.examTitle || 'Deneme Yanlış Soru'}
                </span>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {previewImageModal.topic} • Detaylı Soru Görseli ve Çözümü
                </h3>
              </div>
              <button
                onClick={() => setPreviewImageModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewImageModal.imageUrl ? (
              <div className="bg-slate-950 rounded-2xl p-2 max-h-96 flex items-center justify-center overflow-hidden">
                <img
                  src={previewImageModal.imageUrl}
                  alt="Soru Görseli Detay"
                  className="max-h-88 max-w-full object-contain rounded-xl"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Bu soru için görsel yüklenmemiş.</p>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block mb-1">Soru Özeti:</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{previewImageModal.questionText}</p>
              </div>

              {previewImageModal.correctAnswerText && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block mb-1">
                    Adım Adım Çözüm & Doğru Cevap:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium whitespace-pre-line">
                    {previewImageModal.correctAnswerText}
                  </p>
                </div>
              )}

              {previewImageModal.notes && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                  <span className="font-bold">Altın Not: </span>
                  <span>{previewImageModal.notes}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  handleToggleResolved(previewImageModal.id);
                  setPreviewImageModal((prev) => (prev ? { ...prev, isResolved: !prev.isResolved } : null));
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  previewImageModal.isResolved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {previewImageModal.isResolved ? 'Öğrenildi / Çözüldü ✓' : 'Çözüldü Olarak İşaretle'}
              </button>

              <button
                onClick={() => setPreviewImageModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl text-xs"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
