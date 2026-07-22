import React, { useState } from 'react';
import { User, Lock, Mail, UserPlus, LogIn, ShieldAlert, X, Check, ShieldCheck } from 'lucide-react';
import { UserAccount } from '../types';
import { storage } from '../utils/helpers';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const allUsers = storage.getUsers();
    const found = allUsers.find(
      (u) =>
        (u.username.toLowerCase() === username.trim().toLowerCase() ||
          u.email.toLowerCase() === username.trim().toLowerCase()) &&
        u.passwordHash === password
    );

    if (found) {
      storage.saveCurrentUser(found);
      onLoginSuccess(found);
      setSuccessMsg(`Hoş geldin, ${found.username}! Oturum başarıyla açıldı.`);
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setErrorMsg('Kullanıcı adı/e-posta veya şifre hatalı! Şifrenizi unuttuysanız Admin yetkiliniz ile iletişime geçebilirsiniz.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username || !password || !email) {
      setErrorMsg('Lütfen tüm alanları doldurun.');
      return;
    }

    const allUsers = storage.getUsers();
    const exists = allUsers.some(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (exists) {
      setErrorMsg('Bu kullanıcı adı veya e-posta ile zaten bir hesap var.');
      return;
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      username: username.trim(),
      email: email.trim(),
      passwordHash: password, // Store password
      role: username.toLowerCase() === 'admin' || email.toLowerCase() === 'ekicia926@gmail.com' ? 'admin' : 'student',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedUsers = [...allUsers, newUser];
    storage.saveUsers(updatedUsers);
    storage.saveCurrentUser(newUser);
    onLoginSuccess(newUser);
    setSuccessMsg('Hesabınız başarıyla oluşturuldu ve oturum açıldı!');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
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
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {currentUser ? 'Hesap Profilim' : mode === 'login' ? 'Oturum Aç' : 'Yeni Kayıt Ol'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser
                  ? 'Çalışma verilerinize tüm cihazlardan erişin'
                  : 'Arkadaşlarınla çalışma programını güvenle paylaş'}
              </p>
            </div>
          </div>
        </div>

        {/* If Already Logged In */}
        {currentUser ? (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  Aktif Kullanıcı:
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200">
                  {currentUser.role === 'admin' ? '🛡️ Üst Düzey Yetkili (Admin)' : '🎓 Öğrenci'}
                </span>
              </div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                {currentUser.username}
              </h4>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {currentUser.email}
              </p>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p className="flex items-center space-x-1.5 text-emerald-600 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verileriniz güvenle şifrelenmiştir.</span>
              </p>
              <p className="text-[11px]">
                * Şifrenizi unutursanız sistem yöneticiniz (Üst Düzey Yetkili) hesabınızı sıfırlayabilir.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  onLogout();
                  setSuccessMsg('Oturum kapatıldı.');
                }}
                className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold py-2.5 rounded-xl text-xs transition-all"
              >
                Oturumu Kapat
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl">
              <button
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Giriş Yap
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Yeni Hesap Oluştur
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-bold flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3 text-xs font-medium">
                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                    Kullanıcı Adı veya E-posta
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="admin veya e-posta"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Giriş Yap</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-3 text-xs font-medium">
                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Mehmet_YKS"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                    E-posta
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="mehmet@yks.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-700 dark:text-slate-300">
                    Şifre Belirleyin
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Hesabımı Oluştur</span>
                  </button>
                </div>
              </form>
            )}

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-[11px] text-slate-500 space-y-1 border border-slate-200/60 dark:border-slate-800">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                🔑 Şifre Unutma Koruması
              </p>
              <p>
                Uygulama içinde oluşturulan tüm arkadaş hesapları üst düzey yetkili paneline kaydedilir. Şifre unutulması halinde Yönetici paneli üzerinden anında sıfırlanabilir.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
