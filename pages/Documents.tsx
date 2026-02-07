
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
        // 1. Sanitize file name kỹ càng để tránh lỗi 400 từ Supabase
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'file';
        const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
        // Chỉ giữ lại chữ cái, số, gạch ngang, gạch dưới. Thay thế ký tự lạ bằng '_'
        const sanitizedName = fileNameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_'); 
        const fileName = `${Date.now()}_${sanitizedName}.${fileExt}`;
        const filePath = `documents/${fileName}`; // Upload vào thư mục documents
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`Lỗi upload Storage ${file.name}:`, uploadError);
          if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
             alert(`Lỗi quyền truy cập (RLS) khi upload ${file.name}.\nVui lòng chạy script SQL trong 'supabase_setup.sql' tại Supabase SQL Editor để khắc phục.`);
          }
          continue; 
        }

        if (uploadData) {
          // 2. Lấy Public URL
          const { data: { publicUrl } } = supabase.storage
            .from('files')
            .getPublicUrl(uploadData.path);

          const fileSize = `${(file.size / 1024 / 1024).toFixed(2)} MB`;

          // 3. Lưu vào DB 'documents'
          const { data: insertData, error: insertError } = await supabase
            .from('documents')
            .insert([
              {
                name: file.name, // Giữ nguyên tên hiển thị gốc
                size: fileSize,
                type: fileExt,
                url: publicUrl,
                meeting_id: null
              }
            ])
            .select()
            .single();

          if (insertError) {
             console.error(`Lỗi Insert DB ${file.name}:`, insertError.message, insertError.details);
             alert(`Lỗi lưu DB cho ${file.name}: ${insertError.message}. Hãy đảm bảo bạn đã cấu hình RLS và meeting_id nullable.`);
          } else if (insertData) {
            uploadedDocs.push({
              id: insertData.id,
              name: insertData.name,
              size: insertData.size,
              type: insertData.type,
              url: insertData.url,
              file: file 
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
      alert('Có lỗi xảy ra trong quá trình tải lên. Vui lòng kiểm tra console.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId: string, url?: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này vĩnh viễn? Hành động này không thể hoàn tác.')) return;

    try {
        // 1. Xóa file khỏi Storage nếu có URL
        if (url) {
            // URL thường có dạng: .../storage/v1/object/public/files/documents/filename.ext
            // Bucket name là 'files'. Tìm vị trí '/files/' và lấy phần path phía sau.
            const pathIndex = url.indexOf('/files/');
            if (pathIndex !== -1) {
                const relativePath = url.substring(pathIndex + 7); // +7 để bỏ qua '/files/'
                if (relativePath) {
                    const { error: storageError } = await supabase.storage
                        .from('files')
                        .remove([decodeURIComponent(relativePath)]);
                    
                    if (storageError) {
                        console.error('Lỗi xóa storage:', storageError);
                        // Vẫn tiếp tục để xóa DB
                    }
                }
            }
        }

        // 2. Xóa khỏi DB
        const { error: dbError } = await supabase
            .from('documents')
            .delete()
            .eq('id', docId);

        if (dbError) {
            throw new Error(dbError.message);
        }

        // 3. Cập nhật UI
        const updatedDocs = initialDocs.filter(d => d.id !== docId);
        onUpdateDocs(updatedDocs);

    } catch (error: any) {
        console.error('Lỗi xóa tài liệu:', error);
        alert('Không thể xóa tài liệu: ' + error.message);
    }
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
