import React, { useRef, useState } from 'react';
import { Download, Upload, Github, HelpCircle, CheckCircle, Database, Server, X, ShieldAlert } from 'lucide-react';
import { storage } from '../utils/helpers';
import { BackupData } from '../types';

interface BackupAndGithubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreCompleted: () => void;
}

export const BackupAndGithubModal: React.FC<BackupAndGithubModalProps> = ({
  isOpen,
  onClose,
  onRestoreCompleted,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  if (!isOpen) return null;

  const handleExportJSON = () => {
    try {
      const data = storage.exportBackupData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `yks-tyt-analiz-yedek-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMsg('Tüm çalışma verileriniz ve kayıtlı hesaplar JSON yedek dosyası olarak indirildi!');
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {
      setErr('Yedek indirme başarısız oldu.');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg('');
    setErr('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as BackupData;
        const success = storage.importBackupData(parsed);
        if (success) {
          setMsg('Yedek başarıyla yüklendi ve tüm veriler güncellendi!');
          onRestoreCompleted();
          setTimeout(() => setMsg(''), 4000);
        } else {
          setErr('Yedek dosyası formata uygun değil.');
        }
      } catch (err) {
        setErr('Geçersiz JSON dosyası seçildi.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            title="Kapat"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                Veri Yedekleme & GitHub Rehberi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sıfır veri kaybı garantisi ve GitHub / Vercel çalıştırma kılavuzu
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {msg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {err && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-bold flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {/* Section 1: Backup Export / Import */}
        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              1. Veri Yedekleme & İçe/Dışa Aktar (JSON)
            </h4>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Tüm deneme sonuçlarınızı, yanlış soru defterinizi, haftalık ders programınızı ve arkadaş hesaplarınızı 1 tıkla bilgisayarınıza yedekleyin veya başka bir cihaza aktarın.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={handleExportJSON}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Tüm Verileri İndir (JSON Export)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Yedek Dosyası Yükle (Import)</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </div>
        </div>

        {/* Section 2: User Questions Guidance */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              2. Sık Sorulan Sorular & Teknik Yanıtlar
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            {/* Q1 */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <h5 className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Github className="w-4 h-4 text-indigo-500" />
                <span>GitHub'a yüklediğimde veri kaybı yaşanır mı? Sayfa yenilenince sıfırlanır mı?</span>
              </h5>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                <strong>HAYIR, SIFIRLANMAZ!</strong> Uygulama verilerinizi tarayıcınızın kalıcı <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 font-mono">localStorage</code> veritabanında saklar. Sayfayı kapatsanız veya yenileseniz dahi verileriniz korunur. Ancak tarayıcı geçmişini/çerezleri tamamen temizleme riskine karşı yukarıdaki <strong>"Tüm Verileri İndir"</strong> butonunu kullanarak haftalık yedek alabilirsiniz.
              </p>
            </div>

            {/* Q2 */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <h5 className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Server className="w-4 h-4 text-emerald-500" />
                <span>Yapay zeka GitHub üzerinden sorunsuz çalışır mı? Nerede çalıştırmalıyım?</span>
              </h5>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                <strong>SOHBET VE ANALİZ KESİNTİSİZ ÇALIŞIR!</strong> 
                1. <strong>Vercel veya Render (Tavsiye Edilen):</strong> GitHub reponuzu Vercel veya Render'a bağlarsanız Express backend sunucusu ve Gemini AI entegrasyonu %100 canlı çalışır.<br />
                2. <strong>GitHub Pages:</strong> Statik site olarak yayınlarsanız akıllı varsayılan algoritmalar devreye girer. Projeye <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 font-mono">GEMINI_API_KEY</code> ekleyerek tüm ortamlarda tam performans alabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
