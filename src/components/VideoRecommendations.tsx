import React, { useState } from 'react';
import { Tv, Play, Sparkles, Filter, CheckCircle2, Bookmark, Search, ExternalLink, BookOpen } from 'lucide-react';
import { VideoItem, SubjectKey, ExamRecord } from '../types';
import { RECOMMEND_VIDEOS } from '../data/mockData';
import { getSubjectDetails, getWeakTopicsFromExams } from '../utils/helpers';

interface VideoRecommendationsProps {
  exams: ExamRecord[];
}

export const VideoRecommendations: React.FC<VideoRecommendationsProps> = ({ exams }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [currentNoteText, setCurrentNoteText] = useState('');

  const weakTopics = getWeakTopicsFromExams(exams);
  const weakTopicNames = weakTopics.map((w) => w.topic);

  // Filter logic
  const filteredVideos = RECOMMEND_VIDEOS.filter((vid) => {
    if (selectedSubject !== 'all' && vid.subjectKey !== selectedSubject) return false;
    if (selectedType !== 'all' && vid.type !== selectedType) return false;
    if (
      searchQuery &&
      !vid.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !vid.topic.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !vid.channel.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSaveNote = (vidId: string) => {
    if (!currentNoteText.trim()) return;
    setUserNotes((prev) => ({ ...prev, [vidId]: currentNoteText }));
    setCurrentNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner for Weak Topics Matching */}
      <div className="bg-slate-900 text-white rounded-[28px] p-6 shadow-xl border border-indigo-900/50 relative overflow-hidden bento-card-bg">
        <div className="absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-10 pointer-events-none">
          <Tv className="w-64 h-64" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Kişiselleştirilmiş Video Öneri Motoru</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Eksik Olduğun Soru Tiplerine Özel Çözüm & Konu Videoları
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Son çözdüğün deneme sınavlarında takıldığın konular yapay zeka ile tespit edildi. Türkiye'nin en iyi YKS kanallarından bu konulara özel seçilen videolar:
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {weakTopics.slice(0, 4).map((w, i) => (
              <span
                key={i}
                className="bg-red-500/20 border border-red-400/40 text-red-200 text-[11px] font-bold px-3 py-1 rounded-full flex items-center space-x-1"
              >
                <span>⚠️ {w.topic}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Konu, kanal veya video ara (ör: Optik, Mert Hoca)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Subject Filter Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedSubject === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Tüm Dersler
          </button>
          <button
            onClick={() => setSelectedSubject('turkce')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedSubject === 'turkce'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100'
            }`}
          >
            Türkçe
          </button>
          <button
            onClick={() => setSelectedSubject('matematik')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedSubject === 'matematik'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            Matematik & Geometri
          </button>
          <button
            onClick={() => setSelectedSubject('fen')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedSubject === 'fen'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 hover:bg-purple-100'
            }`}
          >
            Fen Bilimleri
          </button>
          <button
            onClick={() => setSelectedSubject('sosyal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedSubject === 'sosyal'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            Sosyal Bilgiler
          </button>
        </div>

        {/* Video Type Toggle */}
        <div className="flex items-center space-x-1 border-l border-slate-200 dark:border-slate-800 pl-3">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              selectedType === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setSelectedType('solution')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              selectedType === 'solution'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🎯 Soru Çözümü
          </button>
          <button
            onClick={() => setSelectedType('explanation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              selectedType === 'explanation'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            📖 Konu Anlatımı
          </button>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map((video) => {
          const subDetails = getSubjectDetails(video.subjectKey);
          const isWeakMatched = weakTopicNames.includes(video.topic);

          return (
            <div
              key={video.id}
              className={`bg-white dark:bg-slate-900 rounded-[24px] border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                isWeakMatched
                  ? 'border-amber-400 dark:border-amber-500/60 ring-2 ring-amber-400/20'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative bg-slate-900 aspect-video flex items-center justify-center group cursor-pointer" onClick={() => setActiveVideo(video)}>
                  {/* Mock Youtube Image Background */}
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Play Button Overlay */}
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${subDetails.badgeBg}`}>
                      {subDetails.name}
                    </span>
                    {isWeakMatched && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center space-x-1 shadow-xs">
                        <span>⚠️ Eksik Konun</span>
                      </span>
                    )}
                  </div>

                  {/* Duration Badge */}
                  <span className="absolute bottom-2.5 right-2.5 bg-slate-950/90 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                    {video.duration}
                  </span>
                </div>

                {/* Video Info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{video.channel}</span>
                    <span className="font-medium">{video.viewsCount || 'Çok izlenen'}</span>
                  </div>

                  <h3
                    onClick={() => setActiveVideo(video)}
                    className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {video.title}
                  </h3>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                      {video.topic}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {video.type === 'solution' ? '🎯 Soru Çözümü' : '📖 Konu Anlatımı'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-3">
                <button
                  onClick={() => setActiveVideo(video)}
                  className="w-full mt-3 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Videoyu İzle & Not Al</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Player Modal with Notes */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {activeVideo.channel} • {activeVideo.topic}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Embedded YouTube Iframe */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Integrated Student Note Taking for Video */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>Bu Video İçin Notlarım & Püf Noktaları</span>
              </h4>

              {userNotes[activeVideo.id] && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200 text-xs rounded-lg font-medium">
                  "{userNotes[activeVideo.id]}"
                </div>
              )}

              <div className="flex space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="Videodan aldığın pratik formül veya notu yaz (ör: Katlama sorularında açıortayları mutlaka çiz)..."
                  value={currentNoteText}
                  onChange={(e) => setCurrentNoteText(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleSaveNote(activeVideo.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  Notu Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
