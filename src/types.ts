export type SubjectKey = 'turkce' | 'sosyal' | 'matematik' | 'fen';

export interface TopicScore {
  id: string;
  name: string;
  subjectKey: SubjectKey;
  correct: number;
  wrong: number;
  empty: number;
  totalQuestions: number;
}

export interface SubjectBreakdown {
  correct: number;
  wrong: number;
  empty: number;
  net: number;
  topics: TopicScore[];
  timeSpentMinutes?: number;
}

export interface ExamRecord {
  id: string;
  title: string; // e.g. "3D Yayınları TYT-1 Denemesi"
  publisher?: string;
  date: string; // ISO string YYYY-MM-DD
  subjects: {
    turkce: SubjectBreakdown;
    sosyal: SubjectBreakdown;
    matematik: SubjectBreakdown;
    fen: SubjectBreakdown;
  };
  totalCorrect: number;
  totalWrong: number;
  totalEmpty: number;
  totalNet: number;
  estimatedScore: number; // Estimated TYT 100-500 scale
  notes?: string;
  aiAnalysis?: string;
}

export interface BookResource {
  id: string;
  title: string; // e.g., "3D TYT Matematik Soru Bankası"
  publisher: string;
  subjectKey: SubjectKey;
  totalTests: number;
  completedTests: number;
  notes?: string;
}

export interface TeacherPlaylist {
  id: string;
  teacherName: string; // e.g., "Mert Hoca", "Rüştü Hoca", "Eyüp B.", "VIP Fizik"
  channel: string;
  subjectKey: SubjectKey;
  topic: string; // e.g., "TYT Matematik Kampı"
  totalVideos: number;
  watchedVideos: number;
  playlistUrl?: string;
}

export interface StudyTask {
  id: string;
  day: 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi' | 'Pazar';
  timeSlot: 'Sabah (09:00 - 12:00)' | 'Öğle (13:00 - 17:00)' | 'Akşam (18:00 - 22:00)';
  subjectKey: SubjectKey;
  topic: string;
  description: string;
  isCompleted: boolean;
  priority: 'Yüksek' | 'Orta' | 'Düşük';
  estimatedMinutes: number;
  isFixedDailyRoutine?: boolean; // Indicates 20 Paragraph, 2 Problem tests, 1 Geometry test fixed routines
  bookResourceTitle?: string;
  teacherName?: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  subjectKey: SubjectKey;
  topic: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface WrongQuestionItem {
  id: string;
  examTitle?: string;
  subjectKey: SubjectKey;
  topic: string;
  questionText: string;
  imageUrl?: string;
  correctAnswerText: string;
  myWrongAnswerText: string;
  notes: string;
  isResolved: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  currentProgress: number;
  targetProgress: number;
}

export interface TargetGoal {
  targetNet: number;
  targetDepartment: string;
  targetUniversity: string;
  targetRank: number;
}

export interface AICoachMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // Hashed or encoded password
  role: 'admin' | 'student';
  createdAt: string;
  targetGoal?: TargetGoal;
  exams?: ExamRecord[];
  tasks?: StudyTask[];
  wrongQuestions?: WrongQuestionItem[];
  books?: BookResource[];
  playlists?: TeacherPlaylist[];
}

export interface BackupData {
  version: string;
  exportedAt: string;
  users: UserAccount[];
  exams: ExamRecord[];
  tasks: StudyTask[];
  targetGoal: TargetGoal;
  wrongQuestions: WrongQuestionItem[];
  books: BookResource[];
  playlists: TeacherPlaylist[];
  achievements: Achievement[];
}

