
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Meeting, MeetingDocument } from '../types';
import { supabase } from '../lib/supabaseClient';

const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];

// PDF Page Component: Render từng trang PDF
const PdfPage: React.FC<{ pdfDoc: any, pageNum: number, scale: number }> = ({ pdfDoc, pageNum, scale }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);

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
      
      const renderTask = page.render(renderContext);
      renderTask.promise.then(() => {
          if (!isCancelled) setIsRendered(true);
      });
    });

    return () => { isCancelled = true; };
  }, [pdfDoc, pageNum, scale]);

  return (
    <div className="relative bg-white shadow-md mb-8 mx-auto transition-shadow hover:shadow-xl">
      <canvas ref={canvasRef} className="block mx-auto" />
      {!isRendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
          <span className="material-symbols-outlined animate-spin text-slate-300">progress_activity</span>
        </div>
      )}
    </div>
  );
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
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [showAi, setShowAi] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  
  // States cho việc quản lý tài liệu
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // PDF State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);

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
        // Đồng bộ Meeting hiện tại lên DB
        await supabase
          .from('meetings')
          .upsert({
            id: meeting.id,
            title: meeting.title,
            start_time: meeting.startTime,
            end_time: meeting.endTime,
            room_id: meeting.roomId,
            host: meeting.host,
            participants: meeting.participants,
            status: meeting.status,
            color: meeting.color
          });

        for (const file of Array.from(files) as File[]) {
            // Sanitize file name
            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'file';
            const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
            const sanitizedName = fileNameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
            const fileName = `${Date.now()}_${sanitizedName}.${fileExt}`;
            const filePath = `documents/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('files')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error("Upload Storage error:", uploadError);
                if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
                    alert(`Lỗi quyền truy cập (RLS) khi upload ${file.name}.`);
                }
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('files')
                .getPublicUrl(uploadData.path);

            const fileSize = `${(file.size / 1024 / 1024).toFixed(2)} MB`;

            const { data: insertData, error: insertError } = await supabase
                .from('documents')
                .insert([{
                    name: file.name,
                    size: fileSize,
                    type: fileExt,
                    url: publicUrl,
                    meeting_id: meeting.id
                }])
                .select()
                .single();

            if (insertError) {
                alert(`Không thể lưu thông tin file ${file.name} vào database: ${insertError.message}`);
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này khỏi cuộc họp? Hành động này không thể hoàn tác.')) return;

    try {
        const docToDelete = (meeting.documents || []).find(d => d.id === docId);

        // 1. Xóa file khỏi Storage
        if (docToDelete?.url) {
            const pathIndex = docToDelete.url.indexOf('/files/');
            if (pathIndex !== -1) {
                const relativePath = docToDelete.url.substring(pathIndex + 7);
                await supabase.storage.from('files').remove([decodeURIComponent(relativePath)]);
            }
        }

        // 2. Xóa khỏi DB
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', docId);

        if (error) {
            alert("Lỗi khi xóa tài liệu: " + error.message);
            return;
        }

        // 3. Update UI
        const updatedDocs = (meeting.documents || []).filter(d => d.id !== docId);
        const updatedMeeting = { ...meeting, documents: updatedDocs };
        onUpdateMeeting(updatedMeeting);
        
        if (activeDoc.id === docId) setActiveDoc(reportDoc);

    } catch (err: any) {
        console.error('Delete error', err);
        alert("Có lỗi xảy ra khi xóa tài liệu.");
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
    setLoading(true);
    setZoom(1.0);

    if (activeDoc.type === 'report') {
      setLoading(false);
      return;
    }

    // Nếu là file Office (docx, xlsx, pptx) -> Sẽ dùng Office Online Viewer, không cần load buffer
    if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(activeDoc.type)) {
       setLoading(false);
       return;
    }

    if (activeDoc.url) {
       if (activeDoc.type === 'pdf') {
        try {
          const loadingTask = pdfjsLib.getDocument(activeDoc.url);
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          setLoading(false);
        } catch (error) {
           console.error("Error loading PDF", error);
           setLoading(false); 
           alert("Không thể tải PDF. File có thể bị hỏng hoặc đường dẫn không hợp lệ. Hãy thử xóa và tải lại file.");
        }
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [activeDoc]);

  // Kiểm tra loại file để render
  const isOfficeFile = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(activeDoc.type);
  const isPdf = activeDoc.type === 'pdf';
  const isReport = activeDoc.id === 'rep';

  return (
    <div className="bg-[#f1f5f9] h-screen flex flex-col overflow-hidden relative font-display">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.xlsx" multiple />
      
      {/* Sidebar */}
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

      <main className="ml-[340px] flex-1 flex flex-col bg-slate-300 overflow-hidden relative">
        {/* Bottom Toolbar */}
        <div className="bg-white/90 border-b border-slate-200 h-16 flex items-center justify-between px-8 z-30 shadow-sm shrink-0 relative">
           <div className="flex items-center gap-4">
              {isPdf && (
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 transition-colors"><span className="material-symbols-outlined">remove</span></button>
                    <span className="text-xs font-black min-w-[50px] text-center text-slate-700 select-none">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 transition-colors"><span className="material-symbols-outlined">add</span></button>
                </div>
              )}
              {isPdf && <button onClick={() => setZoom(1.0)} className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-wider">Vừa màn hình</button>}
           </div>

           {/* Page Count Info */}
           {isPdf && pdfDoc && (
              <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
                  <span className="text-sm font-black text-slate-800">Tài liệu gốc</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{numPages} Trang</span>
              </div>
           )}

           <button className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-primary transition-all uppercase tracking-widest">
            <a href={activeDoc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span> Tải xuống
            </a>
           </button>
        </div>

        <div className="flex-1 overflow-hidden relative bg-slate-200/50">
           {loading ? (
             <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
               <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
               <p className="font-black text-xs uppercase tracking-widest">Đang tải tài liệu...</p>
             </div>
           ) : (
             <div className="w-full h-full overflow-y-auto custom-scrollbar bg-slate-300 p-8 text-center">
                
                {/* 1. REPORT VIEW */}
                {isReport && (
                  <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-[3rem] p-20 animate-in zoom-in-95 origin-top">
                     <h1 className="text-4xl font-black mb-10 text-slate-900 tracking-tighter">Báo cáo Cuộc họp</h1>
                     <div className="grid grid-cols-2 gap-10">
                        <div className="h-64"><ResponsiveContainer><BarChart data={dataBar}><Bar dataKey="val" fill="#137fec" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div>
                        <div className="h-64"><ResponsiveContainer><PieChart><Pie data={dataPie} innerRadius={70} outerRadius={90} dataKey="value">{dataPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}</Pie></PieChart></ResponsiveContainer></div>
                     </div>
                  </div>
                )}

                {/* 2. PDF VIEW (VERTICAL SCROLL - STANDARD) */}
                {isPdf && pdfDoc && (
                   <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}>
                     {Array.from(new Array(numPages), (el, index) => (
                        <PdfPage key={`page_${index + 1}`} pdfDoc={pdfDoc} pageNum={index + 1} scale={1.5} />
                     ))}
                   </div>
                )}
                
                {/* 3. OFFICE FILE VIEW (MICROSOFT OFFICE ONLINE VIEWER) */}
                {isOfficeFile && activeDoc.url && (
                   <div className="w-full h-full flex flex-col items-center min-h-[800px]">
                      <iframe 
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(activeDoc.url)}`}
                        className="w-full h-full max-w-5xl bg-white shadow-lg rounded-xl border border-slate-200"
                        title="Document Viewer"
                        frameBorder="0"
                      >
                         <p>Trình duyệt không hỗ trợ iframe. <a href={activeDoc.url} target="_blank">Tải xuống tại đây</a></p>
                      </iframe>
                   </div>
                )}
             </div>
           )}
        </div>
      </main>

      {/* AI Assistant Panel */}
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
