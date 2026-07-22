import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Lightbulb, MessageSquare } from 'lucide-react';
import { AICoachMessage, TargetGoal, ExamRecord } from '../types';

interface AICoachChatViewProps {
  exams: ExamRecord[];
  targetGoal: TargetGoal;
}

export const AICoachChatView: React.FC<AICoachChatViewProps> = ({ exams, targetGoal }) => {
  const [messages, setMessages] = useState<AICoachMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: `Merhaba! Ben senin YKS Yapay Zeka Eğitim Koçunum. 🎓\n\nSon denemelerindeki performansını ve **${targetGoal.targetNet} Net** hedefini inceledim. YKS hazırlık sürecinde takıldığın her soruyu, ders çalışma stratejilerini, zaman yönetimini veya kaygı kontrolünü bana sorabilirsin!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Matematik netlerimi 20\'den 30\'a nasıl yükseltebilirim?',
    'Paragrafta süre yetiştiremiyorum, ne yapmalıyım?',
    'Geometri korkusunu yenmek için sıfırdan nasıl başlanır?',
    'Denemede turlama taktiği en verimli nasıl uygulanır?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || isLoading) return;

    const userMsg: AICoachMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const latestExam = exams[exams.length - 1];
      const res = await fetch('/api/ai/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userContext: {
            avgNet: latestExam?.totalNet || 80,
            targetNet: targetGoal.targetNet,
            targetDepartment: targetGoal.targetDepartment,
          },
        }),
      });

      const data = await res.json();
      const botMsg: AICoachMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.text || 'Üzgünüm, şu an yanıt oluşturamadım.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Coach chat failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 bento-card-bg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm flex items-center space-x-2">
              <span>YKS Yapay Zeka Derece Koçu</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-[11px] text-slate-300">
              7/24 Aktif • Sorularına özel çözümler ve taktik rehberi
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-white shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-xl space-y-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
              <div
                className={`p-4 rounded-[20px] text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                    : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-xs whitespace-pre-line font-medium'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 px-1 font-mono">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 px-4 py-3 rounded-[20px] rounded-tl-none text-xs text-slate-500 flex items-center space-x-2 font-medium">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>YKS Koçunuz yanıt hazırlıyor...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar flex space-x-2">
        {quickPrompts.map((promptText, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(promptText)}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center space-x-1.5 shrink-0"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{promptText}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder="Koçuna bir soru sor veya takıldığın noktayı anlat..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl transition-all disabled:opacity-50 shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
