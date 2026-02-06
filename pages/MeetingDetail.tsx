
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";

// Declare globals from CDN
declare var mammoth: any;
declare var pdfjsLib: any;

interface MeetingDetailProps {
  onBack: () => void;
}

interface Document {
  id: string;
  name: string;
  type: 'report' | 'pdf' | 'docx' | 'xlsx';
  size: string;
  url?: string;
  pageCount?: number;
}

// Mock Data
const documents: Document[] = [
  { id: '1', name: 'Báo cáo Tài chính Q3.report', type: 'report', size: 'N/A', pageCount: 24 },
  { id: '2', name: 'Nghị quyết ĐHCD.pdf', type: 'pdf', size: '2.4 MB', url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf' },
  { id: '3', name: 'Kế hoạch nhân sự 2024.docx', type: 'docx', size: '856 KB' },
];

const dataBar = [
  { name: 'T1', val: 40 }, { name: 'T2', val: 60 }, { name: 'T3', val: 50 }, { name: 'T4', val: 80 }, { name: 'T5', val: 95 },
];
const dataPie = [
  { name: 'Chi phí', value: 70 }, { name: 'Lợi nhuận', value: 30 },
];
const COLORS = ['#6366f1', '#e0e7ff'];

const MeetingDetail: React.FC<MeetingDetailProps> = ({ onBack }) => {
  const [activeDoc, setActiveDoc] = useState<Document>(documents[0]);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [showAi, setShowAi] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const handleAiSummary = async () => {
    setAiLoading(true);
    setShowAi(true);
    setAiResponse("");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const prompt = `Bạn là một trợ lý AI doanh nghiệp. Hãy tóm tắt 3 điểm chính từ tài liệu: ${activeDoc.name}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { systemInstruction: "Trả lời bằng tiếng Việt, markdown chuyên nghiệp." }
      });

      setAiResponse(response.text || "Không có phản hồi.");
    } catch (error) {
      setAiResponse("Lỗi kết nối AI.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      if (activeDoc.type === 'docx') {
        // Mock docx render
        setTimeout(() => {
          setDocxHtml(`<div class="docx-content"><h1>${activeDoc.name}</h1><p>Nội dung kế hoạch chi tiết cho năm 2024...</p></div>`);
          setLoading(false);
        }, 500);
      } else if (activeDoc.type === 'pdf' && activeDoc.url) {
        try {
          const loadingTask = pdfjsLib.getDocument(activeDoc.url);
          const pdf = await loadingTask.promise;
          
          if (pdfContainerRef.current) {
            const container = pdfContainerRef.current;
            container.innerHTML = '';
            for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) { // Render 5 pages max for speed
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: zoom * 1.5 });
              const canvas = document.createElement('canvas');
              const wrapper = document.createElement('div');
              wrapper.className = 'pdf-page-wrapper mb-6 mx-auto';
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              wrapper.appendChild(canvas);
              container.appendChild(wrapper);
              await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
            }
          }
        } catch (e) {
          console.error(e);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    loadContent();
  }, [activeDoc, zoom]);

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center h-full"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>;

    switch (activeDoc.type) {
      case 'report':
        return (
          <div className="w-full max-w-4xl bg-white shadow-soft rounded p-12 mx-auto my-8">
            <h1 className="text-3xl font-bold mb-8">{activeDoc.name}</h1>
            <div className="grid grid-cols-2 gap-8 mb-10 h-64">
                <ResponsiveContainer><BarChart data={dataBar}><XAxis dataKey="name" hide /><Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                <ResponsiveContainer><PieChart><Pie data={dataPie} innerRadius={40} outerRadius={60} dataKey="value">{dataPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie></PieChart></ResponsiveContainer>
            </div>
          </div>
        );
      case 'pdf':
        return <div ref={pdfContainerRef} className="pdf-canvas-container" />;
      case 'docx':
        return <div className="w-full h-full p-8 flex justify-center"><div className="bg-white shadow-soft w-full max-w-[850px] p-12" dangerouslySetInnerHTML={{ __html: docxHtml || '' }} /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-[#101922] h-screen flex flex-col overflow-hidden relative">
      {showAi && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-[#18232e] shadow-2xl z-50 border-l border-slate-200 flex flex-col transition-all duration-300">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="font-bold flex items-center gap-2"><span className="material-symbols-outlined fill text-primary">smart_toy</span> AI Summary</span>
            <button onClick={() => setShowAi(false)}><span className="material-symbols-outlined">close</span></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed whitespace-pre-wrap">
            {aiLoading ? <div className="animate-pulse space-y-3"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="h-4 bg-slate-200 rounded w-full"></div></div> : aiResponse}
          </div>
        </div>
      )}

      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><span className="material-symbols-outlined">arrow_back</span></button>
          <h2 className="text-lg font-bold">{activeDoc.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAiSummary} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all">
            <span className="material-symbols-outlined fill text-[20px]">smart_toy</span> AI Assistant
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b font-bold text-xs uppercase text-slate-500">Tài liệu họp</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {documents.map((doc) => (
              <div key={doc.id} onClick={() => setActiveDoc(doc)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${activeDoc.id === doc.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 text-slate-600'}`}>
                <span className="material-symbols-outlined text-[20px]">{doc.type === 'pdf' ? 'picture_as_pdf' : 'description'}</span>
                <span className="text-sm font-bold truncate">{doc.name}</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex-1 overflow-auto bg-slate-200/50">
          <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b p-2 flex justify-center z-10">
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                  <button onClick={() => setZoom(z => Math.max(0.5, z-0.1))} className="p-1"><span className="material-symbols-outlined text-sm">zoom_out</span></button>
                  <span className="text-[10px] font-bold min-w-[30px] text-center">{Math.round(zoom*100)}%</span>
                  <button onClick={() => setZoom(z => Math.min(2, z+0.1))} className="p-1"><span className="material-symbols-outlined text-sm">zoom_in</span></button>
              </div>
          </div>
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default MeetingDetail;
