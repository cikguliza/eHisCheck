
import React from 'react';
import { User, Submission } from '../types';
import { Card, Button, Badge } from '../components/UI';
import { calculateGrade, getGradeColor } from '../App';

interface StudentListProps {
  students: User[];
  submissions: Submission[];
  onBack: () => void;
  onAdd: () => void;
  onViewReport: (studentId: string) => void;
  onDeleteUser: (studentId: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, submissions, onBack, onAdd, onViewReport, onDeleteUser }) => {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Senarai Pelajar</h2>
            <p className="text-slate-500 font-medium">Total: {students.length} pelajar berdaftar</p>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={onBack} className="font-bold">← Dashboard</Button>
            <Button onClick={onAdd} className="font-bold bg-blue-600 text-white">Daftar Pelajar Baru</Button>
          </div>
        </div>

        <Card className="p-0 overflow-hidden border-slate-200 shadow-xl rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Bil</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Nama Pelajar</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Kelas</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">ID / Password</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status Aktiviti</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Purata Gred</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s, idx) => {
                  const mySubs = submissions.filter(sub => sub.student_id === s.user_id && sub.status === 'graded');
                  const avgValue = mySubs.length > 0 ? (mySubs.reduce((acc, curr) => acc + curr.teacher_marks, 0) / mySubs.length) : null;
                  const grade = avgValue !== null ? calculateGrade(avgValue) : '-';
                  const gradeColor = avgValue !== null ? getGradeColor(grade) : 'bg-slate-100 text-slate-400';
                  
                  return (
                    <tr key={s.id || s.user_id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{s.name}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black border border-slate-200">
                          {s.class_name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-mono font-black text-blue-700 border border-slate-200">{s.user_id}</code>
                      </td>
                      <td className="px-6 py-4">
                        {submissions.some(sub => sub.student_id === s.user_id) ? (
                          <Badge variant="success">Aktif</Badge>
                        ) : (
                          <Badge variant="default">Belum Mula</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${gradeColor}`}>
                            {grade}
                          </div>
                          {avgValue !== null && (
                            <span className="text-[10px] font-black text-slate-400 uppercase">{avgValue.toFixed(1)}%</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => onViewReport(s.user_id)}
                            className="text-xs py-1.5"
                          >
                            Lihat Prestasi
                          </Button>
                          
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteUser(s.user_id);
                            }}
                            className="text-xs py-1.5 px-3"
                          >
                            PADAM
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentList;
