
import React from 'react';
import { User, Assignment, Submission, AppView } from '../types';
import { Card, Button, Badge } from '../components/UI';

interface GuruDashboardProps {
  user: User;
  assignments: Assignment[];
  submissions: Submission[];
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
  onSelectAssignment: (id: string) => void;
}

const GuruDashboard: React.FC<GuruDashboardProps> = ({ user, assignments, submissions, onLogout, onNavigate, onSelectAssignment }) => {
  const totalSubmissions = submissions.length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;
  const pendingCount = totalSubmissions - gradedCount;

  return (
    <div className="h-full bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-700">e-HisCheker Guru</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-slate-700">Halo, {user.name}</span>
            <button onClick={onLogout} className="text-sm text-red-600 font-bold hover:underline">Log Keluar</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="flex flex-col items-center justify-center py-8">
            <span className="text-slate-500 text-sm font-semibold">Jumlah Tugasan</span>
            <span className="text-4xl font-black text-slate-900 mt-1">{assignments.length}</span>
          </Card>
          <Card className="flex flex-col items-center justify-center py-8">
            <span className="text-slate-500 text-sm font-semibold">Total Hantaran</span>
            <span className="text-4xl font-black text-blue-600 mt-1">{totalSubmissions}</span>
          </Card>
          <Card className="flex flex-col items-center justify-center py-8">
            <span className="text-slate-500 text-sm font-semibold">Belum Disemak</span>
            <span className="text-4xl font-black text-amber-500 mt-1">{pendingCount}</span>
          </Card>
          <Card className="flex flex-col items-center justify-center py-8">
            <span className="text-slate-500 text-sm font-semibold">Telah Disemak</span>
            <span className="text-4xl font-black text-emerald-600 mt-1">{gradedCount}</span>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => onNavigate('create-assignment')} className="px-6 py-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Cipta Tugasan Baru
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('register-students')} className="px-6">
            Daftar Pelajar
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('view-students')} className="px-6">
            Senarai Pelajar
          </Button>
        </div>

        {/* Assignments List */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Urus Tugasan</h2>
          {assignments.length === 0 ? (
            <Card className="text-center py-16 bg-slate-50/50 border-dashed border-2">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <p className="text-slate-500 font-medium">Tiada tugasan lagi. Mulakan dengan mencipta tugasan pertama anda.</p>
                <Button onClick={() => onNavigate('create-assignment')} variant="ghost">Klik di sini untuk mula</Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assignments.map(a => {
                const subs = submissions.filter(s => s.assignment_id === a.id);
                const graded = subs.filter(s => s.status === 'graded').length;
                return (
                  <Card key={a.id} className="hover:border-blue-300 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{a.semester}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{a.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{a.description}</p>
                        <div className="flex flex-wrap gap-4 mt-3">
                          <Badge variant="info">Dicipta: {new Date(a.created_at).toLocaleDateString()}</Badge>
                          <Badge variant="default">{subs.length} Jawapan</Badge>
                          <Badge variant="success">{graded} Selesai Disemak</Badge>
                        </div>
                      </div>
                      <Button onClick={() => onSelectAssignment(a.id)}>
                        Lihat & Semak Jawapan
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GuruDashboard;
