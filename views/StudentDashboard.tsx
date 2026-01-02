
import React, { useState } from 'react';
import { User, Assignment, Submission, AppView } from '../types';
import { Card, Button, Badge } from '../components/UI';
import { calculateGrade, getGradeColor } from '../App';

interface StudentDashboardProps {
  user: User;
  assignments: Assignment[];
  submissions: Submission[];
  onLogout: () => void;
  onAnswer: (id: string) => void;
  onNavigate: (view: AppView) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, assignments, submissions, onLogout, onAnswer, onNavigate }) => {
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  
  const mySubmissions = submissions.filter(s => s.student_id === user.user_id);
  const totalMarks = mySubmissions.reduce((sum, s) => sum + (s.teacher_marks || 0), 0);
  const averageMarks = mySubmissions.length > 0 ? (totalMarks / mySubmissions.length).toFixed(1) : '0.0';
  const averageGrade = calculateGrade(parseFloat(averageMarks));

  const toggleExpand = (id: string) => {
    setExpandedSubmission(expandedSubmission === id ? null : id);
  };

  return (
    <div className="h-full bg-slate-50 pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-700 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">H</div>
            e-HisCheker
          </span>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Akaun Pelajar</p>
              <p className="text-sm font-bold text-slate-700">{user.name}</p>
            </div>
            <button onClick={onLogout} className="px-4 py-2 bg-slate-100 text-red-600 rounded-xl text-sm font-black hover:bg-red-50 transition-colors">Log Keluar</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <Card className="bg-gradient-to-br from-blue-700 to-indigo-900 text-white overflow-hidden relative shadow-2xl border-none">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left flex-1">
              <h2 className="text-4xl font-black tracking-tight">Selamat Datang, {user.name.split(' ')[0]}!</h2>
              <p className="opacity-80 mt-2 font-medium text-lg">Pemeriksaan Pintar STPM sedang aktif.</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/20 text-center min-w-[140px]">
                  <p className="text-[10px] uppercase font-black opacity-60 tracking-widest mb-1">Tugasan Selesai</p>
                  <p className="text-4xl font-black">{mySubmissions.length} / {assignments.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/20 text-center min-w-[140px]">
                  <p className="text-[10px] uppercase font-black opacity-60 tracking-widest mb-1">Purata Skor</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-4xl font-black">{averageMarks}</p>
                    <div className={`px-2 py-0.5 rounded text-xs font-black ${getGradeColor(averageGrade)}`}>
                      {averageGrade}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 relative z-10">
              <Button onClick={() => onNavigate('leaderboard')} className="bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm w-full">
                🏆 Papan Kedudukan
              </Button>
              <Button onClick={() => onNavigate('performance')} className="bg-white text-blue-700 hover:bg-slate-100 w-full">
                📊 Laporan Prestasi
              </Button>
            </div>
          </div>
        </Card>

        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            Tugasan Sejarah
          </h3>
          
          <div className="space-y-6">
            {assignments.length === 0 ? (
              <Card className="text-center py-20 bg-slate-100 border-dashed border-2">
                <p className="text-slate-400 font-bold">Tiada tugasan diterbitkan buat masa ini.</p>
              </Card>
            ) : (
              assignments.map(a => {
                const mySub = mySubmissions.find(s => s.assignment_id === a.id);
                const grade = mySub ? calculateGrade(mySub.teacher_marks) : '';
                const isExpanded = expandedSubmission === mySub?.id;

                return (
                  <Card key={a.id} className={`flex flex-col border-none shadow-xl overflow-hidden transition-all duration-300 ${mySub ? 'bg-white' : 'bg-white hover:ring-2 hover:ring-blue-500'}`}>
                    {mySub && <div className={`h-1.5 w-full ${getGradeColor(grade).split(' ')[0]}`}></div>}
                    
                    <div className="p-8 space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{a.semester}</span>
                          </div>
                          <h4 className="text-xl font-black text-slate-900 leading-tight">{a.title}</h4>
                          <p className="text-slate-500 text-sm mt-1">{a.description || 'Tiada penerangan tambahan.'}</p>
                        </div>
                        
                        {mySub ? (
                          <div className="flex items-center gap-3">
                             <div className="text-right">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Markah</p>
                               <p className="text-2xl font-black text-slate-900">{mySub.teacher_marks}/100</p>
                             </div>
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border border-slate-100 ${getGradeColor(grade)}`}>
                               {grade}
                             </div>
                          </div>
                        ) : (
                          <Badge variant="warning">Tugasan Baru</Badge>
                        )}
                      </div>

                      {mySub && (
                        <div className="space-y-4">
                          <button 
                            onClick={() => toggleExpand(mySub.id)}
                            className="w-full py-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                          >
                            {isExpanded ? 'Tutup Analisis' : 'Lihat Analisis Terperinci (Kekuatan & Kelemahan)'}
                            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                          </button>

                          {isExpanded && (
                            <div className="pt-4 space-y-8 animate-fade-in">
                              {/* Section A Feedback */}
                              <div className="space-y-4">
                                <h5 className="font-black text-blue-800 text-sm uppercase tracking-widest flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  Analisis Bahagian A (Struktur)
                                </h5>
                                {a.section_a_questions.map((q, idx) => (
                                  <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
                                    <p className="text-xs font-bold text-slate-500">Soalan {idx + 1}: {q}</p>
                                    <div className="bg-white p-4 rounded-xl text-sm text-slate-700 border border-slate-100 italic">
                                      Jawapan Anda: {mySub.answers_a[idx]}
                                    </div>
                                    <div className="flex gap-2 items-start mt-2">
                                      <div className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded mt-0.5">AI</div>
                                      <div className="flex-1 text-sm text-indigo-900 leading-relaxed font-medium">
                                        {mySub.ai_comments_a?.[idx] || "Tiada ulasan terperinci tersedia."}
                                      </div>
                                      <div className="text-xs font-black text-indigo-400 whitespace-nowrap">Skor: {mySub.marks_a?.[idx] || 0}/4</div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Section B Feedback */}
                              <div className="space-y-4">
                                <h5 className="font-black text-indigo-800 text-sm uppercase tracking-widest flex items-center gap-2">
                                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                  Analisis Bahagian B (Esei)
                                </h5>
                                {a.section_b_questions.map((q, idx) => (
                                  <div key={idx} className="bg-indigo-50/30 rounded-2xl p-6 border border-indigo-100 space-y-4">
                                    <p className="text-xs font-bold text-indigo-600">Esei {idx + 1}: {q}</p>
                                    <div className="bg-white p-4 rounded-xl text-sm text-slate-700 border border-slate-100 max-h-40 overflow-y-auto no-scrollbar">
                                      {mySub.answers_b[idx]}
                                    </div>
                                    <div className="p-4 bg-white rounded-xl border border-indigo-100 space-y-3 shadow-sm">
                                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Komen Menulis AI:</p>
                                      <p className="text-sm text-slate-700 leading-relaxed">
                                        {mySub.ai_comments_b?.[idx] || "AI sedang menganalisis gaya penulisan anda..."}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                <h6 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">Maklum Balas Keseluruhan</h6>
                                <p className="text-sm text-emerald-900 leading-relaxed italic">"{mySub.teacher_feedback}"</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {!mySub && (
                        <Button onClick={() => onAnswer(a.id)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 rounded-2xl text-lg font-black transition-all">
                          Jawab & Semak AI
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
