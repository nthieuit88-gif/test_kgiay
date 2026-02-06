
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";

// Declare mammoth from global scope (added via CDN in index.html)
declare var mammoth: any;

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
  { id: '2', name: 'Nghị quyết ĐHCD.pdf', type: 'pdf', size: '2.4 MB', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { id: '3', name: 'Kế hoạch nhân sự 2024.docx', type: 'docx', size: '856 KB', url: '/sample.docx' },
  { id: '4', name: 'Phụ lục chi phí.xlsx', type: 'xlsx', size: '1.2 MB' },
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
  const [zoom, setZoom] = useState(100);
  const [showAi, setShowAi] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  const getDocContentText = (doc: Document) => {
    // In a real app, this would extract text from the actual file.
    // Here we use mock text for the Gemini prompt.
    if (doc.id === '1') return "Báo cáo tài chính Quý 3 cho thấy doanh thu tăng 15% nhưng chi phí marketing tăng 20%. Lợi nhuận gộp đạt 30%.";
    if (doc.id === '3') return "Kế hoạch nhân sự 2024 tập trung tuyển dụng 40 nhân sự mới, trong đó 15 người cho mảng IT và 20 người cho mảng Kinh doanh. Ngân sách tăng 15%.";
    return "Tài liệu cuộc họp quan trọng.";
  };

  const handleAiSummary = async () => {
    setAiLoading(true);
    setShowAi(true);
    setAiResponse("");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const prompt = `Bạn là một trợ lý AI chuyên nghiệp cho cuộc họp doanh nghiệp. Hãy tóm tắt nội dung sau một cách súc tích và đưa ra 3 điểm quan trọng nhất: ${getDocContentText(activeDoc)}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Trả lời bằng tiếng Việt chuyên nghiệp, lịch sự, định dạng markdown gọn gàng.",
        }
      });

      setAiResponse(response.text || "Không có phản hồi từ AI.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiResponse("Đã xảy ra lỗi khi kết nối với trợ lý AI. Vui lòng kiểm tra cấu hình API.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (activeDoc.type === 'docx') {
      setLoading(true);
      setTimeout(() => {
         const mockHtml = `
            <div class="docx-content">
                <h1 style="text-align: center;">KẾ HOẠCH NHÂN SỰ NĂM 2024</h1>
                <p style="text-align: center;"><em>(Dự thảo trình Hội đồng quản trị)</em></p>
                <h2>1. Mục tiêu chung</h2>
                <p>Xây dựng đội ngũ nhân sự chất lượng cao, đáp ứng chiến lược phát triển bền vững của Tập đoàn trong giai đoạn 2024-2025.</p>
                <h2>2. Chỉ tiêu tuyển dụng</h2>
                <table>
                    <thead><tr style="background-color: #f1f5f9;"><th>Bộ phận</th><th>Số lượng</th><th>Vị trí</th><th>Thời gian</th></tr></thead>
                    <tbody>
                        <tr><td>IT</td><td>15</td><td>Senior Dev</td><td>Quý 1</td></tr>
                        <tr><td>Kinh doanh</td><td>20</td><td>Sales Manager</td><td>Quý 2</td></tr>
                    </tbody>
                </table>
            </div>
         `;
         setDocxHtml(mockHtml);
         setLoading(false);
      }, 800);
    } else {
        setDocxHtml(null);
    }
  }, [activeDoc]);

  const renderContent = () => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
                <span className="text-sm font-medium">Đang xử lý tài liệu...</span>
            </div>
        );
    }

    switch (activeDoc.type) {
      case 'report':
        return (
            <div className="w-full max-w-4xl bg-white shadow-soft border border-slate-200/60 rounded min-h-[1200px] p-12 text-black relative mx-auto my-8 scale-[0.9] origin-top md:scale-100">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none">
                  <span className="text-8xl font-bold -rotate-45 text-slate-900">TÀI LIỆU MẬT</span>
                </div>
                <div className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end">
                  <h1 className="text-3xl font-bold text-slate-900">BÁO CÁO TÀI CHÍNH QUÝ 3</h1>
                  <span className="text-slate-500 font-mono text-sm">MÃ: TC-2023-Q3</span>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dataBar}><XAxis dataKey="name" hide /><Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 h-64 flex flex-col items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart><Pie data={dataPie} innerRadius={40} outerRadius={60} fill="#8884d8" paddingAngle={5} dataKey="value">{dataPie.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie></PieChart>
                      </ResponsiveContainer>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><span className="w-1.5 h-6 bg-primary rounded-full"></span> 1. Phân tích chi tiết</h3>
                <p className="text-slate-700 text-base leading-relaxed mb-4 text-justify">Trong quý vừa qua, công ty đã đạt được những bước tiến đáng kể trong việc tối ưu hóa quy trình vận hành. Tỷ suất lợi nhuận gộp tăng 5% so với cùng kỳ năm trước...</p>
            </div>
        );
      case 'pdf':
        return <div className="w-full h-full p-4 md:p-8 bg-slate-100 flex flex-col items-center"><div className="w-full max-w-5xl h-full shadow-lg rounded-lg overflow-hidden bg-white"><iframe src={`${activeDoc.url}#toolbar=0`} className="w-full h-full" title="PDF Viewer" /></div></div>;
      case 'docx':
        return <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-slate-100"><div className="max-w-[850px] mx-auto bg-white shadow-soft min-h-[1100px] p-12 md:p-16 text-black" style={{ zoom: zoom / 100 }}>{docxHtml ? <div dangerouslySetInnerHTML={{ __html: docxHtml }} /> : <p className="text-red-500">Không thể tải nội dung.</p>}</div></div>;
      default:
        return <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4"><div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center"><span className="material-symbols-outlined text-4xl">draft</span></div><button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2">Tải xuống ({activeDoc.size})</button></div>;
    }
  };

  return (
    <div className="bg-white dark:bg-[#101922] text-slate-800 dark:text-white font-display h-screen flex flex-col overflow-hidden relative">
      {/* AI Side Panel */}
      {showAi && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-[#18232e] shadow-2xl z-50 border-l border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 animate-slide-in">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-2 text-primary font-bold">
              <span className="material-symbols-outlined fill">smart_toy</span>
              <span>AI Assistant</span>
            </div>
            <button onClick={() => setShowAi(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {aiLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                <p className="whitespace-pre-wrap">{aiResponse}</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="relative">
              <input type="text" placeholder="Hỏi AI bất kỳ điều gì..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-lg"><span className="material-symbols-outlined text-[20px]">send</span></button>
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18232e] px-6 py-3 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-500 hover:text-primary transition-colors p-1 rounded-full hover:bg-slate-100"><span className="material-symbols-outlined">arrow_back</span></button>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Họp Hội đồng Quản trị Quý 3/2023</h2>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="flex h-2 w-2 relative"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-green-500"></span></span>
              <span className="text-green-600 font-semibold">Đang diễn ra</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleAiSummary} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all shadow-glow">
            <span className="material-symbols-outlined fill text-[20px]">smart_toy</span>
            AI Tóm tắt
          </button>
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-slate-200" style={{ backgroundImage: "url('https://i.pravatar.cc/150?u=tu')" }}></div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <aside className="w-80 bg-white dark:bg-[#18232e] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-10 hidden md:flex">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between"><h3 className="font-bold text-sm uppercase text-slate-500">Danh sách tài liệu</h3><span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">{documents.length}</span></div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} onClick={() => setActiveDoc(doc)} className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${activeDoc.id === doc.id ? 'bg-primary/5 border-primary/20 shadow-sm' : 'hover:bg-slate-50 border-transparent border'}`}>
                <span className="material-symbols-outlined text-[20px] text-slate-500">{doc.type === 'pdf' ? 'picture_as_pdf' : doc.type === 'report' ? 'bar_chart' : doc.type === 'docx' ? 'description' : 'table_chart'}</span>
                <div className="flex-1 min-w-0"><p className={`text-sm font-medium truncate ${activeDoc.id === doc.id ? 'text-primary font-bold' : 'text-slate-700'}`}>{doc.name}</p><p className="text-xs text-slate-500">{doc.size}</p></div>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex-1 bg-slate-100 dark:bg-[#0b0e12] flex flex-col relative overflow-hidden">
          <div className="h-12 bg-white dark:bg-[#18232e] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#111418] rounded-lg p-1">
              <button onClick={() => setZoom(prev => Math.max(50, prev - 10))} className="p-1"><span className="material-symbols-outlined text-[18px]">zoom_out</span></button>
              <span className="text-xs font-medium px-2 min-w-[3rem] text-center">{zoom}%</span>
              <button onClick={() => setZoom(prev => Math.min(200, prev + 10))} className="p-1"><span className="material-symbols-outlined text-[18px]">zoom_in</span></button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">{renderContent()}</div>
        </section>
      </main>

      <footer className="h-[88px] bg-white dark:bg-[#18232e] border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-center shrink-0 z-30 shadow-card">
        <button className="h-14 px-10 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg flex items-center gap-3 shadow-glow transition-all hover:scale-105 active:scale-95">
          <span className="material-symbols-outlined text-[24px]">how_to_vote</span>
          Biểu quyết Ngay
        </button>
      </footer>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MeetingDetail;
