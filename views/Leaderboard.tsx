
import React from 'react';
import { User, Submission } from '../types';
import { Card, Button } from '../components/UI';
import { calculateGrade, getGradeColor } from '../App';

interface LeaderboardProps {
  currentUser: User;
  students: User[];
  submissions: Submission[];
  onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser, students, submissions, onBack }) => {
  const leaderboardData = students.map(student => {
    const myGradedSubs = submissions.filter(s => s.student_id === student.user_id && s.status === 'graded');
    const totalMarks = myGradedSubs.reduce((sum, s) => sum + s.teacher_marks, 0);
    const avg = myGradedSubs.length > 0 ? totalMarks / myGradedSubs.length : 0;
    
    return {
      ...student,
      avg,
      count: myGradedSubs.length
    };
  }).sort((a, b) => b.avg - a.avg);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">🏆 Papan Kedudukan</h2>
          <Button variant="ghost" onClick={onBack} className="font-bold">← Kembali</Button>
        </div>

        <Card className="p-0 overflow-hidden shadow-2xl border-none ring-1 ring-slate-200">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white">
            <h3 className="text-lg font-bold opacity-80 uppercase tracking-widest">Kedudukan Keseluruhan</h3>
            <p className="text-sm">Berdasarkan purata markah bagi semua tugasan yang telah disemak.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {leaderboardData.map((student, index) => {
              const isMe = student.user_id === currentUser.user_id;
              const grade = calculateGrade(student.avg);
              
              return (
                <div key={student.id} className={`flex items-center gap-6 p-6 transition-colors ${isMe ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                  <div className="w-12 text-center">
                    {index === 0 ? <span className="text-4xl">🥇</span> : 
                     index === 1 ? <span className="text-4xl">🥈</span> : 
                     index === 2 ? <span className="text-4xl">🥉</span> : 
                     <span className="text-xl font-black text-slate-300">#{index + 1}</span>}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg ${isMe ? 'text-blue-700' : 'text-slate-900'}`}>
                      {student.name} {isMe && <span className="ml-2 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">Anda</span>}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{student.count} tugasan selesai</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-3 justify-end">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purata</p>
                        <p className="text-2xl font-black text-slate-900">{student.avg.toFixed(1)}%</p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${getGradeColor(grade)}`}>
                        {grade}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
