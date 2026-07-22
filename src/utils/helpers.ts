import {
  ExamRecord,
  SubjectKey,
  StudyTask,
  WrongQuestionItem,
  TargetGoal,
  Achievement,
  BookResource,
  TeacherPlaylist,
  UserAccount,
  BackupData,
} from '../types';
import { SAMPLE_EXAMS, INITIAL_STUDY_TASKS, INITIAL_TARGET_GOAL, INITIAL_ACHIEVEMENTS } from '../data/mockData';

export function calculateNet(correct: number, wrong: number): number {
  const net = correct - wrong / 4;
  return Math.max(0, Math.round(net * 100) / 100);
}

export function estimateTYTScore(totalNet: number): number {
  const score = 100 + totalNet * 3.28;
  return Math.min(500, Math.max(100, Math.round(score * 10) / 10));
}

export function getSubjectDetails(subjectKey: SubjectKey) {
  switch (subjectKey) {
    case 'turkce':
      return {
        name: 'Türkçe',
        maxQuestions: 40,
        color: '#3B82F6', // Blue
        bgColor: 'bg-blue-50 dark:bg-blue-950/40',
        textColor: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-800',
        badgeBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
      };
    case 'sosyal':
      return {
        name: 'Sosyal Bilgiler',
        maxQuestions: 20,
        color: '#F59E0B', // Amber
        bgColor: 'bg-amber-50 dark:bg-amber-950/40',
        textColor: 'text-amber-600 dark:text-amber-400',
        borderColor: 'border-amber-200 dark:border-amber-800',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
      };
    case 'matematik':
      return {
        name: 'Temel Matematik',
        maxQuestions: 40,
        color: '#10B981', // Emerald
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
      };
    case 'fen':
      return {
        name: 'Fen Bilimleri',
        maxQuestions: 20,
        color: '#8B5CF6', // Purple
        bgColor: 'bg-purple-50 dark:bg-purple-950/40',
        textColor: 'text-purple-600 dark:text-purple-400',
        borderColor: 'border-purple-200 dark:border-purple-800',
        badgeBg: 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300',
      };
  }
}

export function getDaysUntilYKS(): { days: number; hours: number; minutes: number } {
  const yksDate = new Date('2027-06-20T10:00:00');
  const now = new Date();
  const diff = yksDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

export function getWeakTopicsFromExams(exams: ExamRecord[]): { topic: string; subjectKey: SubjectKey; wrongCount: number; emptyCount: number; accuracy: number }[] {
  if (!exams || exams.length === 0) return [];

  const topicStats: Record<string, { topic: string; subjectKey: SubjectKey; correct: number; wrong: number; empty: number; total: number }> = {};

  exams.forEach((exam) => {
    (['turkce', 'sosyal', 'matematik', 'fen'] as SubjectKey[]).forEach((subKey) => {
      const subject = exam.subjects[subKey];
      if (subject && subject.topics) {
        subject.topics.forEach((t) => {
          if (!topicStats[t.name]) {
            topicStats[t.name] = {
              topic: t.name,
              subjectKey: subKey,
              correct: 0,
              wrong: 0,
              empty: 0,
              total: 0,
            };
          }
          topicStats[t.name].correct += t.correct;
          topicStats[t.name].wrong += t.wrong;
          topicStats[t.name].empty += t.empty;
          topicStats[t.name].total += t.totalQuestions;
        });
      }
    });
  });

  return Object.values(topicStats)
    .map((stat) => {
      const accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 100;
      return {
        topic: stat.topic,
        subjectKey: stat.subjectKey,
        wrongCount: stat.wrong,
        emptyCount: stat.empty,
        accuracy,
      };
    })
    .filter((item) => item.accuracy < 70 || item.wrongCount > 1 || item.emptyCount > 1)
    .sort((a, b) => a.accuracy - b.accuracy);
}

// Initial Default Resources
export const DEFAULT_BOOKS: BookResource[] = [
  { id: 'b-1', title: '3D TYT Matematik Soru Bankası', publisher: '3D Yayınları', subjectKey: 'matematik', totalTests: 45, completedTests: 12 },
  { id: 'b-2', title: 'Bilgi Sarmal TYT Türkçe Soru Bankası', publisher: 'Bilgi Sarmal', subjectKey: 'turkce', totalTests: 50, completedTests: 18 },
  { id: 'b-3', title: 'Eis Yayınları Geometri Soru Bankası', publisher: 'Eis Yayınları', subjectKey: 'matematik', totalTests: 35, completedTests: 8 },
  { id: 'b-4', title: 'Aydın Yayınları TYT Fizik Soru Bankası', publisher: 'Aydın Yayınları', subjectKey: 'fen', totalTests: 30, completedTests: 6 },
];

export const DEFAULT_PLAYLISTS: TeacherPlaylist[] = [
  { id: 'p-1', teacherName: 'Mert Hoca', channel: 'Mert Hoca', subjectKey: 'matematik', topic: 'TYT Matematik Kampı', totalVideos: 60, watchedVideos: 15 },
  { id: 'p-2', teacherName: 'Rüştü Hoca', channel: 'Rüştü Hoca ile Türkçe', subjectKey: 'turkce', topic: 'Paragraf Kampı & Taktikler', totalVideos: 30, watchedVideos: 12 },
  { id: 'p-3', teacherName: 'Eyüp B.', channel: 'Eyüp B. Matematik', subjectKey: 'matematik', topic: 'TYT Geometri Kampı', totalVideos: 45, watchedVideos: 10 },
  { id: 'p-4', teacherName: 'VIP Fizik', channel: 'VIP Fizik', subjectKey: 'fen', topic: 'TYT Fizik Konu Anlatımı', totalVideos: 40, watchedVideos: 8 },
  { id: 'p-5', teacherName: 'Dr. Biyoloji', channel: 'Dr. Biyoloji', subjectKey: 'fen', topic: 'TYT Biyoloji Kampı', totalVideos: 25, watchedVideos: 5 },
];

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    email: 'ekicia926@gmail.com',
    passwordHash: 'admin123',
    role: 'admin',
    createdAt: '2026-07-21',
  },
  {
    id: 'usr-student-1',
    username: 'Ahmet_YKS2027',
    email: 'ahmet@yks.com',
    passwordHash: '123456',
    role: 'student',
    createdAt: '2026-07-20',
  },
];

// Generates Fixed Daily Routines for all days of the week:
// 1. 20 soru sabit paragraf
// 2. 2 test sabit problem
// 3. 1 test sabit geometri
export function ensureFixedDailyRoutines(existingTasks: StudyTask[]): StudyTask[] {
  const daysOfWeek: ('Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi' | 'Pazar')[] = [
    'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'
  ];

  const updatedTasks = [...existingTasks];

  daysOfWeek.forEach((day) => {
    // Check if fixed routines already exist for this day
    const hasParagraph = updatedTasks.some(t => t.day === day && t.description.toLowerCase().includes('sabit paragraf'));
    const hasProblems = updatedTasks.some(t => t.day === day && t.description.toLowerCase().includes('sabit problem'));
    const hasGeometry = updatedTasks.some(t => t.day === day && t.description.toLowerCase().includes('sabit geometri'));

    if (!hasParagraph) {
      updatedTasks.unshift({
        id: `fixed-p-${day}-${Date.now()}`,
        day,
        timeSlot: 'Sabah (09:00 - 12:00)',
        subjectKey: 'turkce',
        topic: 'Paragraf Rutini',
        description: '20 Soru Sabit Paragraf (Süreli Çözüm)',
        isCompleted: false,
        priority: 'Yüksek',
        estimatedMinutes: 20,
        isFixedDailyRoutine: true,
      });
    }

    if (!hasProblems) {
      updatedTasks.unshift({
        id: `fixed-pr-${day}-${Date.now()}`,
        day,
        timeSlot: 'Sabah (09:00 - 12:00)',
        subjectKey: 'matematik',
        topic: 'Problem Rutini',
        description: '2 Test Sabit Problem (Soru Bankası / Fasikül)',
        isCompleted: false,
        priority: 'Yüksek',
        estimatedMinutes: 35,
        isFixedDailyRoutine: true,
      });
    }

    if (!hasGeometry) {
      updatedTasks.unshift({
        id: `fixed-g-${day}-${Date.now()}`,
        day,
        timeSlot: 'Öğle (13:00 - 17:00)',
        subjectKey: 'matematik',
        topic: 'Geometri Rutini',
        description: '1 Test Sabit Geometri (Açı/Üçgen/Çokgen)',
        isCompleted: false,
        priority: 'Yüksek',
        estimatedMinutes: 25,
        isFixedDailyRoutine: true,
      });
    }
  });

  return updatedTasks;
}

// LocalStorage Persistence Layer
const STORAGE_KEYS = {
  EXAMS: 'yks_exam_records_v2',
  TASKS: 'yks_study_tasks_v2',
  TARGET: 'yks_target_goal_v2',
  WRONG_QUESTIONS: 'yks_wrong_questions_v2',
  ACHIEVEMENTS: 'yks_achievements_v2',
  BOOKS: 'yks_books_v2',
  PLAYLISTS: 'yks_playlists_v2',
  USERS: 'yks_users_v2',
  CURRENT_USER: 'yks_current_user_v2',
};

export const storage = {
  getExams(): ExamRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
      return data ? JSON.parse(data) : SAMPLE_EXAMS;
    } catch {
      return SAMPLE_EXAMS;
    }
  },
  saveExams(exams: ExamRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    } catch (e) {
      console.error('Failed to save exams', e);
    }
  },

  getTasks(): StudyTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      const parsed = data ? JSON.parse(data) : INITIAL_STUDY_TASKS;
      return ensureFixedDailyRoutines(parsed);
    } catch {
      return ensureFixedDailyRoutines(INITIAL_STUDY_TASKS);
    }
  },
  saveTasks(tasks: StudyTask[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  },

  getTargetGoal(): TargetGoal {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TARGET);
      return data ? JSON.parse(data) : INITIAL_TARGET_GOAL;
    } catch {
      return INITIAL_TARGET_GOAL;
    }
  },
  saveTargetGoal(goal: TargetGoal): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TARGET, JSON.stringify(goal));
    } catch (e) {
      console.error('Failed to save target goal', e);
    }
  },

  getWrongQuestions(): WrongQuestionItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WRONG_QUESTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveWrongQuestions(items: WrongQuestionItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save wrong questions', e);
    }
  },

  getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  },
  saveAchievements(achievements: Achievement[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (e) {
      console.error('Failed to save achievements', e);
    }
  },

  getBooks(): BookResource[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKS);
      return data ? JSON.parse(data) : DEFAULT_BOOKS;
    } catch {
      return DEFAULT_BOOKS;
    }
  },
  saveBooks(books: BookResource[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    } catch (e) {
      console.error('Failed to save books', e);
    }
  },

  getPlaylists(): TeacherPlaylist[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      return data ? JSON.parse(data) : DEFAULT_PLAYLISTS;
    } catch {
      return DEFAULT_PLAYLISTS;
    }
  },
  savePlaylists(playlists: TeacherPlaylist[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.error('Failed to save playlists', e);
    }
  },

  getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  },
  saveUsers(users: UserAccount[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  },

  getCurrentUser(): UserAccount | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : DEFAULT_USERS[0]; // Default to admin or logged in
    } catch {
      return DEFAULT_USERS[0];
    }
  },
  saveCurrentUser(user: UserAccount | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error('Failed to save current user', e);
    }
  },

  exportBackupData(): BackupData {
    return {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      users: this.getUsers(),
      exams: this.getExams(),
      tasks: this.getTasks(),
      targetGoal: this.getTargetGoal(),
      wrongQuestions: this.getWrongQuestions(),
      books: this.getBooks(),
      playlists: this.getPlaylists(),
      achievements: this.getAchievements(),
    };
  },

  importBackupData(backup: BackupData): boolean {
    try {
      if (backup.exams) this.saveExams(backup.exams);
      if (backup.tasks) this.saveTasks(backup.tasks);
      if (backup.targetGoal) this.saveTargetGoal(backup.targetGoal);
      if (backup.wrongQuestions) this.saveWrongQuestions(backup.wrongQuestions);
      if (backup.books) this.saveBooks(backup.books);
      if (backup.playlists) this.savePlaylists(backup.playlists);
      if (backup.users) this.saveUsers(backup.users);
      if (backup.achievements) this.saveAchievements(backup.achievements);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
};

