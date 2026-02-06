
import React, { useState, useRef } from 'react';
import { MeetingDocument } from '../types';

interface DocumentsProps {
  initialDocs: MeetingDocument[];
  onUpdateDocs: (docs: MeetingDocument[]) => void;
}

const Documents: React.FC<DocumentsProps> = ({ initialDocs, onUpdateDocs }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Giới hạn tối đa 10 file mỗi lần tải lên
    const filesToProcess = Array.from(files).slice(0, 10) as File[];
    
    const newDocs: MeetingDocument[] = filesToProcess.map(file => {
      const fileType = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      // Tạo Blob URL cho file thật để preview
      const fileUrl = URL.createObjectURL(file);
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: fileType,
        file: file,
        url: fileUrl
      };
    });

    onUpdateDocs([...newDocs, ...initialDocs]);
    
    if (files.length > 10) {
      alert("Hệ thống chỉ xử lý tối đa 10 tệp tin cho mỗi lượt tải lên.");
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#f0f7ff] relative page-transition font-display">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".pdf,.docx,.xlsx" 
        multiple 
      />

      <div className="flex-1 overflow-y-auto">
        <div className="layout-content-container mx-auto max-w-[1200px] p-10 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Kho Tài liệu Hệ thống</h1>
            <p className="text-slate-500 font-medium">Trung tâm lưu trữ và đồng bộ hóa tài liệu cho toàn bộ các cuộc họp.</p>
          </div>

          <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-soft">
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-glow-blue hover:bg-blue-600 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">upload_file</span> Tải lên tài liệu mới
              </button>
              <p className="text-[10px] text-slate-400 font-bold ml-1 mt-1 uppercase tracking-tighter">Hỗ trợ tải lên tối đa 10 tệp cùng lúc</p>
            </div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
               {initialDocs.length} Tài liệu trong kho
            </div>
          </div>

          <div className="flex flex-col rounded-[2.5rem] border border-slate-100 bg-white shadow-soft overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Tài liệu</th>
                  <th className="px-8 py-5">Định dạng</th>
                  <th className="px-8 py-5">Dung lượng</th>
                  <th className="px-8 py-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {initialDocs.map((doc) => (
                  <tr key={doc.id} className="group hover:bg-primary/[0.02] transition-colors">
                    <td className="px-8 py-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined">{doc.type === 'pdf' ? 'picture_as_pdf' : 'description'}</span>
                      </div>
                      <span className="font-bold text-slate-800">{doc.name}</span>
                    </td>
                    <td className="px-8 py-5 uppercase font-black text-[10px] text-slate-400">{doc.type}</td>
                    <td className="px-8 py-5 font-bold text-slate-500">{doc.size}</td>
                    <td className="px-8 py-5 text-right">
                       <button className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-all">
                         <span className="material-symbols-outlined">delete</span>
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {initialDocs.length === 0 && (
              <div className="p-20 text-center text-slate-300">
                <span className="material-symbols-outlined text-6xl mb-4">folder_off</span>
                <p className="font-bold">Kho tài liệu hiện đang trống</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Documents;
