import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Key, Trash2, Search, X, Check, AlertCircle } from 'lucide-react';
import { UserAccount } from '../types';
import { storage } from '../utils/helpers';

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
}

export const AdminUsersModal: React.FC<AdminUsersModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => storage.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [msg, setMsg] = useState('');

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'ekicia926@gmail.com' || currentUser?.username === 'admin';

  const handleResetPassword = (userId: string) => {
    if (!newPasswordInput) return;
    const updated = users.map((u) =>
      u.id === userId ? { ...u, passwordHash: newPasswordInput } : u
    );
    setUsers(updated);
    storage.saveUsers(updated);
    setEditingUserId(null);
    setNewPasswordInput('');
    setMsg('Şifre başarıyla güncellendi!');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('Kendi admin hesabınızı silemezsiniz!');
      return;
    }
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    storage.saveUsers(updated);
    setMsg('Kullanıcı hesabı silindi.');
    setTimeout(() => setMsg(''), 3000);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
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
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Üst Düzey Yetkili Paneli
                </h3>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full border border-amber-300/50">
                  Süper Yönetici
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sistemdeki tüm arkadaş hesaplarını görün ve şifre unutma vakalarında şifreleri anında sıfırlayın.
              </p>
            </div>
          </div>
        </div>

        {!isAdmin ? (
          <div className="p-6 text-center space-y-3 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h4 className="font-extrabold text-red-700 dark:text-red-300 text-sm">
              Erişim Yetkisi Bulunmuyor
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Bu panele yalnızca üst düzey yetkili (ekicia926@gmail.com / admin) hesabıyla giriş yapıldığında erişilebilir.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {msg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>{msg}</span>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Kullanıcı adı veya e-posta ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold outline-none"
              />
            </div>

            {/* User Accounts List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Kayıtlı kullanıcı bulunamadı.
                </div>
              ) : (
                filteredUsers.map((usr) => (
                  <div
                    key={usr.id}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                          {usr.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {usr.username}
                            </span>
                            {usr.role === 'admin' && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                YETKİLİ
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            {usr.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingUserId(usr.id);
                            setNewPasswordInput(usr.passwordHash);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 flex items-center space-x-1"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Şifre Değiştir</span>
                        </button>

                        {usr.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                            title="Hesabı Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Show current password hash info & Inline Password Reset Editor */}
                    <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                      <span>Mevcut Şifre: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{usr.passwordHash}</strong></span>
                      <span>Kayıt Tarihi: {usr.createdAt}</span>
                    </div>

                    {editingUserId === usr.id && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2 mt-2">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {usr.username} İçin Yeni Şifre Belirle:
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono outline-none"
                          />
                          <button
                            onClick={() => handleResetPassword(usr.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                          >
                            Kaydet
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
