
import React, { useState } from 'react';
import { User, Assignment, Submission } from '../types';
import { Card, Input, Button } from '../components/UI';
import { geminiService } from '../services/geminiService';

interface AnswerAssignmentProps {
  user: User;
  assignment: Assignment;
  onSubmit: (submission: Submission) => void;
  onCancel: () => void;
}

const AnswerAssignment: React.FC<AnswerAssignmentProps> = ({ user, assignment, onSubmit, onCancel }) => {
  const [answersA, setAnswersA] = useState<string[]>(new Array(assignment.section_a_questions.length).fill(''));
  const [answersB, setAnswersB] = useState<string[]>(new Array(assignment.section_b_questions.length).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleUpdateAnswerA = (index: number, value: string) => {
    const updated = [...answersA];
    updated[index] = value;
    setAnswersA(updated);
  };

  const handleUpdateAnswerB = (index: number, value: string) => {
    const updated = [...answersB];
    updated[index] = value;
    setAnswersB(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('Menghantar jawapan...');

    try {
      setStatusMessage('AI sedang menyemak Bahagian A (Struktur)...');
      const structResult = await geminiService.gradeGranularStructural(
        assignment.section_a_questions,
        answersA
      );

      setStatusMessage('AI sedang menyemak Bahagian B (Esei) mengikut Rubrik STPM...');
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
        status: 'submitted', // Still 'submitted' because teacher hasn't verified, but has AI marks
        teacher_marks: totalAiMarks, // Preliminary marks from AI
        teacher_feedback: `[Semakan Automatik AI]: ${structResult.overallFeedback} ${essayResult.overallFeedback}`,
        ai_suggested_marks: totalAiMarks,
        ai_feedback: essayResult.overallFeedback
      };

      onSubmit(sub);
    } catch (error) {
      console.error("AI Grading failed:", error);
      // Fallback submission if AI fails
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
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-24 h-24 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-8"></div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Pemeriksaan Pintar Sedang Berjalan</h2>
        <p className="text-slate-500 font-medium animate-pulse">{statusMessage}</p>
        <div className="mt-8 max-w-sm text-center">
          <p className="text-xs text-slate-400 leading-relaxed uppercase tracking-widest font-bold">Sila jangan tutup pelayar anda. AI kami sedang menganalisis fakta, taakulan, dan gaya komunikasi anda berdasarkan Rubrik STPM.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">{assignment.title}</h2>
            <p className="text-slate-500 text-sm">Lengkapkan semua soalan untuk menerima skor AI segera.</p>
          </div>
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>Batal</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
          <Card className="space-y-6 border-l-4 border-blue-600 shadow-lg">
            <div className="border-b pb-4">
              <h3 className="text-xl font-bold text-blue-800">Bahagian A: Struktur (20 Markah)</h3>
              <p className="text-sm text-slate-500 mt-1">Jawab semua soalan pendek berikut.</p>
            </div>
            
            <div className="space-y-8">
              {assignment.section_a_questions.map((q, idx) => (
                <div key={idx} className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-800 font-bold flex gap-2">
                    <span className="text-blue-600">{idx + 1}.</span>
                    <span>{q}</span>
                  </p>
                  <Input 
                    placeholder={`Taip jawapan anda untuk soalan ${idx + 1}...`}
                    multiline 
                    rows={4} 
                    value={answersA[idx]} 
                    onChange={(e) => handleUpdateAnswerA(idx, e.target.value)} 
                    required 
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-6 border-l-4 border-indigo-600 shadow-lg">
            <div className="border-b pb-4">
              <h3 className="text-xl font-bold text-indigo-800">Bahagian B: Esei ({assignment.section_b_questions.length * 20} Markah)</h3>
              <p className="text-sm text-slate-500 mt-1">AI akan menyemak esei anda berdasarkan kriteria Pengetahuan, Taakulan, dan Komunikasi.</p>
            </div>

            <div className="space-y-10">
              {assignment.section_b_questions.map((q, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-indigo-900 font-bold flex gap-2">
                      <span className="text-indigo-600 uppercase tracking-wider">Esei {idx + 1}:</span>
                      <span>{q}</span>
                    </p>
                  </div>
                  <Input 
                    label="Ruangan Jawapan Esei:"
                    placeholder={`Tulis esei anda untuk soalan ${idx + 1} dengan mendalam...`}
                    multiline 
                    rows={15} 
                    value={answersB[idx]} 
                    onChange={(e) => handleUpdateAnswerB(idx, e.target.value)} 
                    required 
                  />
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end gap-4 sticky bottom-6 bg-white/90 backdrop-blur-md p-5 border rounded-3xl shadow-2xl z-20">
            <Button variant="ghost" onClick={onCancel} className="px-8" disabled={isSubmitting}>Batal</Button>
            <Button type="submit" className="px-12 py-4 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" disabled={isSubmitting}>
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Hantar & Terima Skor AI
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnswerAssignment;
