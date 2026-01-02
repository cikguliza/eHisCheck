
import React, { useState } from 'react';
import { User, Assignment } from '../types';
import { Card, Input, Button } from '../components/UI';

interface CreateAssignmentProps {
  user: User;
  onCreate: (assignment: Assignment) => void;
  onCancel: () => void;
}

const CreateAssignment: React.FC<CreateAssignmentProps> = ({ user, onCreate, onCancel }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [semester, setSemester] = useState('Semester 1: Sejarah Malaysia');
  const [sectionA, setSectionA] = useState(['', '', '', '', '']);
  const [essayCount, setEssayCount] = useState(3);
  const [sectionB, setSectionB] = useState(['', '', '']);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newAssignment: Assignment = {
      id: `assign_${Date.now()}`,
      title,
      description: desc,
      semester,
      section_a_questions: sectionA.filter(q => q.trim() !== ''),
      section_b_questions: sectionB.slice(0, essayCount).filter(q => q.trim() !== ''),
      created_at: new Date().toISOString(),
      user_id: user.user_id
    };
    onCreate(newAssignment);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Cipta Tugasan Baru</h2>
          <Button variant="ghost" onClick={onCancel}>Batal</Button>
        </div>

        <form onSubmit={handleCreate} className="space-y-8 pb-10">
          <Card className="space-y-4">
            <h3 className="text-lg font-bold border-b pb-2">Informasi Umum</h3>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Pilih Semester</label>
              <select 
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="Semester 1: Sejarah Malaysia">Semester 1: Sejarah Malaysia</option>
                <option value="Semester 2: Sejarah Islam">Semester 2: Sejarah Islam</option>
                <option value="Semester 3: Sejarah Malaysia">Semester 3: Sejarah Malaysia</option>
              </select>
            </div>

            <Input label="Tajuk Tugasan" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Contoh: Perang Dunia Kedua di Asia Pasifik" />
            <Input label="Penerangan" multiline rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Arahan tambahan untuk pelajar..." />
          </Card>

          <Card className="space-y-6">
            <div className="flex justify-between items-end border-b pb-2">
              <h3 className="text-lg font-bold">Bahagian A: Soalan Struktur</h3>
              <span className="text-sm font-bold text-blue-600">Total: 20 Markah (5 x 4)</span>
            </div>
            {sectionA.map((q, idx) => (
              <Input 
                key={idx} 
                label={`Soalan Struktur ${idx + 1}`} 
                multiline 
                rows={2} 
                value={q} 
                onChange={(e) => {
                  const newA = [...sectionA];
                  newA[idx] = e.target.value;
                  setSectionA(newA);
                }} 
                required 
              />
            ))}
          </Card>

          <Card className="space-y-6">
            <div className="flex justify-between items-end border-b pb-2">
              <h3 className="text-lg font-bold">Bahagian B: Soalan Esei</h3>
              <div className="flex items-center gap-4">
                <select 
                  className="bg-white border rounded-lg px-2 py-1 text-sm font-semibold outline-none border-slate-300"
                  value={essayCount}
                  onChange={(e) => setEssayCount(Number(e.target.value))}
                >
                  <option value={1}>1 Soalan</option>
                  <option value={2}>2 Soalan</option>
                  <option value={3}>3 Soalan</option>
                </select>
                <span className="text-sm font-bold text-blue-600">Total: {essayCount * 20} Markah</span>
              </div>
            </div>
            {Array.from({ length: essayCount }).map((_, idx) => (
              <Input 
                key={idx} 
                label={`Soalan Esei ${idx + 1}`} 
                multiline 
                rows={3} 
                value={sectionB[idx]} 
                onChange={(e) => {
                  const newB = [...sectionB];
                  newB[idx] = e.target.value;
                  setSectionB(newB);
                }} 
                required 
              />
            ))}
          </Card>

          <div className="flex justify-end gap-4 sticky bottom-6 bg-white p-4 border rounded-2xl shadow-xl">
            <Button variant="ghost" onClick={onCancel} className="px-8">Batal</Button>
            <Button type="submit" className="px-12">Simpan & Terbit Tugasan</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignment;
