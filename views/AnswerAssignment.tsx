
import React, { useState, useEffect, useCallback } from 'react';
import { User, Assignment, Submission } from '../types';
import { Card, Input, Button } from '../components/UI';
import { geminiService } from '../services/geminiService';

interface AnswerAssignmentProps {
  user: User;
  assignment: Assignment;
  onSubmit: (submission: Submission) => void;
  onCancel: () => void;
}

type Step = 'A' | number; // 'A' for Section A, index for Section B questions

const AnswerAssignment: React.FC<AnswerAssignmentProps> = ({ user, assignment, onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<Step>('A');
  const [answersA, setAnswersA] = useState<string[]>(new Array(assignment.section_a_questions.length).fill(''));
  const [answersB, setAnswersB] = useState<string[]>(new Array(assignment.section_b_questions.length).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Timer State (in seconds)
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes = 1800s

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Prevent Copy/Paste/Right-click logic
  const preventActions = (e: React.SyntheticEvent) => {
    e.preventDefault();
    alert("Amaran: Fungsi salin, tampal dan klik kanan dimatikan semasa peperiksaan.");
  };

  const finishExam = useCallback(async () => {
    setIsSubmitting(true);
    setStatusMessage('Menghantar jawapan akhir...');

    try {
      setStatusMessage('AI sedang menyemak Bahagian A...');
      const structResult = await geminiService.gradeGranularStructural(
        assignment.section_a_questions,
        answersA
      );

      setStatusMessage('AI sedang menyemak Bahagian B...');
      const essayResult = await geminiService.gradeGranularEssay(
        assignment.section_b_questions,
        answersB
      );

      const totalAiMarks = structResult.scores.reduce((a, b) => a + b, 0) + essayResult.scores.reduce((a, b) => a + b, 0);

      const sub: Submission = {
        id: `sub_${Date.now()}`,
        assignment_id: assignment.id,
        student_id: user.user_id,
        name: user.name,
        answers_a: answersA,
        answers_b: answersB,
        marks_a: structResult.scores,
        marks_b: essayResult.scores,
        ai_comments_a: structResult.comments,
        ai_comments_b: essayResult.comments,
        submitted_at: new Date().toISOString(),
        status: 'submitted',
        teacher_marks: totalAiMarks,
        teacher_feedback: `[Semakan Automatik AI]: ${structResult.overallFeedback} ${essayResult.overallFeedback}`,
        ai_suggested_marks: totalAiMarks,
        ai_feedback: essayResult.overallFeedback
      };

      onSubmit(sub);
    } catch (error) {
      console.error("AI Grading failed:", error);
      const fallbackSub: Submission = {
        id: `sub_${Date.now()}`,
        assignment_id: assignment.id,
        student_id: user.user_id,
        name: user.name,
        answers_a: answersA,
        answers_b: answersB,
        submitted_at: new Date().toISOString(),
        status: 'submitted',
        teacher_marks: 0,
        teacher_feedback: 'AI gagal menyemak buat masa ini. Sila tunggu semakan manual daripada guru.'
      };
      onSubmit(fallbackSub);
    } finally {
      setIsSubmitting(false);
    }
  }, [assignment, answersA, answersB, user, onSubmit]);

  const handleNext = () => {
    if (currentStep === 'A') {
      setCurrentStep(0);
      setTimeLeft(1800); // Reset timer for first essay
    } else {
      const nextIdx = (currentStep as number) + 1;
      if (nextIdx < assignment.section_b_questions.length) {
        setCurrentStep(nextIdx);
        setTimeLeft(1800); // Reset timer for next essay
      } else {
        finishExam();
      }
    }
  };

  // Timer Effect
  useEffect(() => {
    if (isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, isSubmitting]);

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-24 h-24 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-8"></div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Penilaian Pintar Berjalan</h2>
        <p className="text-slate-500 font-medium animate-pulse">{statusMessage}</p>
      </div>
    );
  }

  return (
    <div 
      className="p-6 bg-slate-50 min-h-screen select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Exam Header & Timer */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md p-4 border rounded-2xl shadow-lg flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl font-black text-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-600 text-white'}`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peringkat Sekarang</p>
              <h4 className="font-bold text-slate-900">
                {currentStep === 'A' ? 'Bahagian A: Soalan Struktur' : `Bahagian B: Soalan Esei ${(currentStep as number) + 1}`}
              </h4>
            </div>
          </div>
          <div className="text-right">
             <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-tighter">
                {currentStep === 'A' ? `Soalan 1-5` : `Esei ${(currentStep as number) + 1} dari ${assignment.section_b_questions.length}`}
             </span>
          </div>
        </div>

        {/* Section A Content */}
        {currentStep === 'A' && (
          <div className="space-y-8 animate-fade-in">
            <Card className="border-l-4 border-blue-600 shadow-xl">
              <h3 className="text-xl font-bold text-blue-800 border-b pb-4 mb-6">Bahagian A: Struktur (20 Markah)</h3>
              <div className="space-y-10">
                {assignment.section_a_questions.map((q, idx) => (
                  <div key={idx} className="space-y-4">
                    <p className="font-bold text-slate-800 leading-relaxed"><span className="text-blue-600 mr-2">{idx+1}.</span>{q}</p>
                    <textarea
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 bg-slate-50 font-medium"
                      placeholder="Taip jawapan anda di sini..."
                      value={answersA[idx]}
                      onChange={(e) => {
                        const newA = [...answersA];
                        newA[idx] = e.target.value;
                        setAnswersA(newA);
                      }}
                      onPaste={preventActions}
                      onCopy={preventActions}
                      onCut={preventActions}
                    />
                  </div>
                ))}
              </div>
            </Card>
            <div className="flex justify-end">
              <Button onClick={handleNext} className="px-10 py-4 text-lg">Hantar Bahagian A & Mula Esei →</Button>
            </div>
          </div>
        )}

        {/* Section B Content (Step-by-step) */}
        {typeof currentStep === 'number' && (
          <div className="animate-fade-in">
            <Card className="border-l-4 border-indigo-600 shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-indigo-800 border-b pb-4">Bahagian B: Soalan Esei (20 Markah)</h3>
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                <p className="text-indigo-900 font-black text-lg leading-relaxed">
                  {assignment.section_b_questions[currentStep]}
                </p>
              </div>
              <textarea
                className="w-full px-6 py-5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-[500px] bg-slate-50 font-medium text-lg"
                placeholder="Tulis esei anda dengan mendalam. Pastikan anda menggunakan fakta, hujah dan kesimpulan yang jelas..."
                value={answersB[currentStep]}
                onChange={(e) => {
                  const newB = [...answersB];
                  newB[currentStep] = e.target.value;
                  setAnswersB(newB);
                }}
                onPaste={preventActions}
                onCopy={preventActions}
                onCut={preventActions}
              />
            </Card>
            <div className="flex justify-end mt-8">
              <Button onClick={handleNext} className="px-12 py-4 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100">
                {currentStep === assignment.section_b_questions.length - 1 ? 'Selesaikan & Hantar Peperiksaan' : 'Simpan & Ke Esei Seterusnya →'}
              </Button>
            </div>
          </div>
        )}

        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 mt-10">
          <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-2">
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" /></svg>
             Peraturan Peperiksaan:
          </p>
          <ul className="text-xs text-amber-800 font-medium list-disc ml-5 space-y-1">
            <li>Pemasa akan berjalan secara automatik. Sila peka dengan baki masa yang ada.</li>
            <li>Fungsi klik kanan, salin dan tampal adalah dilarang sama sekali.</li>
            <li>Jika masa tamat, jawapan anda akan disimpan dan dihantar secara automatik.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnswerAssignment;
