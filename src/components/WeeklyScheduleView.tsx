import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  Plus,
  Clock,
  Trash2,
  AlertTriangle,
  Lightbulb,
  Check,
  Zap,
} from 'lucide-react';
import { StudyTask, SubjectKey, ExamRecord } from '../types';
import { getSubjectDetails, getWeakTopicsFromExams } from '../utils/helpers';

interface WeeklyScheduleViewProps {
  tasks: StudyTask[];
  onUpdateTasks: (tasks: StudyTask[]) => void;
  exams: ExamRecord[];
  targetNet: number;
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  tasks,
  onUpdateTasks,
  exams,
  targetNet,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('Pazartesi');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [addedAiTaskIds, setAddedAiTaskIds] = useState<Record<string, boolean>>({});

  // New Custom Task Form State
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [newTaskTopic, setNewTaskTopic] = useState<string>('');
  const [newTaskSubject, setNewTaskSubject] = useState<SubjectKey>('matematik');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');
  const [newTaskMinutes, setNewTaskMinutes] = useState<number>(30);

  const daysList = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  // Calculate completion percentage
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Weak topics extracted from real exams
  const weakTopics = getWeakTopicsFromExams(exams);

  // Toggle Task completion
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    onUpdateTasks(updated);
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    onUpdateTasks(updated);
  };

  // Add Custom Task
  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTopic.trim()) return;

    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      day: selectedDay as any,
      timeSlot: 'Gün İçi',
      subjectKey: newTaskSubject,
      topic: newTaskTopic.trim(),
      description: newTaskDesc.trim() || `${newTaskTopic} konusu soru çözümü ve tekrarı`,
      isCompleted: false,
      priority: 'Orta',
      estimatedMinutes: Number(newTaskMinutes) || 30,
    };

    onUpdateTasks([newTask, ...tasks]);
    setNewTaskTopic('');
    setNewTaskDesc('');
    setShowAddTask(false);
  };

  // Add an AI Topic Suggestion as a Task in To-Do List
  const handleAddAiTopicToSchedule = (topic: string, subjectKey: SubjectKey, desc: string) => {
    const newTask: StudyTask = {
      id: `ai-rec-${Date.now()}-${Math.random()}`,
      day: selectedDay as any,
      timeSlot: 'Gün İçi',
      subjectKey,
      topic,
      description: desc,
      isCompleted: false,
      priority: 'Yüksek',
      estimatedMinutes: 45,
    };

    onUpdateTasks([newTask, ...tasks]);
    setAddedAiTaskIds((prev) => ({ ...prev, [topic]: true }));
  };

  // Request fresh AI recommendations via Gemini
  const handleGenerateAiPlan = async () => {
    setIsGenerating(true);
    const weakTopicNames = weakTopics.map((w) => w.topic);

    try {
      const res = await fetch('/api/ai/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weakTopics: weakTopicNames.length > 0 ? weakTopicNames : ['Geometri Üçgenler', 'Fizik Optik', 'Matematik Problemler'],
          targetNet,
          currentNet: exams[exams.length - 1]?.totalNet || 75,
        }),
      });

      const data = await res.json();
      if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
        const formattedTasks: StudyTask[] = data.tasks.map((item: any, idx: number) => ({
          id: `ai-gen-${Date.now()}-${idx}`,
          day: item.day || selectedDay,
          timeSlot: item.timeSlot || 'Gün İçi',
          subjectKey: (item.subjectKey as SubjectKey) || 'matematik',
          topic: item.topic || 'Genel Konu Tekrarı',
          description: item.description || 'Konu tekrarı ve soru çözümü.',
          isCompleted: false,
          priority: item.priority || 'Yüksek',
          estimatedMinutes: item.estimatedMinutes || 45,
        }));

        onUpdateTasks([...formattedTasks, ...tasks]);
      }
    } catch (err) {
      console.error('Failed to generate AI plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const dayTasks = tasks.filter((t) => t.day === selectedDay);

  return (
    <div className="space-y-6">
      {/* Top Banner: Overview & Progress */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <span>Haftalık To-Do List & AI Çalışma Önerileri</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Denemelerindeki net kayıplarına göre oluşturulan yapay zeka konu tavsiyelerini görev listenize ekleyin.
            </p>
          </div>

          <button
            onClick={handleGenerateAiPlan}
            disabled={isGenerating}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/25 shrink-0 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{isGenerating ? 'AI Öneriler Hazırlanıyor...' : 'Gemini AI ile Haftalık To-Do Üret'}</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Haftalık Görev Tamamlama Oranı
            </span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
              {completedCount} / {totalTasks} Görev (%{progressPercent})
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Smart Recommendations Box (Exams & Wrong Topics Driven) */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-amber-50/80 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-amber-950/30 p-5 rounded-[28px] border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-amber-300 flex items-center justify-center shadow-xs">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Deneme Analizine Göre AI Konu Tavsiyeleri</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Son denemelerinde en çok yanlış yaptığın konular belirlendi.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full border border-amber-300/60">
            {weakTopics.length > 0 ? `${weakTopics.length} Öncelikli Konu` : 'AI Analiz Hazır'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {weakTopics.length > 0 ? (
            weakTopics.slice(0, 3).map((item, idx) => {
              const subDetails = getSubjectDetails(item.subjectKey);
              const isAdded = addedAiTaskIds[item.topic];
              return (
                <div
                  key={idx}
                  className="bg-white/90 dark:bg-slate-900/90 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${subDetails.badgeBg}`}>
                        {subDetails.name}
                      </span>
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full">
                        %{item.accuracy} Başarı
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {item.topic}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      {item.topic} konusunda {item.wrongCount} yanlış, {item.emptyCount} boş yaptın. 2 test soru çözümü tavsiye edilir.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleAddAiTopicToSchedule(
                        item.topic,
                        item.subjectKey,
                        `${item.topic} konusu soru bankasından 2 test çözümü ve konu özeti.`
                      )
                    }
                    disabled={isAdded}
                    className={`w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      isAdded
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>To-Do Listene Eklendi</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>{selectedDay} To-Do Listesine Ekle</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <>
              {/* Default Smart Suggestions if no exams logged yet */}
              {[
                { title: 'Matematik: Üçgenler ve Geometri', subject: 'matematik' as SubjectKey, desc: 'Açı bağıntıları ve katlama soruları - 30 soru çözümü.' },
                { title: 'Türkçe: Paragrafta Ana Düşünce', subject: 'turkce' as SubjectKey, desc: 'Süreli 20 soru paragraf turlama taktiği.' },
                { title: 'Fizik: Optik ve Kırılma', subject: 'fen' as SubjectKey, desc: 'Mercek formülleri ve 2 test optik soru çözümü.' },
              ].map((item, idx) => {
                const isAdded = addedAiTaskIds[item.title];
                return (
                  <div
                    key={idx}
                    className="bg-white/90 dark:bg-slate-900/90 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                        AI Önerisi #{idx + 1}
                      </span>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {item.desc}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleAddAiTopicToSchedule(item.title, item.subject, item.desc)
                      }
                      disabled={isAdded}
                      className={`w-full flex items-center justify-center space-x-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        isAdded
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <span>Listene Eklendi ✓</span>
                      ) : (
                        <span>+ {selectedDay} Listesine Ekle</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Main Weekly To-Do Section */}
      <div className="space-y-4">
        {/* Day Selector Buttons */}
        <div className="bg-white dark:bg-slate-900 p-2 rounded-[24px] border border-slate-200/80 dark:border-slate-800/80 flex overflow-x-auto no-scrollbar gap-1.5 shadow-xs">
          {daysList.map((day) => {
            const dayItems = tasks.filter((t) => t.day === day);
            const isDone = dayItems.length > 0 && dayItems.every((t) => t.isCompleted);
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 min-w-[85px] py-2.5 px-3 rounded-2xl text-xs font-bold transition-all text-center flex flex-col items-center space-y-1 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{day}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isSelected
                      ? 'bg-indigo-500/40 text-indigo-100'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {dayItems.filter((t) => t.isCompleted).length}/{dayItems.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day To-Do Card List */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{selectedDay} Günü To-Do Listesi</span>
            </h3>

            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="flex items-center space-x-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Görev Ekle</span>
            </button>
          </div>

          {/* Add Task Form */}
          {showAddTask && (
            <form onSubmit={handleAddCustomTask} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {selectedDay} İçin Görev Oluştur
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">Konu / Görev Başlığı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: TYT Matematik Problemler 2 Test"
                    value={newTaskTopic}
                    onChange={(e) => setNewTaskTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">Ders</label>
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value as SubjectKey)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold outline-none"
                  >
                    <option value="matematik">Temel Matematik & Geometri</option>
                    <option value="turkce">Türkçe</option>
                    <option value="fen">Fen Bilimleri</option>
                    <option value="sosyal">Sosyal Bilgiler</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">Tahmini Süre (Dk)</label>
                  <input
                    type="number"
                    min="5"
                    value={newTaskMinutes}
                    onChange={(e) => setNewTaskMinutes(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300 text-xs">Açıklama / Detay</label>
                <input
                  type="text"
                  placeholder="Örn: 3D soru bankasından test 4-5 çözülecek."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs"
                >
                  Görevi Kaydet
                </button>
              </div>
            </form>
          )}

          {dayTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <p>Bu gün için henüz bir görev bulunmuyor.</p>
              <p className="text-[11px] text-slate-500">
                Yukarıdaki AI Konu Önerilerini veya "+ Yeni Görev Ekle" butonunu kullanarak to-do listenizi oluşturun.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dayTasks.map((task) => {
                const subDetails = getSubjectDetails(task.subjectKey);
                return (
                  <div
                    key={task.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      task.isCompleted
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/50 opacity-75'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="mt-0.5 text-indigo-600 dark:text-indigo-400 focus:outline-none shrink-0"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-indigo-500" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${subDetails.badgeBg}`}>
                            {subDetails.name}
                          </span>
                          <h4 className={`text-xs sm:text-sm font-extrabold truncate ${
                            task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                          }`}>
                            {task.topic}
                          </h4>
                        </div>
                        <p className={`text-xs ${
                          task.isCompleted ? 'line-through text-slate-400' : 'text-slate-600 dark:text-slate-300'
                        }`}>
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {/* Time & Delete Button */}
                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedMinutes} dk</span>
                      </span>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
                        title="Görevi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
