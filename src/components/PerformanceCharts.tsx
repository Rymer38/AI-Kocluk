import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { ExamRecord, TargetGoal, SubjectKey } from '../types';
import { getSubjectDetails, getWeakTopicsFromExams } from '../utils/helpers';
import { TrendingUp, AlertTriangle, CheckCircle2, Award } from 'lucide-react';

interface PerformanceChartsProps {
  exams: ExamRecord[];
  targetGoal: TargetGoal;
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  exams,
  targetGoal,
}) => {
  // Sort exams by date ascending for trend analysis
  const sortedExams = [...exams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const lineChartData = sortedExams.map((exam) => ({
    name: exam.title.length > 15 ? exam.title.substring(0, 15) + '...' : exam.title,
    fullTitle: exam.title,
    date: exam.date,
    'Toplam Net': exam.totalNet,
    Türkçe: exam.subjects.turkce.net,
    Sosyal: exam.subjects.sosyal.net,
    Matematik: exam.subjects.matematik.net,
    Fen: exam.subjects.fen.net,
  }));

  // Latest exam breakdown for Radar chart
  const latestExam = sortedExams[sortedExams.length - 1];

  const radarData = latestExam
    ? [
        { subject: 'Türkçe', net: latestExam.subjects.turkce.net, max: 40, percent: Math.round((latestExam.subjects.turkce.net / 40) * 100) },
        { subject: 'Sosyal', net: latestExam.subjects.sosyal.net, max: 20, percent: Math.round((latestExam.subjects.sosyal.net / 20) * 100) },
        { subject: 'Matematik', net: latestExam.subjects.matematik.net, max: 40, percent: Math.round((latestExam.subjects.matematik.net / 40) * 100) },
        { subject: 'Fen', net: latestExam.subjects.fen.net, max: 20, percent: Math.round((latestExam.subjects.fen.net / 20) * 100) },
      ]
    : [];

  const weakTopics = getWeakTopicsFromExams(exams);

  return (
    <div className="space-y-6">
      {/* 1. Net Progress Line Chart Bento Container */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 gap-2">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span>TYT Net Gelişim Grafiği (Zaman İçinde)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tüm denemelerdeki toplam net ve ders bazlı ilerleme eğriniz
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3.5 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
            <Award className="w-4 h-4" />
            <span>Hedef: {targetGoal.targetNet} Net</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 120]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <ReferenceLine
                y={targetGoal.targetNet}
                label={{
                  value: `Hedef (${targetGoal.targetNet} Net)`,
                  fill: '#ef4444',
                  fontSize: 11,
                  position: 'top',
                }}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={2}
              />
              <Line type="monotone" dataKey="Toplam Net" stroke="#4f46e5" strokeWidth={3.5} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Türkçe" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Matematik" stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Sosyal" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Fen" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Grid: Radar Chart & Weak Topics List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar / Subject Balance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">
              Son Deneme Ders Dengesi (Başarı Oranı %)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Son sınavdaki netlerinizin toplam soru sayısına oranı
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Başarı %" dataKey="percent" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            {radarData.map((d) => (
              <div key={d.subject} className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">{d.subject}</span>
                <span className="font-black text-xs text-slate-900 dark:text-white">{d.net} Net</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Topics Analysis */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span>Tespit Edilen Eksik Konular</span>
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200/50 dark:border-amber-800/50">
              {weakTopics.length} Konu Alarm Veriyor
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Denemelerde en çok yanlış ve boş bıraktığınız konu türleri
          </p>

          <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
            {weakTopics.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <span>Eksik konu tespit edilmedi, mükemmel gidiyorsun!</span>
              </div>
            ) : (
              weakTopics.map((item, idx) => {
                const subDetail = getSubjectDetails(item.subjectKey);
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${subDetail.badgeBg}`}>
                          {subDetail.name}
                        </span>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {item.topic}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                        <span className="text-red-500 font-semibold">{item.wrongCount} Yanlış</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-amber-500 font-semibold">{item.emptyCount} Boş</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-red-600 dark:text-red-400 block">
                        %{item.accuracy} Başarı
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Takviye Gerekli</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
