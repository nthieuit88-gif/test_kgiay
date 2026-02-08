
import React, { useState, useRef } from 'react';
import { MeetingDocument } from '../types';
import { supabase } from '../lib/supabaseClient';

interface DocumentsProps {
  initialDocs: MeetingDocument[];
  onUpdateDocs: (docs: MeetingDocument[]) => void;
  isAdmin: boolean;
}

const Documents: React.FC<DocumentsProps> = ({ initialDocs, onUpdateDocs, isAdmin }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      alert("Bạn không có quyền tải lên tài liệu hệ thống.");
      return;
    }
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedDocs: MeetingDocument[] = [];

    try {
      // Fix: Cast FileList conversion to File[] to resolve 'unknown' type errors for name and size properties (Errors on line 29, 30, 38, 39)
      for (const file of Array.from(files) as File[]) {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'file';
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
        const filePath = `documents/${fileName}`;
        
        const { data: uploadData } = await supabase.storage.from('files').upload(filePath, file);

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('files').getPublicUrl(uploadData.path);
          // Fix: Ensure inserted data fields correspond to MeetingDocument interface requirements
          const { data: insertData } = await supabase.from('documents').insert([{
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            type: fileExt,
            url: publicUrl,
            meeting_id: null
          }]).select().single();

          if (insertData) {
            // Fix: Cast database response to MeetingDocument for type compatibility
            uploadedDocs.push(insertData as MeetingDocument);
          }
        }
      }
      if (uploadedDocs.length > 0) onUpdateDocs([...uploadedDocs, ...initialDocs]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string, url?: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Xóa vĩnh viễn tài liệu?')) return;

    try {
        if (url) {
            const pathIndex = url.indexOf('/files/');
            if (pathIndex !== -1) {
                const relativePath = url.substring(pathIndex + 7);
                await supabase.storage.from('files').remove([decodeURIComponent(relativePath)]);
            }
        }
        await supabase.from('documents').delete().eq('id', docId);
        onUpdateDocs(initialDocs.filter(d => d.id !== docId));
    } catch (e) { alert('Lỗi: ' + e); }
  };

  return (
    <main className="flex-1 flex flex-col bg-[#f0f7ff] font-display">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.xlsx" multiple />
      <div className="flex-1 overflow-y-auto p-10 max-w-[1200px] mx-auto w-full space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Kho Tài liệu Hệ thống</h1>
          <p className="text-slate-500 font-medium">Trung tâm lưu trữ và đồng bộ hóa tài liệu.</p>
        </div>

        <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-soft">
          <button 
            onClick={() => isAdmin && fileInputRef.current?.click()} 
            className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white shadow-glow-blue transition-all ${!isAdmin ? 'bg-slate-300 cursor-not-allowed' : 'bg-primary hover:bg-blue-600'}`}
          >
            <span className="material-symbols-outlined">{!isAdmin ? 'lock' : 'upload_file'}</span>
            Tải tài liệu mới {isUploading && '...'}
          </button>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full">{initialDocs.length} Tài liệu</div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-soft overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b">
              <tr>
                <th className="px-8 py-5">Tài liệu</th>
                <th className="px-8 py-5">Định dạng</th>
                <th className="px-8 py-5">Dung lượng</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {initialDocs.map((doc) => (
                <tr key={doc.id} className="group hover:bg-primary/[0.02]">
                  <td className="px-8 py-5">
                    <a href={doc.url} target="_blank" className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined">{doc.type === 'pdf' ? 'picture_as_pdf' : 'description'}</span>
                      </div>
                      <span className="font-bold text-slate-800 truncate max-w-[300px]">{doc.name}</span>
                    </a>
                  </td>
                  <td className="px-8 py-5 uppercase font-black text-[10px] text-slate-400">{doc.type}</td>
                  <td className="px-8 py-5 font-bold text-slate-500">{doc.size}</td>
                  <td className="px-8 py-5 text-right">
                    {isAdmin && (
                      <button onClick={() => handleDelete(doc.id, doc.url)} className="p-2 text-slate-300 hover:text-rose-500 rounded-lg">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default Documents;
