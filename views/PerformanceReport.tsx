
import React, { useState, useEffect, useRef } from 'react';
import { User, Assignment, Submission } from '../types';
import { Button } from '../components/UI';
import { calculateGrade } from '../App';

interface PerformanceReportProps {
  user: User;
  isGuruView?: boolean;
  assignments: Assignment[];
  submissions: Submission[];
  onBack: () => void;
}

const PerformanceReport: React.FC<PerformanceReportProps> = ({ user, isGuruView, assignments, submissions, onBack }) => {
  const [isPreparing, setIsPreparing] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const myGradedSubs = submissions.filter(s => s.student_id === user.user_id && s.status === 'graded');
  const totalMarks = myGradedSubs.reduce((sum, s) => sum + s.teacher_marks, 0);
  const avg = myGradedSubs.length > 0 ? totalMarks / myGradedSubs.length : 0;
  const avgGrade = calculateGrade(avg);

  const handleDownload = () => {
    if (!reportRef.current) return;
    
    setIsPreparing(true);
    const element = reportRef.current;
    const opt = {
      margin: 0,
      filename: `Laporan_Prestasi_${user.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const html2pdf = (window as any).html2pdf;
    if (html2pdf) {
      html2pdf().set(opt).from(element).save().then(() => {
        setIsPreparing(false);
      });
    } else {
      console.error("html2pdf library not found");
      window.print();
      setIsPreparing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDownload();
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 md:p-8">
      <style>{`
        @media screen {
          .print-preview {
            box-shadow: 0 0 40px rgba(0,0,0,0.1);
            background: white;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 20mm;
          }
        }
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          .print-preview {
            width: 100% !important;
            height: 100% !important;
            padding: 15mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center no-print px-4">
        <Button variant="ghost" onClick={onBack} className="font-bold">← Kembali</Button>
        <div className="flex items-center gap-4">
          {isPreparing && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Menjana PDF...</span>
            </div>
          )}
          <Button onClick={handleDownload} disabled={isPreparing} className="bg-[#0f172a] text-white flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Muat Turun PDF
          </Button>
        </div>
      </div>

      <div ref={reportRef} className="print-preview flex flex-col font-sans text-[#0f172a] bg-white">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-[#0f172a] text-white rounded-lg flex items-center justify-center text-5xl font-bold shadow-lg shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight uppercase">Laporan Prestasi Akademik</h1>
              <p className="text-sm font-bold text-slate-400 tracking-wider">E-HISCHEKER STPM SMART ASSESSMENT</p>
              <div className="flex gap-6 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>TARIKH DIJANA: {new Date().toLocaleDateString('ms-MY')}</span>
                <span>MUKA SURAT: 1 / 1</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#f1f5f9] p-4 rounded-xl text-center min-w-[140px] border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PURATA MARKAH</p>
            <p className="text-4xl font-black text-blue-700">{avg.toFixed(0)}</p>
          </div>
        </div>

        {/* TOP DIVIDER */}
        <div className="h-1.5 bg-[#0f172a] w-full mb-10"></div>

        {/* STUDENT INFO BOX */}
        <div className="grid grid-cols-2 gap-8 border border-slate-100 rounded-2xl p-8 mb-10">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NAMA PENUH PELAJAR</p>
              <p className="text-xl font-black uppercase leading-tight">{user.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">KELAS</p>
              <p className="text-lg font-black uppercase tracking-widest text-blue-700">{user.class_name || 'N/A'}</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">NOMBOR ID / MATRIK</p>
            <p className="text-xl font-black uppercase tracking-widest">{user.user_id}</p>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="border border-slate-100 rounded-xl p-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">TUGASAN</p>
            <p className="text-3xl font-black">{assignments.length}</p>
          </div>
          <div className="border border-slate-100 rounded-xl p-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">DINILAI</p>
            <p className="text-3xl font-black text-emerald-600">{myGradedSubs.length}</p>
          </div>
          <div className="border border-slate-100 rounded-xl p-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">KEHADIRAN</p>
            <p className="text-3xl font-black text-blue-600">100%</p>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-blue-600"></div>
            <h3 className="text-sm font-black uppercase tracking-widest">Rekod Penilaian Menyeluruh</h3>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8fafc] text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Tajuk Tugasan Sejarah</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Tarikh</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Markah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {myGradedSubs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-20 text-center text-slate-300 italic font-medium">
                      Tiada rekod penghantaran ditemui.
                    </td>
                  </tr>
                ) : (
                  myGradedSubs.map((sub) => {
                    const assign = assignments.find(a => a.id === sub.assignment_id);
                    return (
                      <tr key={sub.id}>
                        <td className="px-6 py-5 font-bold uppercase">{assign?.title || 'Tugasan'}</td>
                        <td className="px-6 py-5 text-slate-500">{new Date(sub.submitted_at).toLocaleDateString('ms-MY')}</td>
                        <td className="px-6 py-5 text-right font-black text-blue-700">{sub.teacher_marks}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIGNATURE SECTION */}
        <div className="grid grid-cols-2 gap-32 mt-20 px-4">
          <div className="text-center">
            <div className="h-0.5 bg-[#0f172a] w-full mb-3 opacity-80"></div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Tandatangan Pelajar</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">{user.name}</p>
          </div>
          <div className="text-center">
            <div className="h-0.5 bg-[#0f172a] w-full mb-3 opacity-80"></div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Pengesahan Guru Subjek</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">LIZA BINTI JUNI</p>
          </div>
        </div>

        {/* FINAL FOOTER */}
        <div className="mt-20 text-center">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.5em]">
            Dokumen ini dijana secara digital oleh E-HisCheker
          </p>
        </div>

      </div>
    </div>
  );
};

export default PerformanceReport;
