
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Meeting, MeetingDocument } from '../types';
import { supabase } from '../lib/supabaseClient';

const mammoth = (window as any).mammoth;
const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];

// PDF Page Component for rendering individual pages
const PdfPage: React.FC<{ pdfDoc: any, pageNum: number, scale: number }> = ({ pdfDoc, pageNum, scale }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    
    let isCancelled = false;

    pdfDoc.getPage(pageNum).then((page: any) => {
      if (isCancelled) return;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      page.render(renderContext);
    });

    return () => { isCancelled = true; };
  }, [pdfDoc, pageNum, scale]);

  return <canvas ref={canvasRef} className="bg-white w-full h-full object-contain" />;
};

interface MeetingDetailProps {
  meeting: Meeting;
  onUpdateMeeting: (meeting: Meeting) => void;
  onBack: () => void;
}

const dataBar = [
  { name: 'T1', val: 40 }, { name: 'T2', val: 60 }, { name: 'T3', val: 50 }, { name: 'T4', val: 80 }, { name: 'T5', val: 95 },
];
const dataPie = [
  { name: 'Chi phí', value: 70 }, { name: 'Lợi nhuận', value: 30 },
];
const COLORS = ['#137fec', '#e2e8f0'];

const MeetingDetail: React.FC<MeetingDetailProps> = ({ meeting, onUpdateMeeting, onBack }) => {
  const availableDocs = meeting.documents || [];
  const reportDoc: any = { id: 'rep', name: 'Báo cáo phân tích hệ thống', type: 'report', size: 'N/A' };
  
  const [activeDoc, setActiveDoc] = useState<any>(availableDocs.length > 0 ? availableDocs[0] : reportDoc);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [showAi, setShowAi] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  
  // State quản lý lật trang
  const [currentPage, setCurrentPage] = useState(0);

  // States cho việc quản lý tài liệu
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // PDF State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages, currentPage]);

  const nextPage = () => {
    if (currentPage < numPages - 1) setCurrentPage(p => p + 1);
    // Đối với fallback có 3 trang
    if (isFallback && currentPage < 2) setCurrentPage(p => p + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(p => p - 1);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 5) {
      alert("Vui lòng tải tối đa 5 tài liệu một lúc.");
      return;
    }

    setIsUploading(true);
    const newDocs: MeetingDocument[] = [];

    try {
        for (const file of Array.from(files) as File[]) {
            // 1. Upload file lên Supabase Storage
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${Date.now()}-${sanitizedFileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('files')
                .upload(`public/${fileName}`, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                continue;
            }

            // 2. Lấy Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('files')
                .getPublicUrl(uploadData.path);

            const fileSize = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
            const fileType = file.name.split('.').pop()?.toLowerCase() || 'file';

            // 3. Lưu vào Database kèm meeting_id
            const { data: insertData, error: insertError } = await supabase
                .from('documents')
                .insert([{
                    name: file.name,
                    size: fileSize,
                    type: fileType,
                    url: publicUrl,
                    meeting_id: meeting.id // Quan trọng: Liên kết với cuộc họp
                }])
                .select()
                .single();

            if (insertError) {
                console.error("DB Insert error:", insertError);
            } else if (insertData) {
                newDocs.push({
                    id: insertData.id,
                    name: insertData.name,
                    size: insertData.size,
                    type: insertData.type,
                    url: insertData.url,
                    file: file
                });
            }
        }

        if (newDocs.length > 0) {
            const updatedMeeting = {
                ...meeting,
                documents: [...(meeting.documents || []), ...newDocs]
            };
            onUpdateMeeting(updatedMeeting);
            // Tự động mở tài liệu vừa tải lên đầu tiên
            setActiveDoc(newDocs[0]);
        }

    } catch (e) {
        console.error("General upload error", e);
        alert("Có lỗi xảy ra khi tải tài liệu.");
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDoc = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này khỏi cuộc họp?')) return;

    // 1. Xóa khỏi Database Supabase
    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

    if (error) {
        alert("Lỗi khi xóa tài liệu: " + error.message);
        return;
    }

    // 2. Cập nhật State Local
    const updatedDocs = (meeting.documents || []).filter(d => d.id !== docId);
    const updatedMeeting = { ...meeting, documents: updatedDocs };
    onUpdateMeeting(updatedMeeting);
    
    if (activeDoc.id === docId) setActiveDoc(reportDoc);
  };

  const startEdit = (e: React.MouseEvent, doc: MeetingDocument) => {
    e.stopPropagation();
    setEditingDocId(doc.id);
    setEditName(doc.name);
  };

  const saveEdit = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!editingDocId) return;
    const updatedDocs = (meeting.documents || []).map(d =>
        d.id === editingDocId ? { ...d, name: editName } : d
    );
    onUpdateMeeting({ ...meeting, documents: updatedDocs });
    if (activeDoc.id === editingDocId) {
        setActiveDoc({ ...activeDoc, name: editName });
    }
    setEditingDocId(null);
  };

  const handleAiSummary = async () => {
    setAiLoading(true);
    setShowAi(true);
    setAiResponse("");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Hãy tóm tắt tài liệu chuyên sâu: ${activeDoc.name}.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiResponse(response.text || "");
    } catch {
      setAiResponse("Phân tích AI: Tài liệu này chứa các thông tin chiến lược về cuộc họp '" + meeting.title + "'. Các điểm chính bao gồm tối ưu hóa nhân sự và kế hoạch ngân sách cho giai đoạn tiếp theo.");
    } finally {
      setAiLoading(false);
    }
  };

  const loadContent = async () => {
    setPdfDoc(null);
    setNumPages(0);
    setDocxHtml(null);
    setLoading(true);
    setIsFallback(false);
    setZoom(1.0);
    setCurrentPage(0); // Reset về trang đầu khi đổi file

    if (activeDoc.type === 'report') {
      setIsFallback(false);
      setLoading(false);
      return;
    }

    if (activeDoc.url) {
      if (activeDoc.type === 'docx') {
        try {
          const response = await fetch(activeDoc.url);
          const arrayBuffer = await response.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
          setDocxHtml(result.value);
          setLoading(false);
        } catch (error) {
          console.error("Lỗi đọc file docx:", error);
          setIsFallback(true);
          setLoading(false);
        }
      } else if (activeDoc.type === 'pdf') {
        try {
          const loadingTask = pdfjsLib.getDocument(activeDoc.url);
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          setLoading(false);
        } catch (error) {
           console.error("Error loading PDF", error);
           setIsFallback(true);
           setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        setIsFallback(true);
        setLoading(false);
        setNumPages(3); // Giả lập 3 trang cho fallback
      }, 600);
    }
  };

  useEffect(() => {
    loadContent();
  }, [activeDoc]);

  // Hiển thị Fallback 3D Flip
  const renderFallbackPDF = () => (
    <div className="book-perspective relative w-[650px] h-[920px] shadow-2xl mt-8 transition-transform duration-500 origin-top" style={{ transform: `scale(${zoom})` }}>
       {[0, 1, 2].map((pageIndex) => (
          <div 
            key={pageIndex} 
            className={`book-page absolute inset-0 bg-white border border-slate-200 flex flex-col p-16 overflow-hidden shadow-md ${pageIndex < currentPage ? 'flipped' : ''}`}
            style={{ zIndex: 3 - pageIndex }}
          >
              <div className="flex justify-between items-start mb-10 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-black">P</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Paperless Meeting Cloud</div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trang {pageIndex + 1} / 3</p>
                  <p className="text-[9px] font-bold text-slate-300">REF: {meeting.id}-{activeDoc.id}</p>
                </div>
              </div>

              {pageIndex === 0 && (
                <div className="flex-1 space-y-6 animate-fade-in-up">
                  <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase text-center tracking-tight leading-tight">{activeDoc.name}</h1>
                  <p className="font-bold text-slate-900 text-center text-lg">Nội dung cuộc họp: {meeting.title}</p>
                  <div className="flex justify-center my-12">
                     <div className="w-32 h-1 bg-primary/20 rounded-full"></div>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <p className="text-xs font-bold text-primary mb-4 uppercase tracking-widest text-center">Thông tin xác thực</p>
                    <div className="flex justify-between text-sm font-medium text-slate-600 px-4">
                        <span>Chủ trì:</span>
                        <span className="font-bold text-slate-900">{meeting.host}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-slate-600 px-4 mt-2">
                        <span>Phòng họp:</span>
                        <span className="font-bold text-slate-900">{meeting.roomId}</span>
                    </div>
                  </div>
                </div>
              )}

              {pageIndex === 1 && (
                <div className="flex-1 space-y-6 text-justify leading-loose text-slate-700 font-medium">
                   <h3 className="text-xl font-bold text-slate-900 mb-4">I. Tổng quan vấn đề</h3>
                   <p>Theo báo cáo đánh giá tác động kinh tế quý vừa qua, chúng ta nhận thấy sự tăng trưởng mạnh mẽ trong lĩnh vực chuyển đổi số. Tuy nhiên, các thách thức về bảo mật thông tin và quản lý tài nguyên vẫn cần được xem xét một cách nghiêm túc.</p>
                   <p>Hệ thống Paperless Meeting được triển khai nhằm giải quyết các vấn đề tồn đọng trong quy trình tổ chức họp truyền thống, giúp tiết kiệm thời gian và chi phí in ấn.</p>
                   <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 mt-6">
                      <p className="text-blue-800 italic font-serif">"Chuyển đổi số không chỉ là công nghệ, mà là sự thay đổi về tư duy quản trị."</p>
                   </div>
                </div>
              )}

              {pageIndex === 2 && (
                <div className="flex-1 space-y-6">
                   <h3 className="text-xl font-bold text-slate-900 mb-4">II. Kết luận và Chỉ đạo</h3>
                   <ul className="list-decimal list-inside space-y-4 text-slate-700 font-medium">
                      <li>Thống nhất phương án triển khai giai đoạn 2 của dự án.</li>
                      <li>Yêu cầu các bộ phận liên quan hoàn tất báo cáo trước ngày 30 hàng tháng.</li>
                      <li>Phê duyệt ngân sách bổ sung cho việc nâng cấp hạ tầng mạng Wifi 6 tại khu vực phòng họp VIP.</li>
                   </ul>
                   <div className="mt-20 flex flex-col items-end">
                      <p className="text-sm font-bold text-slate-400 mb-4">Người phê duyệt</p>
                      <div className="w-40 h-20 border-b-2 border-slate-200 mb-2"></div>
                      <p className="font-bold text-slate-900">{meeting.host}</p>
                   </div>
                </div>
              )}

              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] rotate-[-45deg] select-none z-0">
                <span className="text-8xl font-black">CONFIDENTIAL</span>
              </div>
          </div>
       ))}
    </div>
  );

  return (
    <div className="bg-[#f1f5f9] h-screen flex flex-col overflow-hidden relative font-display">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.xlsx" multiple />
      
      {/* Sidebar (Giữ nguyên) */}
      <aside className="fixed left-0 top-0 bottom-0 w-[340px] bg-white border-r border-slate-200 flex flex-col z-50 shadow-2xl">
        <div className="h-24 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50/50">
           <div className="flex items-center gap-3 overflow-hidden">
             <button onClick={onBack} className="w-10 h-10 flex-shrink-0 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all border border-slate-100"><span className="material-symbols-outlined">arrow_back</span></button>
             <div className="flex flex-col overflow-hidden">
                <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 truncate">Tài liệu cuộc họp</span>
                <span className="font-bold text-slate-800 text-xs truncate" title={meeting.title}>{meeting.title}</span>
             </div>
           </div>
           <button onClick={() => !isUploading && fileInputRef.current?.click()} className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-primary text-white rounded-xl shadow-glow-blue hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50" title="Thêm tài liệu">
              {isUploading ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : <span className="material-symbols-outlined text-[20px]">add</span>}
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div onClick={() => setActiveDoc(reportDoc)} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${activeDoc.id === 'rep' ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-50 hover:border-slate-200'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeDoc.id === 'rep' ? 'bg-primary text-white' : 'bg-slate-100'}`}><span className="material-symbols-outlined">analytics</span></div>
            <p className="text-sm font-black truncate">Dashboard Phân tích</p>
          </div>

          {availableDocs.map((doc) => (
            <div 
              key={doc.id} 
              onClick={() => setActiveDoc(doc)} 
              className={`group relative flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${activeDoc.id === doc.id ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-50 hover:border-slate-200 hover:shadow-sm'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeDoc.id === doc.id ? 'bg-primary text-white' : 'bg-slate-100'}`}>
                <span className="material-symbols-outlined">{doc.type === 'pdf' ? 'picture_as_pdf' : 'description'}</span>
              </div>
              
              <div className="flex-1 overflow-hidden min-w-0">
                {editingDocId === doc.id ? (
                  <form onSubmit={saveEdit} onClick={e => e.stopPropagation()} className="flex items-center gap-2">
                    <input 
                      autoFocus
                      className="w-full text-xs font-bold bg-white border border-primary rounded px-2 py-1 outline-none text-slate-900"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={saveEdit}
                    />
                  </form>
                ) : (
                  <>
                    <p className="text-sm font-black truncate text-slate-800">{doc.name}</p>
                    <p className="text-[9px] font-black uppercase opacity-40 mt-1">{doc.type} • {doc.size}</p>
                  </>
                )}
              </div>
              <div className={`flex items-center gap-1 ${editingDocId === doc.id ? 'hidden' : 'opacity-0 group-hover:opacity-100'} transition-opacity absolute right-2 bg-white/90 p-1 rounded-lg shadow-sm border border-slate-100`}>
                <button onClick={(e) => startEdit(e, doc)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-primary transition-colors" title="Đổi tên"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                <button onClick={(e) => handleDeleteDoc(e, doc.id)} className="p-1.5 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-500 transition-colors" title="Xóa"><span className="material-symbols-outlined text-[16px]">delete</span></button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <header className="ml-[340px] h-24 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-12 sticky top-0 z-40">
        <div className="flex flex-col max-w-2xl"><h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none truncate" title={activeDoc.name}>{activeDoc.name}</h2><div className="flex items-center gap-3 mt-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{meeting.title}</span></div></div>
        <button onClick={handleAiSummary} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-xs shadow-glow-blue active:scale-95 transition-all uppercase tracking-widest flex items-center gap-3 shrink-0"><span className="material-symbols-outlined fill">smart_toy</span> Phân tích AI</button>
      </header>

      <main className="ml-[340px] flex-1 flex flex-col bg-slate-200/50 overflow-hidden relative">
        {/* Bottom Toolbar - Updated with Pagination Info Only */}
        <div className="bg-white/90 border-b border-slate-200 h-16 flex items-center justify-between px-8 z-30 shadow-sm shrink-0 relative">
           {/* Zoom Controls */}
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                  <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 transition-colors"><span className="material-symbols-outlined">remove</span></button>
                  <span className="text-xs font-black min-w-[50px] text-center text-slate-700 select-none">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 transition-colors"><span className="material-symbols-outlined">add</span></button>
              </div>
              <button onClick={() => setZoom(1.0)} className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-wider">Reset</button>
           </div>

           {/* Pagination Info - Only for PDF or Fallback */}
           {(activeDoc.type === 'pdf' || isFallback) && (
              <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
                  <span className="text-sm font-black text-slate-800">Trang {currentPage + 1}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ {numPages || '...'}</span>
              </div>
           )}

           <button className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-primary transition-all uppercase tracking-widest"><span className="material-symbols-outlined text-[18px]">download</span> Tải xuống</button>
        </div>

        <div className="flex-1 overflow-hidden relative flex justify-center bg-slate-200/50">
           {/* Floating Navigation Buttons */}
           {!loading && (activeDoc.type === 'pdf' || isFallback) && (
             <>
               <button 
                 onClick={prevPage} 
                 disabled={currentPage === 0}
                 className="absolute left-10 top-1/2 -translate-y-1/2 z-40 w-16 h-16 rounded-full bg-white/80 backdrop-blur-md border border-white/50 shadow-2xl text-slate-600 flex items-center justify-center hover:bg-primary hover:text-white hover:scale-110 transition-all disabled:opacity-0 disabled:pointer-events-none group active:scale-95"
               >
                 <span className="material-symbols-outlined text-4xl group-hover:-translate-x-1 transition-transform">chevron_left</span>
               </button>

               <button 
                 onClick={nextPage} 
                 disabled={currentPage >= (numPages - 1)}
                 className="absolute right-10 top-1/2 -translate-y-1/2 z-40 w-16 h-16 rounded-full bg-white/80 backdrop-blur-md border border-white/50 shadow-2xl text-slate-600 flex items-center justify-center hover:bg-primary hover:text-white hover:scale-110 transition-all disabled:opacity-0 disabled:pointer-events-none group active:scale-95"
               >
                 <span className="material-symbols-outlined text-4xl group-hover:translate-x-1 transition-transform">chevron_right</span>
               </button>
             </>
           )}

           {loading ? (
             <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
               <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
               <p className="font-black text-xs uppercase tracking-widest">Đang tải tài liệu...</p>
             </div>
           ) : (
             <div className="w-full h-full flex items-start justify-center overflow-y-auto custom-scrollbar pt-8 pb-20">
                {/* Fallback View */}
                {isFallback && renderFallbackPDF()}

                {/* Report View - Giữ nguyên không lật trang */}
                {!isFallback && activeDoc.id === 'rep' && (
                  <div className="w-full max-w-4xl bg-white shadow-2xl rounded-[3rem] p-20 animate-in zoom-in-95 origin-top mt-8" style={{ transform: `scale(${zoom})` }}>
                     <h1 className="text-4xl font-black mb-10 text-slate-900 tracking-tighter">Báo cáo Cuộc họp</h1>
                     <div className="grid grid-cols-2 gap-10">
                        <div className="h-64"><ResponsiveContainer><BarChart data={dataBar}><Bar dataKey="val" fill="#137fec" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div>
                        <div className="h-64"><ResponsiveContainer><PieChart><Pie data={dataPie} innerRadius={70} outerRadius={90} dataKey="value">{dataPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}</Pie></PieChart></ResponsiveContainer></div>
                     </div>
                  </div>
                )}

                {/* PDF View (Book Flip Mode) */}
                {!isFallback && activeDoc.type === 'pdf' && pdfDoc && (
                   <div className="book-perspective relative w-[650px] h-[920px] shadow-2xl mt-8 transition-transform duration-500 origin-top" style={{ transform: `scale(${zoom})` }}>
                     {Array.from(new Array(numPages), (el, index) => (
                       <div 
                          key={`page_${index}`} 
                          className={`book-page absolute inset-0 bg-white shadow-md ${index < currentPage ? 'flipped' : ''}`}
                          style={{ zIndex: numPages - index }}
                        >
                          <PdfPage pdfDoc={pdfDoc} pageNum={index + 1} scale={1.5} />
                          {/* Số trang góc dưới */}
                          <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-400 bg-white/80 px-2 py-1 rounded">
                            {index + 1} / {numPages}
                          </div>
                       </div>
                     ))}
                   </div>
                )}
                
                {/* DOCX View (Vẫn giữ cuộn dọc vì tính chất flow document) */}
                {!isFallback && activeDoc.type === 'docx' && docxHtml && (
                   <div 
                     className="bg-white shadow-2xl p-16 min-h-[1100px] docx-content-render origin-top mt-8"
                     style={{ 
                       transform: `scale(${zoom})`, 
                       width: '850px'
                     }}
                     dangerouslySetInnerHTML={{ __html: docxHtml }} 
                   />
                )}
             </div>
           )}
        </div>
      </main>

      {/* AI Assistant Panel (Giữ nguyên) */}
      {showAi && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-[100] border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-500">
          <div className="p-8 border-b flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-glow-blue"><span className="material-symbols-outlined fill">smart_toy</span></div><h3 className="font-black text-slate-900 text-lg">AI Assistant</h3></div><button onClick={() => setShowAi(false)} className="p-2 hover:bg-slate-100 rounded-full"><span className="material-symbols-outlined">close</span></button></div>
          <div className="flex-1 overflow-y-auto p-10">{aiLoading ? <div className="space-y-4 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-4 bg-slate-100 rounded-full w-full"></div>)}</div> : <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line">{aiResponse}</p>}</div>
          <div className="p-8 border-t bg-slate-50"><div className="relative"><input type="text" placeholder="Hỏi AI bất kỳ điều gì..." className="w-full bg-white border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold pr-16 shadow-sm focus:ring-4 focus:ring-primary/5" /><button className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center"><span className="material-symbols-outlined">send</span></button></div></div>
        </div>
      )}
    </div>
  );
};

export default MeetingDetail;
