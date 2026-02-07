
import React, { useState, useRef } from 'react';
import { MeetingDocument } from '../types';
import { supabase } from '../lib/supabaseClient';

interface DocumentsProps {
  initialDocs: MeetingDocument[];
  onUpdateDocs: (docs: MeetingDocument[]) => void;
}

const Documents: React.FC<DocumentsProps> = ({ initialDocs, onUpdateDocs }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 10) {
      alert("Hệ thống chỉ xử lý tối đa 10 tệp tin cho mỗi lượt tải lên.");
      return;
    }

    setIsUploading(true);
    const filesToProcess = Array.from(files).slice(0, 10) as File[];
    const uploadedDocs: MeetingDocument[] = [];

    try {
      for (const file of filesToProcess) {
        // 1. Tạo tên file duy nhất để tránh trùng lặp
        // Loại bỏ các ký tự đặc biệt khỏi tên file gốc
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${Date.now()}-${sanitizedFileName}`;
        
        // 2. Upload file lên Supabase Storage bucket 'files'
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('files')
          .upload(`public/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`Lỗi upload file ${file.name}:`, uploadError.message);
          continue; // Bỏ qua file lỗi, tiếp tục file khác
        }

        if (uploadData) {
          // 3. Lấy Public URL
          const { data: { publicUrl } } = supabase.storage
            .from('files')
            .getPublicUrl(uploadData.path);

          const fileType = file.name.split('.').pop()?.toLowerCase() || 'file';
          const fileSize = `${(file.size / 1024 / 1024).toFixed(2)} MB`;

          // 4. Lưu thông tin (metadata) vào bảng 'documents' trong Database
          const { data: insertData, error: insertError } = await supabase
            .from('documents')
            .insert([
              {
                name: file.name,
                size: fileSize,
                type: fileType,
                url: publicUrl
              }
            ])
            .select()
            .single();

          if (insertError) {
             console.error(`Lỗi lưu DB file ${file.name}:`, insertError.message);
          } else if (insertData) {
            // 5. Chuẩn bị dữ liệu để update UI
            uploadedDocs.push({
              id: insertData.id,
              name: insertData.name,
              size: insertData.size,
              type: insertData.type,
              url: insertData.url,
              file: file // Giữ file object nếu cần dùng local tạm thời
            });
          }
        }
      }

      // Cập nhật UI với danh sách file mới + file cũ
      if (uploadedDocs.length > 0) {
        onUpdateDocs([...uploadedDocs, ...initialDocs]);
        alert(`Đã tải lên thành công ${uploadedDocs.length} tài liệu.`);
      }

    } catch (error: any) {
      console.error('Lỗi quá trình upload:', error);
      alert('Có lỗi xảy ra trong quá trình tải lên.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId: string, url?: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;

    // Xóa từ DB
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId);

    if (dbError) {
      alert('Lỗi xóa dữ liệu: ' + dbError.message);
      return;
    }

    // Cập nhật UI
    const updatedDocs = initialDocs.filter(d => d.id !== docId);
    onUpdateDocs(updatedDocs);
    
    // Lưu ý: Việc xóa file vật lý trong Storage có thể thực hiện thêm ở đây
    // bằng cách parse path từ URL, nhưng thường ta chỉ cần xóa record trong DB
    // hoặc dùng Edge Function để dọn dẹp sau.
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
                onClick={() => !isUploading && fileInputRef.current?.click()} 
                disabled={isUploading}
                className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white shadow-glow-blue transition-all active:scale-95 ${isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-600'}`}
              >
                {isUploading ? (
                  <><span className="material-symbols-outlined animate-spin">progress_activity</span> Đang tải lên...</>
                ) : (
                  <><span className="material-symbols-outlined">upload_file</span> Tải lên tài liệu mới</>
                )}
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
                    <td className="px-8 py-5">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group-hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <span className="material-symbols-outlined">{doc.type === 'pdf' ? 'picture_as_pdf' : 'description'}</span>
                        </div>
                        <span className="font-bold text-slate-800 hover:text-primary hover:underline">{doc.name}</span>
                      </a>
                    </td>
                    <td className="px-8 py-5 uppercase font-black text-[10px] text-slate-400">{doc.type}</td>
                    <td className="px-8 py-5 font-bold text-slate-500">{doc.size}</td>
                    <td className="px-8 py-5 text-right">
                       <button 
                         onClick={() => handleDelete(doc.id, doc.url)}
                         className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-all"
                         title="Xóa tài liệu"
                        >
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
