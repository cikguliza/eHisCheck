
import React, { useState, useEffect } from 'react';
import { User, Assignment, Submission, AppView } from './types';
import { Toast, Badge } from './components/UI';
import Login from './views/Login';
import GuruDashboard from './views/GuruDashboard';
import StudentDashboard from './views/StudentDashboard';
import CreateAssignment from './views/CreateAssignment';
import AnswerAssignment from './views/AnswerAssignment';
import GradeSubmission from './views/GradeSubmission';
import StudentList from './views/StudentList';
import RegisterStudents from './views/RegisterStudents';
import Leaderboard from './views/Leaderboard';
import PerformanceReport from './views/PerformanceReport';

// Import DB services
import { 
  subscribeToUsers, 
  subscribeToAssignments, 
  subscribeToSubmissions,
  addUser,
  deleteUser,
  addAssignment,
  addSubmission,
  updateSubmission,
  deleteSubmissionsByStudentId
} from './services/db';

// Global grading utility - Official STPM Scale (Verified Exact Ranges)
export const calculateGrade = (marks: number): string => {
  // A Range
  if (marks >= 80) return 'A';   // 80-100
  if (marks >= 75) return 'A-';  // 75-79
  
  // B Range
  if (marks >= 70) return 'B+';  // 70-74
  if (marks >= 65) return 'B';   // 65-69
  if (marks >= 60) return 'B-';  // 60-64
  
  // C Range
  if (marks >= 50) return 'C+';  // 50-59 (Note: 10 mark range)
  if (marks >= 40) return 'C';   // 40-49 (Note: 10 mark range)
  if (marks >= 35) return 'C-';  // 35-39 (Note: 5 mark range)
  
  // D Range
  if (marks >= 30) return 'D+';  // 30-34
  if (marks >= 24) return 'D';   // 24-29
  
  // Fail
  return 'F';                    // 0-23
};

export const getGradeColor = (grade: string): string => {
  if (grade === 'A' || grade === 'A-') return 'bg-emerald-500 text-white';
  if (grade.startsWith('B')) return 'bg-blue-500 text-white';
  if (grade.startsWith('C')) return 'bg-amber-500 text-white';
  if (grade.startsWith('D')) return 'bg-orange-500 text-white';
  return 'bg-red-500 text-white';
};

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState<AppView | null>(null);

  // Firestore Real-time Subscriptions
  useEffect(() => {
    const unsubscribeUsers = subscribeToUsers((data) => {
      setUsers(data);
    });

    const unsubscribeAssignments = subscribeToAssignments((data) => {
      setAssignments(data);
    });

    const unsubscribeSubmissions = subscribeToSubmissions((data) => {
      setSubmissions(data);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeUsers();
      unsubscribeAssignments();
      unsubscribeSubmissions();
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    setSelectedStudentId(null);
    showToast('Log keluar berjaya', 'success');
  };

  const navigateTo = (view: AppView) => {
    setPreviousView(currentView);
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const handleDeleteUser = async (studentId: string) => {
    // Ensure we are targeting the right user
    const targetId = String(studentId).trim();
    const userToDelete = users.find(u => u.user_id === targetId);
    
    if (!userToDelete) {
        showToast('Pengguna tidak dijumpai', 'error');
        return;
    }

    const confirmMessage = `ADAKAH ANDA PASTI?\n\nMemadam pelajar: ${userToDelete.name}\nID: ${userToDelete.user_id}\n\nSemua data tugasan dan markah akan hilang kekal dari pangkalan data.`;

    if (window.confirm(confirmMessage)) {
      try {
        await deleteUser(targetId);
        await deleteSubmissionsByStudentId(targetId, submissions);
        showToast(`Pelajar ${userToDelete.name} telah dipadam dari pangkalan data.`, 'success');
      } catch (error) {
        console.error("Gagal memadam pengguna:", error);
        showToast("Gagal memadam pengguna. Sila cuba lagi.", "error");
      }
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <Login 
            users={users} 
            onLogin={(user) => {
              setCurrentUser(user);
              setCurrentView(user.role === 'guru' ? 'guru-dashboard' : 'student-dashboard');
              showToast(`Selamat datang, ${user.name}!`, 'success');
            }} 
          />
        );
      case 'guru-dashboard':
        return currentUser ? (
          <GuruDashboard 
            user={currentUser} 
            assignments={assignments} 
            submissions={submissions}
            onLogout={handleLogout}
            onNavigate={navigateTo}
            onSelectAssignment={(id) => {
              setSelectedAssignmentId(id);
              navigateTo('view-submissions');
            }}
          />
        ) : null;
      case 'student-dashboard':
        return currentUser ? (
          <StudentDashboard 
            user={currentUser} 
            assignments={assignments} 
            submissions={submissions}
            onLogout={handleLogout}
            onAnswer={(id) => {
              setSelectedAssignmentId(id);
              navigateTo('answer-assignment');
            }}
            onNavigate={navigateTo}
          />
        ) : null;
      case 'create-assignment':
        return currentUser ? (
          <CreateAssignment 
            user={currentUser}
            onCancel={() => navigateTo('guru-dashboard')}
            onCreate={async (newAssignment) => {
              // Simpan ke Firestore
              await addAssignment(newAssignment);
              showToast('Tugasan berjaya dicipta!', 'success');
              navigateTo('guru-dashboard');
            }}
          />
        ) : null;
      case 'answer-assignment':
        const assignmentToAnswer = assignments.find(a => a.id === selectedAssignmentId);
        return currentUser && assignmentToAnswer ? (
          <AnswerAssignment 
            user={currentUser}
            assignment={assignmentToAnswer}
            onCancel={() => navigateTo('student-dashboard')}
            onSubmit={async (submission) => {
              // Simpan ke Firestore
              await addSubmission(submission);
              showToast('Jawapan berjaya dihantar!', 'success');
              navigateTo('student-dashboard');
            }}
          />
        ) : null;
      case 'view-submissions':
        const selectedAssign = assignments.find(a => a.id === selectedAssignmentId);
        const allStudents = users.filter(u => u.role === 'pelajar').sort((a, b) => {
           if ((a.class_name || '') < (b.class_name || '')) return -1;
           if ((a.class_name || '') > (b.class_name || '')) return 1;
           return a.name.localeCompare(b.name);
        });
        
        const assignmentSubmissions = submissions.filter(s => s.assignment_id === selectedAssignmentId);
        const submittedCount = assignmentSubmissions.length;
        const totalStudents = allStudents.length;
        const completionRate = totalStudents > 0 ? (submittedCount / totalStudents) * 100 : 0;

        return currentUser && selectedAssign ? (
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Status Tugasan: {selectedAssign.title}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-slate-500 font-medium">Kadar Penghantaran:</span>
                  <div className="flex items-center gap-2">
                     <span className="text-blue-600 font-black text-lg">{submittedCount}/{totalStudents}</span>
                     <span className="text-xs font-bold text-slate-400 uppercase">Pelajar</span>
                  </div>
                </div>
              </div>
              <button onClick={() => navigateTo('guru-dashboard')} className="text-blue-600 font-semibold hover:underline">← Kembali ke Dashboard</button>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
               <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${completionRate}%` }}></div>
            </div>

            <div className="grid gap-4">
              {allStudents.map(student => {
                const sub = assignmentSubmissions.find(s => s.student_id === student.user_id);
                const grade = sub ? calculateGrade(sub.teacher_marks) : '-';
                const gradeColor = sub ? getGradeColor(grade) : 'bg-slate-100';

                return (
                  <div key={student.id} className={`p-4 border rounded-xl flex flex-col md:flex-row justify-between items-center shadow-sm hover:shadow-md transition-shadow ${sub ? 'bg-white border-slate-200' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${sub ? (sub.status === 'graded' ? gradeColor : 'bg-amber-100 text-amber-600') : 'bg-white text-slate-300 border-2 border-dashed border-slate-200'}`}>
                        {sub ? (sub.status === 'graded' ? grade : '⏳') : 'X'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{student.name}</h4>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">{student.class_name || 'Tiada Kelas'}</span>
                          <span className="text-slate-400">{student.user_id}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                      {sub ? (
                        <>
                          <div className="text-right mr-2 hidden sm:block">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tarikh Hantar</p>
                            <p className="text-xs font-bold text-slate-700">{new Date(sub.submitted_at).toLocaleDateString()}</p>
                          </div>
                          {sub.status === 'graded' ? <Badge variant="success">Gred: {sub.teacher_marks}</Badge> : <Badge variant="warning">Menunggu Semakan</Badge>}
                          <button 
                            onClick={() => {
                              setSelectedSubmissionId(sub.id);
                              navigateTo('grade-submission');
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            {sub.status === 'graded' ? 'Edit Markah' : 'Semak Jawapan'}
                          </button>
                        </>
                      ) : (
                        <>
                          <Badge variant="danger" className="bg-red-100 text-red-600">Tiada Penghantaran</Badge>
                          <button 
                            disabled
                            className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-bold cursor-not-allowed"
                          >
                            Semak Jawapan
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => {
                           setSelectedStudentId(student.user_id);
                           navigateTo('performance');
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat Prestasi Pelajar"
                      >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null;
      case 'grade-submission':
        const subToGrade = submissions.find(s => s.id === selectedSubmissionId);
        const assignForSub = assignments.find(a => a.id === subToGrade?.assignment_id);
        return currentUser && subToGrade && assignForSub ? (
          <GradeSubmission 
            submission={subToGrade}
            assignment={assignForSub}
            onCancel={() => navigateTo('view-submissions')}
            onUpdate={async (updatedSub) => {
              // Kemaskini Firestore
              await updateSubmission(updatedSub);
              showToast('Penilaian disimpan ke database!', 'success');
              navigateTo('view-submissions');
            }}
          />
        ) : null;
      case 'register-students':
        return (
          <RegisterStudents 
            existingStudents={users.filter(u => u.role === 'pelajar')}
            onCancel={() => navigateTo('guru-dashboard')}
            onRegister={async (newStudents) => {
              // Tambah ke Firestore secara pukal (loop)
              const promises = newStudents.map(s => addUser(s));
              await Promise.all(promises);
              
              showToast(`${newStudents.length} pelajar berjaya didaftarkan ke database!`, 'success');
              navigateTo('view-students');
            }}
          />
        );
      case 'view-students':
        return (
          <StudentList 
            students={users.filter(u => u.role === 'pelajar')}
            submissions={submissions}
            onBack={() => navigateTo('guru-dashboard')}
            onAdd={() => navigateTo('register-students')}
            onViewReport={(studentId) => {
              setSelectedStudentId(studentId);
              navigateTo('performance');
            }}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'leaderboard':
        return currentUser ? (
          <Leaderboard 
            currentUser={currentUser}
            students={users.filter(u => u.role === 'pelajar')}
            submissions={submissions}
            onBack={() => navigateTo('student-dashboard')}
          />
        ) : null;
      case 'performance':
        const targetUser = selectedStudentId 
          ? users.find(u => u.user_id === selectedStudentId) 
          : currentUser;
        
        return targetUser ? (
          <PerformanceReport 
            user={targetUser}
            isGuruView={currentUser?.role === 'guru'}
            assignments={assignments}
            submissions={submissions}
            onBack={() => {
              if (currentUser?.role === 'guru') {
                if (previousView === 'view-submissions') {
                   navigateTo('view-submissions');
                } else {
                   setSelectedStudentId(null);
                   navigateTo('view-students');
                }
              } else {
                navigateTo('student-dashboard');
              }
            }}
          />
        ) : null;
      default:
        return <div>View not implemented: {currentView}</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {renderView()}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
