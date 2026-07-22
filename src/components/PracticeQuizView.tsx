import React, { useState } from 'react';
import { Brain, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw, HelpCircle, BookPlus } from 'lucide-react';
import { QuizQuestion, SubjectKey, WrongQuestionItem } from '../types';
import { INITIAL_QUIZ_QUESTIONS, TYT_TOPICS } from '../data/mockData';
import { getSubjectDetails } from '../utils/helpers';

interface PracticeQuizViewProps {
  onAddWrongQuestion: (item: WrongQuestionItem) => void;
}

export const PracticeQuizView: React.FC<PracticeQuizViewProps> = ({ onAddWrongQuestion }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(INITIAL_QUIZ_QUESTIONS);
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>('matematik');
  const [selectedTopic, setSelectedTopic] = useState<string>(TYT_TOPICS.matematik[5]); // Geometri: Üçgenler ve Açılar
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Quiz Engine State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [scoreCount, setScoreCount] = useState<number>(0);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);

  const currentQ = questions[currentIndex];

  const handleOptionSelect = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerChecked(true);

    if (selectedOption === currentQ.correctIndex) {
      setScoreCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setScoreCount(0);
    setIsQuizFinished(false);
  };

  // Generate new questions from Gemini AI
  const handleGenerateAIQuiz = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectKey: selectedSubject,
          topic: selectedTopic,
          count: 3,
        }),
      });
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        const formatted: QuizQuestion[] = data.questions.map((q: any, i: number) => ({
          id: `ai-q-${Date.now()}-${i}`,
          questionText: q.questionText,
          subjectKey: selectedSubject,
          topic: selectedTopic,
          options: q.options || [],
          correctIndex: q.correctIndex ?? 0,
          explanation: q.explanation || 'Detaylı çözüm yapay zeka tarafından sağlandı.',
        }));
        setQuestions(formatted);
        handleResetQuiz();
      }
    } catch (err) {
      console.error('Quiz generate failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToWrongNotebook = () => {
    if (!currentQ || selectedOption === null || selectedOption === currentQ.correctIndex) return;
    const item: WrongQuestionItem = {
      id: `wq-${Date.now()}`,
      subjectKey: currentQ.subjectKey,
      topic: currentQ.topic,
      questionText: currentQ.questionText,
      correctAnswerText: currentQ.options[currentQ.correctIndex],
      myWrongAnswerText: currentQ.options[selectedOption],
      notes: currentQ.explanation,
      isResolved: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    onAddWrongQuestion(item);
    alert('Soru başarıyla Yanlış Defterim sayfasına kaydedildi!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Bento Container */}
      <div className="bg-slate-900 text-white rounded-[28px] p-6 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bento-card-bg">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">YKS İnteraktif Test & Mini Pratik Robotu</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Zayıf olduğun konularda anında çözümlü testler oluştur ve adım adım pratik yap.
          </p>
        </div>

        {/* AI Quiz Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => {
              const sub = e.target.value as SubjectKey;
              setSelectedSubject(sub);
              setSelectedTopic(TYT_TOPICS[sub][0]);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 text-xs font-bold outline-none"
          >
            <option value="turkce">Türkçe</option>
            <option value="matematik">Matematik & Geometri</option>
            <option value="fen">Fen Bilimleri</option>
            <option value="sosyal">Sosyal Bilgiler</option>
          </select>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 text-xs font-bold outline-none max-w-[200px]"
          >
            {TYT_TOPICS[selectedSubject].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerateAIQuiz}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all disabled:opacity-50 shadow-xs"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                <span>Hazırlanıyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>AI İle Test Üret</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quiz Card Engine */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs">
        {isQuizFinished ? (
          <div className="text-center py-10 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold shadow-xs">
              🎉
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Test Tamamlandı!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {questions.length} sorudan <span className="font-bold text-emerald-600">{scoreCount} Doğru</span> yaptın.
            </p>

            <button
              onClick={handleResetQuiz}
              className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all mx-auto shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Testi Tekrar Çöz</span>
            </button>
          </div>
        ) : currentQ ? (
          <div className="space-y-6">
            {/* Top Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400">
                  Soru {currentIndex + 1} / {questions.length}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                  {currentQ.topic}
                </span>
              </div>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                Skor: {scoreCount} / {currentIndex}
              </span>
            </div>

            {/* Question Text */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.questionText}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options.map((optionText, idx) => {
                const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D, E
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let optionStyle =
                  'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';

                if (isAnswerChecked) {
                  if (isCorrect) {
                    optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'border-red-500 bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center space-x-3.5 text-xs sm:text-sm ${optionStyle}`}
                  >
                    <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs">
                      {optionLetter}
                    </span>
                    <span className="flex-1 font-medium">{optionText}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation Box when checked */}
            {isAnswerChecked && (
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2">
                <h4 className="font-bold text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                    <span>Çözümlü Detaylı Açıklama</span>
                  </span>
                  {selectedOption !== currentQ.correctIndex && (
                    <button
                      onClick={handleSaveToWrongNotebook}
                      className="text-xs text-red-600 font-bold hover:underline flex items-center space-x-1"
                    >
                      <BookPlus className="w-3.5 h-3.5" />
                      <span>Yanlış Defterime Ekle</span>
                    </button>
                  )}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedOption === null}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all disabled:opacity-50 shadow-xs"
                >
                  Cevabı Kontrol Et
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-xs"
                >
                  <span>Sonraki Soru</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
