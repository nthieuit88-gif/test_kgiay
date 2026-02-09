
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Meeting, MeetingDocument } from '../types';
import { supabase } from '../lib/supabaseClient';

const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
const mammoth = (window as any).mammoth;

// Ensure worker is set if not already
if (pdfjsLib && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const PdfPage: React.FC<{ pdfDoc: any, pageNum: number, scale: number }> = ({ pdfDoc, pageNum, scale }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let isCancelled = false;
    
    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;
        
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = { canvasContext: context, viewport: viewport };
        await page.render(renderContext).promise;
        
        if (!isCancelled) setIsRendered(true);
      } catch (error) {
        console.error("Error rendering page", pageNum, error);
      }
    };

    renderPage();
    return () => { isCancelled = true; };
  }, [pdfDoc, pageNum, scale]);

  return (
    <div className="relative bg-white shadow-md mb-8 mx-auto transition-shadow hover:shadow-xl">
      <canvas ref={canvasRef} className="block mx-auto" />
      {!isRendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 border border-slate-100">
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
  isAdmin: boolean;
}

const COLORS = ['#137fec', '#e2e8f0'];
const dataBar = [{ name: 'T1', val: 40 }, { name: 'T2', val: 60 }, { name: 'T3', val: 50 }, { name: 'T4', val: 80 }, { name: 'T5', val: 95 }];
const dataPie = [{ name: 'Chi phí', value: 70 }, { name: 'Lợi nhuận', value: 30 }];

const MeetingDetail: React.FC<MeetingDetailProps> = ({ meeting, onUpdateMeeting, onBack, isAdmin }) => {
  const availableDocs = meeting.documents || [];
  const reportDoc: any = { id: 'rep', name: 'Báo cáo phân tích hệ thống', type: 'report', size: 'N/A' };
  
  const [activeDoc, setActiveDoc] = useState<any>(availableDocs.length > 0 ? availableDocs[0] : reportDoc);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [showAi, setShowAi] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // State for Add Document Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [repositoryDocs, setRepositoryDocs] = useState<MeetingDocument[]>([]);
  const [selectedRepoDocs, setSelectedRepoDocs] = useState<string[]>([]);
  const [isLinking, setIsLinking] = useState(false);

  // State for Viewers
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [docxContent, setDocxContent] = useState<string>('');

  const fetchRepositoryDocs = async () => {
      // Fetch documents (simulating a repository fetch)
      // We check for documents that are NOT in the current meeting (by checking URL duplication to avoid same file appearing)
      const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (data) {
          const currentUrls = new Set(availableDocs.map(d => d.url));
          // Filter out docs that have the same URL as existing docs in this meeting
          const filtered = data.filter((d: any) => !currentUrls.has(d.url)); 
          setRepositoryDocs(filtered);
      }
  };

  useEffect(() => {
      if (showAddModal) {
          fetchRepositoryDocs();
          setSelectedRepoDocs([]);
      }
  }, [showAddModal]);

  const handleLinkDocuments = async () => {
      if (selectedRepoDocs.length === 0) return;
      setIsLinking(true);
      try {
          const docsToLink = repositoryDocs.filter(d => selectedRepoDocs.includes(d.id));
          
          // Clone metadata to link to this meeting
          const newDocsPayload = docsToLink.map(d => ({
              name: d.name,
              size: d.size,
              type: d.type,
              url: d.url, // Keep same URL
              meeting_id: meeting.id 
          }));

          const { data, error } = await supabase.from('documents').insert(newDocsPayload).select();
          
          if (error) throw error;

          if (data) {
              const updatedMeeting = { ...meeting, documents: [...availableDocs, ...data] };
              onUpdateMeeting(updatedMeeting);
              // If currently viewing report, switch to first new doc
              if (activeDoc.id === 'rep' && data.length > 0) {
                  setActiveDoc(data[0]);
              }
              setShowAddModal(false);
          }
      } catch (e) {
          console.error(e);
          alert("Lỗi khi thêm tài liệu từ kho.");
      } finally {
          setIsLinking(false);
      }
  };

  const toggleRepoDocSelection = (id: string) => {
      if (selectedRepoDocs.includes(id)) {
          setSelectedRepoDocs(selectedRepoDocs.filter(d => d !== id));
      } else {
          setSelectedRepoDocs([...selectedRepoDocs, id]);
      }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const newDocs: MeetingDocument[] = [];
    try {
        await supabase.from('meetings').upsert({
            id: meeting.id, title: meeting.title, start_time: meeting.startTime,
            end_time: meeting.endTime, room_id: meeting.roomId, host: meeting.host,
            participants: meeting.participants, status: meeting.status, color: meeting.color
        });
        
        for (const file of Array.from(files) as File[]) {
            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'file';
            const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
            const filePath = `documents/${fileName}`;
            const { data: uploadData } = await supabase.storage.from('files').upload(filePath, file);
            if (uploadData) {
                const { data: { publicUrl } } = supabase.storage.from('files').getPublicUrl(uploadData.path);
                const { data: insertData } = await supabase.from('documents').insert([{
                    name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                    type: fileExt, url: publicUrl, meeting_id: meeting.id
                }]).select().single();
                if (insertData) newDocs.push(insertData as MeetingDocument);
            }
        }
        if (newDocs.length > 0) {
            const updatedMeeting = { ...meeting, documents: [...(meeting.documents || []), ...newDocs] };
            onUpdateMeeting(updatedMeeting);
            setActiveDoc(newDocs[0]);
            setShowAddModal(false); // Close modal if open
        }
    } catch (e) {
      console.error(e);
      alert("Lỗi tải lên tệp.");
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDoc = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (!isAdmin || !window.confirm('Xóa tài liệu khỏi cuộc họp?')) return;
    try {
        const docToDelete = (meeting.documents || []).find(d => d.id === docId);
        if (docToDelete?.url) {
            const pathIndex = docToDelete.url.indexOf('/files/');
            if (pathIndex !== -1) {
                const relativePath = docToDelete.url.substring(pathIndex + 7);
                await supabase.storage.from('files').remove([decodeURIComponent(relativePath)]);
            }
        }
        await supabase.from('documents').delete().eq('id', docId);
        const updatedDocs = (meeting.documents || []).filter(d => d.id !== docId);
        onUpdateMeeting({ ...meeting, documents: updatedDocs });
        if (activeDoc.id === docId) setActiveDoc(reportDoc);
    } catch (err) { alert("Lỗi khi xóa tài liệu."); }
  };

  const startEdit = (e: React.MouseEvent, doc: MeetingDocument) => {
    e.stopPropagation();
    if (!isAdmin) return;
    setEditingDocId(doc.id);
    setEditName(doc.name);
  };

  const saveEdit = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation(); e.preventDefault();
    if (!editingDocId || !isAdmin) return;
    const updatedDocs = (meeting.documents || []).map(d => d.id === editingDocId ? { ...d, name: editName } : d);
    onUpdateMeeting({ ...meeting, documents: updatedDocs });
    if (activeDoc.id === editingDocId) setActiveDoc({ ...activeDoc, name: editName });
    setEditingDocId(null);
  };

  const handleAiSummary = async () => {
    setAiLoading(true); setShowAi(true); setAiResponse("");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Hãy tóm tắt nội dung chính của tài liệu có tên: "${activeDoc.name}".`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiResponse(response.text || "Không thể tạo tóm tắt.");
    } catch {
      setAiResponse("AI Assistant đang bận hoặc gặp lỗi kết nối. Vui lòng thử lại sau.");
    } finally { setAiLoading(false); }
  };

  const loadContent = async () => {
    setPdfDoc(null); 
    setNumPages(0); 
    setDocxContent(''); 
    setErrorMsg(null);
    setLoading(true); 
    setZoom(1.0);

    if (activeDoc.type === 'report') { setLoading(false); return; }
    if (['xlsx', 'pptx'].includes(activeDoc.type)) { setLoading(false); return; } 

    try {
      if (!activeDoc.url) throw new Error("Đường dẫn tệp không tồn tại.");

      let fetchUrl = activeDoc.url;
      // Handle potential encoding issues for Supabase URLs
      if (!fetchUrl.startsWith('blob:') && !fetchUrl.includes('%')) {
          try {
             fetchUrl = encodeURI(fetchUrl);
          } catch (e) {
             console.warn("Could not encode URL", e);
          }
      }

      if (activeDoc.type === 'pdf') {
          if (!pdfjsLib) throw new Error("Thư viện PDF chưa tải xong.");
          const loadingTask = pdfjsLib.getDocument(fetchUrl);
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf); 
          setNumPages(pdf.numPages);
      } else if (activeDoc.type === 'docx' && mammoth) {
          const response = await fetch(fetchUrl);
          if (!response.ok) {
            throw new Error(`Không thể tải tệp tin (HTTP ${response.status})`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const arr = new Uint8Array(arrayBuffer).subarray(0, 2);
          if (arr[0] !== 0x50 || arr[1] !== 0x4B) {
             throw new Error("File không đúng định dạng DOCX (Invalid ZIP header)");
          }

          const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
          if (!result.value && result.messages.length > 0) {
             console.warn("Mammoth messages:", result.messages);
          }
          setDocxContent(result.value || "<p>Không có nội dung văn bản.</p>");
      } else {
        throw new Error("Định dạng tệp không được hỗ trợ hiển thị trực tiếp.");
      }
    } catch (error: any) {
       console.error("Error loading document:", error);
       let message = "Có lỗi khi tải tài liệu.";
       if (error.message.includes("Can't find end of central directory")) {
          message = "Tệp DOCX bị lỗi hoặc không đúng định dạng.";
       } else if (error.message.includes("HTTP")) {
          message = error.message;
       } else {
          message = error.message;
       }
       setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContent(); }, [activeDoc]);

  const isOfficeFile = ['xlsx', 'pptx'].includes(activeDoc.type);
  const isDocx = activeDoc.type === 'docx';
  const isPdf = activeDoc.type === 'pdf';
  const isReport = activeDoc.id === 'rep';

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
           {isAdmin && (
             <button onClick={() => setShowAddModal(true)} className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-primary text-white rounded-xl shadow-glow-blue hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50">
                {isUploading ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : <span className="material-symbols-outlined text-[20px]">add</span>}
             </button>
           )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div onClick={() => setActiveDoc(reportDoc)} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${activeDoc.id === 'rep' ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-50 hover:border-slate-200'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeDoc.id === 'rep' ? 'bg-primary text-white' : 'bg-slate-100'}`}><span className="material-symbols-outlined">analytics</span></div>
            <p className="text-sm font-black truncate">Dashboard Phân tích</p>
          </div>

          {availableDocs.map((doc) => (
            <div key={doc.id} onClick={() => setActiveDoc(doc)} className={`group relative flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${activeDoc.id === doc.id ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-50 hover:border-slate-200 hover:shadow-sm'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeDoc.id === doc.id ? 'bg-primary text-white' : 'bg-slate-100'}`}>
                <span className="material-symbols-outlined">
                  {doc.type === 'pdf' ? 'picture_as_pdf' : doc.type === 'docx' ? 'article' : 'description'}
                </span>
              </div>
              <div className="flex-1 overflow-hidden min-w-0">
                {editingDocId === doc.id ? (
                  <form onSubmit={saveEdit} onClick={e => e.stopPropagation()} className="flex items-center gap-2">
                    <input autoFocus className="w-full text-xs font-bold bg-white border border-primary rounded px-2 py-1 outline-none" value={editName} onChange={e => setEditName(e.target.value)} onBlur={saveEdit} />
                  </form>
                ) : (
                  <>
                    <p className="text-sm font-black truncate text-slate-800">{doc.name}</p>
                    <p className="text-[9px] font-black uppercase opacity-40 mt-1">{doc.type} • {doc.size}</p>
                  </>
                )}
              </div>
              {isAdmin && (
                <div className={`flex items-center gap-1 ${editingDocId === doc.id ? 'hidden' : 'opacity-0 group-hover:opacity-100'} transition-opacity absolute right-2 bg-white/90 p-1 rounded-lg shadow-sm border border-slate-100`}>
                  <button onClick={(e) => startEdit(e, doc)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                  <button onClick={(e) => handleDeleteDoc(e, doc.id)} className="p-1.5 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-500 transition-colors"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <header className="ml-[340px] h-24 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-12 sticky top-0 z-40">
        <div className="flex flex-col max-w-2xl"><h2 className="text-2xl font-black text-slate-900 truncate">{activeDoc.name}</h2><div className="flex items-center gap-3 mt-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{meeting.title}</span></div></div>
        <button onClick={handleAiSummary} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-xs shadow-glow-blue active:scale-95 transition-all flex items-center gap-3 shrink-0"><span className="material-symbols-outlined fill">smart_toy</span> Phân tích AI</button>
      </header>

      <main className="ml-[340px] flex-1 flex flex-col bg-slate-300 overflow-hidden relative">
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
           ) : errorMsg ? (
             <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
               <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                 <span className="material-symbols-outlined text-[32px]">error</span>
               </div>
               <div className="text-center">
                 <h3 className="text-lg font-black text-slate-800 mb-1">Không thể hiển thị tài liệu</h3>
                 <p className="text-sm text-slate-500 font-medium mb-6">{errorMsg}</p>
                 <a href={activeDoc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                   <span className="material-symbols-outlined text-[18px]">download</span> Tải về thiết bị
                 </a>
               </div>
             </div>
           ) : (
             <div className="w-full h-full overflow-y-auto custom-scrollbar bg-slate-300 p-8 text-center">
                {isReport && (
                  <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-[3rem] p-20 animate-in zoom-in-95 origin-top">
                     <h1 className="text-4xl font-black mb-10 text-slate-900 tracking-tighter">Báo cáo Cuộc họp</h1>
                     <div className="grid grid-cols-2 gap-10">
                        <div className="h-64"><ResponsiveContainer><BarChart data={dataBar}><Bar dataKey="val" fill="#137fec" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div>
                        <div className="h-64"><ResponsiveContainer><PieChart><Pie data={dataPie} innerRadius={70} outerRadius={90} dataKey="value">{dataPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}</Pie></PieChart></ResponsiveContainer></div>
                     </div>
                  </div>
                )}
                
                {isPdf && pdfDoc && (
                   <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}>
                     {Array.from(new Array(numPages), (el, index) => (
                        <PdfPage key={`page_${index + 1}`} pdfDoc={pdfDoc} pageNum={index + 1} scale={1.5} />
                     ))}
                   </div>
                )}

                {isDocx && docxContent && (
                   <div className="w-full max-w-5xl mx-auto bg-white shadow-2xl rounded-xl p-12 min-h-[800px] docx-content-render text-left animate-in fade-in zoom-in-95 duration-300" dangerouslySetInnerHTML={{__html: docxContent}} />
                )}

                {isOfficeFile && activeDoc.url && (
                   <div className="w-full h-full flex flex-col items-center min-h-[800px]">
                      <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(activeDoc.url)}`} className="w-full h-full max-w-5xl bg-white shadow-lg rounded-xl border border-slate-200" title="Viewer" frameBorder="0" />
                   </div>
                )}
             </div>
           )}
        </div>
      </main>

       {/* Add Document Modal */}
       {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                       <span className="material-symbols-outlined text-[24px]">library_add</span>
                    </div>
                    <div>
                       <h2 className="text-lg font-black text-slate-900">Thêm tài liệu</h2>
                       <p className="text-xs text-slate-500 font-bold">Tải lên hoặc chọn từ kho tài liệu chung</p>
                    </div>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><span className="material-symbols-outlined text-slate-400">close</span></button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                 {/* Option 1: Upload New */}
                 <div onClick={() => fileInputRef.current?.click()} className="group border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 rounded-2xl p-6 cursor-pointer flex items-center gap-4 transition-all">
                     <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-white group-hover:shadow-md flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">cloud_upload</span>
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">Tải lên tài liệu mới</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Hỗ trợ PDF, Word, Excel (Max 50MB)</p>
                     </div>
                     <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-primary">arrow_forward</span>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Hoặc chọn từ kho</span>
                    <div className="h-px bg-slate-100 flex-1"></div>
                 </div>

                 {/* Option 2: Select from Repository */}
                 <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 text-sm">Kho tài liệu sẵn có</h3>
                    {repositoryDocs.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">folder_off</span>
                            <p className="text-xs font-bold text-slate-400">Không tìm thấy tài liệu nào khác trong kho.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {repositoryDocs.map(doc => (
                                <div 
                                    key={doc.id} 
                                    onClick={() => toggleRepoDocSelection(doc.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedRepoDocs.includes(doc.id) ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                >
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedRepoDocs.includes(doc.id) ? 'bg-primary border-primary' : 'bg-white border-slate-300'}`}>
                                        {selectedRepoDocs.includes(doc.id) && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                        <span className="material-symbols-outlined text-[18px]">description</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate">{doc.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{doc.size} • {new Date().toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                 <button onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all text-xs">Hủy bỏ</button>
                 <button 
                    onClick={handleLinkDocuments}
                    disabled={selectedRepoDocs.length === 0 || isLinking}
                    className={`px-8 py-3 rounded-xl font-bold text-white text-xs transition-all flex items-center gap-2 ${selectedRepoDocs.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-primary hover:bg-blue-600 shadow-glow-blue'}`}
                 >
                    {isLinking ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">add_link</span>}
                    Thêm {selectedRepoDocs.length > 0 ? `${selectedRepoDocs.length} tài liệu` : ''}
                 </button>
              </div>
           </div>
        </div>
       )}

       {/* AI Modal Overlay */}
       {showAi && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
                       <span className="material-symbols-outlined fill text-[20px]">smart_toy</span>
                    </div>
                    <div>
                       <h2 className="text-lg font-black text-slate-900">AI Assistant</h2>
                       <p className="text-xs text-slate-500 font-bold">Phân tích nội dung tài liệu</p>
                    </div>
                 </div>
                 <button onClick={() => setShowAi(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-slate-400">close</span></button>
              </div>
              <div className="p-8 overflow-y-auto">
                 {aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                       <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                       <p className="text-sm font-bold text-slate-400 animate-pulse">Đang phân tích dữ liệu...</p>
                    </div>
                 ) : (
                    <div className="prose prose-sm prose-slate max-w-none">
                       <p className="text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">{aiResponse}</p>
                    </div>
                 )}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                 <button onClick={() => setShowAi(false)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all">Đóng</button>
              </div>
           </div>
        </div>
       )}
    </div>
  );
};

export default MeetingDetail;
