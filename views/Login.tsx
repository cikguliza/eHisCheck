
import React, { useState } from 'react';
import { User } from '../types';
import { Card, Input, Button } from '../components/UI';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Default Guru Account
    if (userId === 'guru1' && password === 'guru123') {
      onLogin({
        id: 'guru-1',
        user_id: 'guru1',
        name: 'Cikgu Sejarah',
        role: 'guru',
        password: 'guru123',
        created_at: new Date().toISOString()
      });
      return;
    }

    const found = users.find(u => u.user_id === userId && u.password === password);
    if (found) {
      onLogin(found);
    } else {
      alert('ID Pengguna atau Kata Laluan salah');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800">
      <Card className="w-full max-w-md p-10 animate-fade-in shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl mb-4 shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">e-HisCheker STPM</h1>
          <p className="text-slate-500 mt-2 font-medium">Sistem Penilaian Pintar Sejarah</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="ID Pengguna" 
            placeholder="Masukkan ID anda" 
            value={userId} 
            onChange={(e) => setUserId(e.target.value)}
            required 
          />
          <Input 
            label="Kata Laluan" 
            type="password" 
            placeholder="Masukkan kata laluan" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          
          <Button type="submit" className="w-full py-3.5 text-lg">Log Masuk</Button>

          <div className="pt-4 mt-6 border-t border-slate-100">
            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 space-y-2">
              <p className="font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" /></svg>
                Maklumat Akses:
              </p>
              <p>Sila log masuk menggunakan ID dan Kata Laluan yang telah didaftarkan.</p>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
