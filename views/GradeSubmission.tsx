
import React, { useState, useEffect } from 'react';
import { Assignment, Submission } from '../types';
import { Card, Input, Button, Badge } from '../components/UI';
import { geminiService, EssayRubricBreakdown } from '../services/geminiService';
import { calculateGrade, getGradeColor } from '../App';

interface GradeSubmissionProps {
  submission: Submission;
  assignment: Assignment;
  onUpdate: (submission: Submission) => void;
  onCancel: () => void;
}

const GradeSubmission: React.FC<GradeSubmissionProps> = ({ submission, assignment, onUpdate, onCancel }) => {
  const [marksA, setMarksA] = useState<number[]>(
    submission.marks_a || new Array(assignment.section_a_questions.length).fill(0)
  );
  const [marksB, setMarksB] = useState<number[]>(
    submission.marks_b || new Array(assignment.section_b_questions.length).fill(0)
  );
  
  const [aiMarksA, setAiMarksA] = useState<number[]>(submission.marks_a || []);
  const [aiMarksB, setAiMarksB] = useState<number[]>(submission.marks_b || []);
  
  const [aiCommentsA, setAiCommentsA] = useState<string[]>(submission.ai_comments_a || []);
  const [aiCommentsB, setAiCommentsB] = useState<string[]>(submission.ai_comments_b || []);
  const [rubricBreakdowns, setRubricBreakdowns] = useState<EssayRubricBreakdown[]>(submission.ai_feedback ? [] : []);
  
  const [totalMarks, setTotalMarks] = useState(submission.teacher_marks || 0);
  const [feedback, setFeedback] = useState(submission.teacher_feedback);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const sumA = marksA.reduce((a, b) => a + b, 0);
    const sumB = marksB.reduce((a, b) => a + b, 0);
    setTotalMarks(sumA + sumB);
  }, [marksA, marksB]);

  const handleAiGrade = async () => {
    setIsAiLoading(true);
    try {
        const structResult = await geminiService.gradeGranularStructural(
          assignment.section_a_questions, 
          submission.answers_a
        );
        const essayResult = await geminiService.gradeGranularEssay(
          assignment.section_b_questions, 
          submission.answers_b
        );
        
        setMarksA(structResult.scores);
        setMarksB(essayResult.scores);
        setAiMarksA(structResult.scores);
        setAiMarksB(essayResult.scores);
        
        setAiCommentsA(structResult.comments);
        setAiCommentsB(essayResult.comments);
        setRubricBreakdowns(essayResult.rubricBreakdowns || []);
        
        const newAiFeedback = `[Ringkasan AI]\n${structResult.overallFeedback}\n\n${essayResult.overallFeedback}`;
        setFeedback(prev => prev ? `${prev}\n\n${newAiFeedback}` : newAiFeedback);
    } catch (e) {
        console.error(e);
        alert("Gagal menjana analisis AI. Sila cuba sebentar lagi.");
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleSave = () => {
    onUpdate({
      ...submission,
      status: 'graded',
      teacher_marks: totalMarks,
      teacher_feedback: feedback,
      marks_a: marksA,
      marks_b: marksB,
      ai_comments_a: aiCommentsA,
      ai_comments_b: aiCommentsB,
      ai_suggested_marks: aiMarksA.reduce((a,b)=>a+b,0) + aiMarksB.reduce((a,b)=>a+b,0)
    });
  };

  const currentGrade = calculateGrade(totalMarks);
  const gradeColor = getGradeColor(currentGrade);

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Pemeriksaan & Penilaian Guru</h2>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
              Pelajar: {submission.name} • Tugasan: {assignment.title}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" onClick={onCancel}>Batal</Button>
            <Button 
                variant="secondary" 
                onClick={handleAiGrade} 
                disabled={isAiLoading}
                className="hover:shadow-md"
            >
              {isAiLoading ? (
                <span className="flex items-center gap-2">
                   <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Menjana Analisis AI...
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Regenerasi Analisis AI
                </>
              )}
            </Button>
            <Button onClick={handleSave} variant="primary" className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100">
              Sahkan Penilaian
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-blue-800 uppercase tracking-tighter">Bahagian A: Soalan Struktur</h3>
                <Badge variant="info">Jumlah Markah: {marksA.reduce((a,b)=>a+b,0)}/20</Badge>
              </div>
              {assignment.section_a_questions.map((q, idx) => (
                <Card key={idx} className="space-y-4 border-l-4 border-blue-400">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 mb-2"><span className="text-blue-600 font-black">{idx+1}.</span> {q}</p>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                        {submission.answers_a[idx] || "(Tiada jawapan dihantar)"}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl border border-blue-700 shadow-sm">
                        <label className="text-[10px] font-black text-blue-100 uppercase mr-1">Markah Guru</label>
                        <input 
                          type="number" min="0" max="4" step="0.5"
                          value={marksA[idx]}
                          onChange={(e) => {
                            const newM = [...marksA];
                            newM[idx] = parseFloat(e.target.value) || 0;
                            setMarksA(newM);
                          }}
                          className="w-12 bg-white rounded-md font-black text-center text-blue-700 outline-none p-1"
                        />
                        <span className="text-xs font-bold text-blue-100">/ 4</span>
                      </div>
                      {aiMarksA[idx] !== undefined && (
                        <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          Saranan AI: {aiMarksA[idx]}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-indigo-800 uppercase tracking-tighter">Bahagian B: Soalan Esei</h3>
                <Badge variant="success">Jumlah Markah: {marksB.reduce((a,b)=>a+b,0)}/{assignment.section_b_questions.length*20}</Badge>
              </div>
              {assignment.section_b_questions.map((q, idx) => (
                <Card key={idx} className="space-y-4 border-l-4 border-indigo-400">
                  <div className="bg-indigo-50 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Soalan Esei {idx+1}</p>
                      <p className="text-sm font-bold text-indigo-900 leading-tight">{q}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-xl border border-indigo-700 shadow-sm">
                        <label className="text-[10px] font-black text-indigo-100 uppercase mr-1">Markah Guru</label>
                        <input 
                          type="number" min="0" max="20"
                          value={marksB[idx]}
                          onChange={(e) => {
                            const newM = [...marksB];
                            newM[idx] = parseFloat(e.target.value) || 0;
                            setMarksB(newM);
                          }}
                          className="w-12 bg-white rounded-md font-black text-xl text-center text-indigo-700 outline-none p-1"
                        />
                        <span className="text-xs font-black text-indigo-100 uppercase">/ 20</span>
                      </div>
                      {aiMarksB[idx] !== undefined && (
                        <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          Saranan AI: {aiMarksB[idx]}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap min-h-[300px] shadow-inner">
                    {submission.answers_b[idx] || "(Tiada esei dihantar)"}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6 shadow-2xl border-indigo-100 ring-4 ring-slate-100/50">
              <div className="space-y-6">
                <div className="text-center py-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-xl flex items-center justify-center font-black text-lg shadow-lg border border-white/20 ${gradeColor}`}>
                    {currentGrade}
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Markah Keseluruhan</p>
                  <p className="text-7xl font-black">{totalMarks}<span className="text-xl text-slate-500 ml-1">/100</span></p>
                </div>

                <div className="space-y-4">
                  <Input 
                    label="Ulasan & Maklum Balas Guru"
                    multiline rows={10}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Berikan maklum balas..."
                    className="font-medium"
                  />
                  <Button onClick={handleSave} className="w-full py-4 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200">
                    Sahkan & Hantar
                  </Button>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Skala Gred STPM Rasmi</p>
                    <div className="grid grid-cols-2 gap-y-1 text-[10px] font-bold text-slate-600">
                      <div>A : 80-100</div>
                      <div>A-: 75-79</div>
                      <div>B+: 70-74</div>
                      <div>B : 65-69</div>
                      <div>B-: 60-64</div>
                      <div>C+: 50-59</div>
                      <div>C : 40-49</div>
                      <div>C-: 35-39</div>
                      <div>D+: 30-34</div>
                      <div>D : 24-29</div>
                      <div>F : 0-23</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeSubmission;
