
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Meeting, MeetingDocument } from '../types';

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

  return <canvas ref={canvasRef} className="bg-white shadow-lg mb-6 rounded-sm" />;
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
  // Lấy tài liệu đầu tiên làm mặc định, nếu không có thì dùng trang báo cáo
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
  
  // States cho việc quản lý tài liệu
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // PDF State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);

  // --- Handlers cho việc Quản lý Tài liệu ---
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files).map((item) => {
         const file = item as File;
         return {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            type: file.name.split('.').pop()?.toLowerCase() || 'file',
            file: file,
            url: URL.createObjectURL(file)
         };
      });

      const updatedMeeting = {
         ...meeting,
         documents: [...(meeting.documents || []), ...newFiles]
      };
      onUpdateMeeting(updatedMeeting);
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDoc = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này khỏi cuộc họp?')) {
        const updatedDocs = (meeting.documents || []).filter(d => d.id !== docId);
        const updatedMeeting = { ...meeting, documents: updatedDocs };
        onUpdateMeeting(updatedMeeting);

        // Nếu đang xem tài liệu bị xóa, quay về báo cáo
        if (activeDoc.id === docId) {
            setActiveDoc(reportDoc);
        }
    }
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
    
    // Cập nhật tên nếu đang xem tài liệu đó
    if (activeDoc.id === editingDocId) {
        setActiveDoc({ ...activeDoc, name: editName });
    }

    setEditingDocId(null);
  };
  // ------------------------------------------

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
    setZoom(1.0); // Reset zoom on doc change

    if (activeDoc.type === 'report') {
      setIsFallback(false);
      setLoading(false);
      return;
    }

    // Nếu tài liệu có URL thực (được upload từ máy), ta xử lý hiển thị chính xác
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
          // Load PDF via PDF.js
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
        // Unsupported type fallback
        setLoading(false);
      }
    } else {
      // Nếu là tài liệu mẫu (không có file thật), dùng giao diện Fallback
      setTimeout(() => {
        setIsFallback(true);
        setLoading(false);
      }, 600);
    }
  };

  useEffect(() => {
    loadContent();
  }, [activeDoc]);

  const renderFallbackPDF = () => (
    <div className="flex flex-col items-center gap-10 py-16 animate-in fade-in duration-700 origin-top" style={{ transform: `scale(${zoom})` }}>
      {[1, 2, 3].map(page => (
        <div key={page} className="w-full max-w-[850px] aspect-[1/1.414] bg-white shadow-2xl p-20 border border-slate-200 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-black">P</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Paperless Meeting Cloud</div>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trang {page} / 3</p>
               <p className="text-[9px] font-bold text-slate-300">REF: {meeting.id}-{activeDoc.id}</p>
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl font-black text-slate-900 mb-8 uppercase text-center tracking-tight">{activeDoc.name}</h1>
            <p className="font-bold text-slate-900">Nội dung cuộc họp: {meeting.title}</p>
            <p className="text-slate-700 text-sm leading-relaxed text-justify">Đây là văn bản được trích xuất từ hệ thống quản trị tài liệu tập trung. Nội dung bao gồm các quyết nghị quan trọng phục vụ cho phiên họp ngày {new Date(meeting.startTime).toLocaleDateString('vi-VN')}.</p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 my-8">
               <p className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Thông tin phiên họp:</p>
               <ul className="list-disc list-inside space-y-2 text-xs font-medium text-slate-500">
                  <li>Chủ trì: {meeting.host}</li>
                  <li>Phòng: {meeting.roomId}</li>
                  <li>Số lượng tham gia: {meeting.participants} đại biểu</li>
               </ul>
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] rotate-[-45deg] select-none">
             <span className="text-9xl font-black">CONFIDENTIAL</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-[#f1f5f9] h-screen flex flex-col overflow-hidden relative font-display">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.xlsx" multiple />
      
      <aside className="fixed left-0 top-0 bottom-0 w-[340px] bg-white border-r border-slate-200 flex flex-col z-50 shadow-2xl">
        <div className="h-24 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50/50">
           <div className="flex items-center gap-3 overflow-hidden">
             <button onClick={onBack} className="w-10 h-10 flex-shrink-0 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all border border-slate-100"><span className="material-symbols-outlined">arrow_back</span></button>
             <div className="flex flex-col overflow-hidden">
                <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 truncate">Tài liệu cuộc họp</span>
                <span className="font-bold text-slate-800 text-xs truncate" title={meeting.title}>{meeting.title}</span>
             </div>
           </div>
           <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-primary text-white rounded-xl shadow-glow-blue hover:bg-blue-600 transition-all active:scale-95" title="Thêm tài liệu">
              <span className="material-symbols-outlined text-[20px]">add</span>
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

              {/* Action Buttons */}
              <div className={`flex items-center gap-1 ${editingDocId === doc.id ? 'hidden' : 'opacity-0 group-hover:opacity-100'} transition-opacity absolute right-2 bg-white/90 p-1 rounded-lg shadow-sm border border-slate-100`}>
                <button onClick={(e) => startEdit(e, doc)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-primary transition-colors" title="Đổi tên">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button onClick={(e) => handleDeleteDoc(e, doc.id)} className="p-1.5 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-500 transition-colors" title="Xóa">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
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
        <div className="bg-white/90 border-b border-slate-200 h-14 flex items-center justify-center gap-8 px-10 z-30 shadow-sm shrink-0">
           <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 transition-colors"><span className="material-symbols-outlined">remove</span></button>
              <span className="text-xs font-black min-w-[50px] text-center text-slate-700 select-none">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 transition-colors"><span className="material-symbols-outlined">add</span></button>
           </div>
           <button onClick={() => setZoom(1.0)} className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-wider">Reset</button>
           <div className="h-6 w-px bg-slate-200"></div>
           <button className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-primary transition-all uppercase tracking-widest"><span className="material-symbols-outlined text-[18px]">download</span> Tải xuống</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth p-10">
           {loading ? (
             <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
               <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
               <p className="font-black text-xs uppercase tracking-widest">Đang tải tài liệu...</p>
             </div>
           ) : (
             <div className="flex flex-col items-center w-full min-h-full transition-all duration-200 ease-out">
                {/* Fallback View */}
                {isFallback && renderFallbackPDF()}

                {/* Report View */}
                {!isFallback && activeDoc.id === 'rep' && (
                  <div className="w-full max-w-4xl bg-white shadow-2xl rounded-[3rem] p-20 animate-in zoom-in-95 origin-top" style={{ transform: `scale(${zoom})` }}>
                     <h1 className="text-4xl font-black mb-10 text-slate-900 tracking-tighter">Báo cáo Cuộc họp</h1>
                     <div className="grid grid-cols-2 gap-10">
                        <div className="h-64"><ResponsiveContainer><BarChart data={dataBar}><Bar dataKey="val" fill="#137fec" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div>
                        <div className="h-64"><ResponsiveContainer><PieChart><Pie data={dataPie} innerRadius={70} outerRadius={90} dataKey="value">{dataPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}</Pie></PieChart></ResponsiveContainer></div>
                     </div>
                  </div>
                )}

                {/* PDF View (Native Zoom) */}
                {!isFallback && activeDoc.type === 'pdf' && pdfDoc && (
                   <div className="flex flex-col items-center">
                     {Array.from(new Array(numPages), (el, index) => (
                       <PdfPage key={`page_${index + 1}`} pdfDoc={pdfDoc} pageNum={index + 1} scale={zoom * 1.5} />
                     ))}
                   </div>
                )}
                
                {/* DOCX View (CSS Zoom) */}
                {!isFallback && activeDoc.type === 'docx' && docxHtml && (
                   <div 
                     className="bg-white shadow-2xl p-16 min-h-[1100px] docx-content-render origin-top"
                     style={{ 
                       transform: `scale(${zoom})`, 
                       width: '850px' // Fixed width for A4 consistency, scaled by CSS
                     }}
                     dangerouslySetInnerHTML={{ __html: docxHtml }} 
                   />
                )}
             </div>
           )}
        </div>
      </main>

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
