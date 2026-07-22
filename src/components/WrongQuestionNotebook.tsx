import React, { useState } from 'react';
import { BookOpen, Plus, CheckCircle, Trash2, Tag, Image, Sparkles, Filter } from 'lucide-react';
import { WrongQuestionItem, SubjectKey } from '../types';
import { getSubjectDetails } from '../utils/helpers';
import { TYT_TOPICS } from '../data/mockData';

interface WrongQuestionNotebookProps {
  wrongQuestions: WrongQuestionItem[];
  onSaveWrongQuestions: (items: WrongQuestionItem[]) => void;
}

export const WrongQuestionNotebook: React.FC<WrongQuestionNotebookProps> = ({
  wrongQuestions,
  onSaveWrongQuestions,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form State
  const [subjectKey, setSubjectKey] = useState<SubjectKey>('matematik');
  const [topic, setTopic] = useState<string>(TYT_TOPICS.matematik[5]);
  const [questionText, setQuestionText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [notes, setNotes] = useState('');

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
    if (!questionText.trim()) return;

    const newItem: WrongQuestionItem = {
      id: `wq-${Date.now()}`,
      subjectKey,
      topic,
      questionText,
      imageUrl,
      correctAnswerText: correctAnswer,
      myWrongAnswerText: '',
      notes,
      isResolved: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSaveWrongQuestions([newItem, ...wrongQuestions]);
    setIsAddOpen(false);
    setQuestionText('');
    setImageUrl('');
    setCorrectAnswer('');
    setNotes('');
  };

  const filtered = wrongQuestions.filter((item) => {
    if (filterSubject !== 'all' && item.subjectKey !== filterSubject) return false;
    if (filterStatus === 'resolved' && !item.isResolved) return false;
    if (filterStatus === 'unresolved' && item.isResolved) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Dijital Yanlış Soru Defterim
            </h2>
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-full border border-red-200/50 dark:border-red-800/50">
              {wrongQuestions.filter((q) => !q.isResolved).length} Çözülmeyi Bekleyen Soru
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Denemelerde ve testlerde yanlış yaptığın veya boş bıraktığın soruları burada biriktir ve sınava kadar tekrar et.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Yanlış Soru Ekle</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filtrele:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

      {/* Grid of Wrong Questions */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">
            Yanlış Soru Defterin Henüz Boş
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Denemelerde yapamadığın soruları "Yeni Yanlış Soru Ekle" butonu ile defterine kaydedebilirsin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => {
            const subDetails = getSubjectDetails(item.subjectKey);
            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-[24px] border p-5 shadow-xs transition-all flex flex-col justify-between space-y-3 ${
                  item.isResolved
                    ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full ${subDetails.badgeBg}`}>
                      {subDetails.name} • {item.topic}
                    </span>
                    <button
                      onClick={() => handleToggleResolved(item.id)}
                      className={`text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 transition-colors ${
                        item.isResolved
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{item.isResolved ? 'Öğrenildi' : 'Çözülecek'}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">
                    {item.questionText}
                  </p>

                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt="Soru Görseli"
                      className="max-h-48 rounded-2xl object-contain border border-slate-200 dark:border-slate-800"
                    />
                  )}

                  {item.correctAnswerText && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-xs">
                      <span className="font-extrabold text-emerald-800 dark:text-emerald-300">Doğru Cevap & Çözüm: </span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{item.correctAnswerText}</span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-xs">
                      <span className="font-extrabold text-amber-800 dark:text-amber-300">Püf Nokta Notum: </span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{item.notes}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">Ekleme Tarihi: {item.createdAt}</span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Item Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              Yanlış Soru Defterine Ekle
            </h3>

            <form onSubmit={handleCreateNew} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Ders Seçin</label>
                <select
                  value={subjectKey}
                  onChange={(e) => {
                    const sub = e.target.value as SubjectKey;
                    setSubjectKey(sub);
                    setTopic(TYT_TOPICS[sub][0]);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium outline-none"
                >
                  <option value="turkce">Türkçe</option>
                  <option value="matematik">Matematik & Geometri</option>
                  <option value="fen">Fen Bilimleri</option>
                  <option value="sosyal">Sosyal Bilgiler</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Konu</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium outline-none"
                >
                  {TYT_TOPICS[subjectKey].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Soru Metni *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Sorunun metnini veya özetini yazın..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Doğru Cevap & Çözümü</label>
                <input
                  type="text"
                  placeholder="Örn: Cevap C şıkkı, Muhteşem üçlü kuralından BD = 5 cm bulunur."
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Unutmaman Gereken Püf Noktası</label>
                <input
                  type="text"
                  placeholder="Örn: Soruda dik üçgen görür görmez kenarortayı kontrol et!"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl shadow-xs"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
