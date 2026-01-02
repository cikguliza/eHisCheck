
import React, { useState } from 'react';
import { User } from '../types';
import { Card, Button, Input } from '../components/UI';

interface RegisterStudentsProps {
  existingStudents: User[];
  onRegister: (newStudents: User[]) => void;
  onCancel: () => void;
}

const RegisterStudents: React.FC<RegisterStudentsProps> = ({ existingStudents, onRegister, onCancel }) => {
  const [namesText, setNamesText] = useState('');
  const [selectedClass, setSelectedClass] = useState('SSA');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const names = namesText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    const year = new Date().getFullYear();

    // FIX: Cari nombor urutan tertinggi yang wujud untuk tahun ini
    // Ini mengelakkan isu "ID Collision" di mana pelajar baru mendapat ID pelajar yang telah dipadam
    let maxSeq = 0;
    existingStudents.forEach(s => {
      if (s.user_id && s.user_id.startsWith(String(year))) {
        // ID Format: YYYYXXX (Contoh: 2024001)
        const seqPart = s.user_id.substring(4);
        const seq = parseInt(seqPart, 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });

    const newStudents: User[] = names.map((name, index) => {
      // Mula dari maxSeq + 1
      const sequence = String(maxSeq + index + 1).padStart(3, '0');
      const studentId = `${year}${sequence}`;
      
      return {
        id: `user_${studentId}_${Date.now()}_${index}`, // Ensure absolute unique React key
        user_id: studentId,
        name: name,
        role: 'pelajar',
        password: studentId,
        class_name: selectedClass,
        created_at: new Date().toISOString()
      };
    });

    onRegister(newStudents);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">Daftar Pelajar Baru</h2>
          <Button variant="ghost" onClick={onCancel}>Batal</Button>
        </div>

        <Card className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h4 className="font-bold text-blue-800 mb-1">Cara Pendaftaran Pukal:</h4>
              <p className="text-sm text-blue-700">Pilih kelas, kemudian taip nama penuh pelajar di bawah (satu nama setiap baris). ID Pelajar akan dijana secara automatik.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Pilih Kelas Pelajar</label>
              <div className="grid grid-cols-4 gap-3">
                {['SSA', 'SSB', 'SSC', 'SSD'].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`py-3 rounded-xl border-2 font-black transition-all ${
                      selectedClass === cls 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            <Input 
              label="Nama Pelajar (Satu per baris)" 
              multiline 
              rows={12} 
              value={namesText} 
              onChange={(e) => setNamesText(e.target.value)} 
              placeholder="Ahmad Bin Ali&#10;Siti Norbaya Binti Samsul&#10;Tan Ah Kau..."
              required
            />
            
            <div className="pt-4 flex gap-4">
              <Button variant="ghost" onClick={onCancel} className="flex-1">Batal</Button>
              <Button type="submit" className="flex-[2] py-4 text-lg">Daftar {namesText.split('\n').filter(n => n.trim()).length} Pelajar ke {selectedClass}</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterStudents;
