import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  url?: string; // For real implementation, this would be a real URL
  pageCount?: number;
}

// Mock Data
const documents: Document[] = [
  { id: '1', name: 'Báo cáo Tài chính Q3.report', type: 'report', size: 'N/A', pageCount: 24 },
  { id: '2', name: 'Nghị quyết ĐHCD.pdf', type: 'pdf', size: '2.4 MB', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { id: '3', name: 'Kế hoạch nhân sự 2024.docx', type: 'docx', size: '856 KB', url: '/sample.docx' }, // We will mock the content for this
  { id: '4', name: 'Phụ lục chi phí.xlsx', type: 'xlsx', size: '1.2 MB' },
];

// Chart Data
const dataBar = [
  { name: 'T1', val: 40 },
  { name: 'T2', val: 60 },
  { name: 'T3', val: 50 },
  { name: 'T4', val: 80 },
  { name: 'T5', val: 95 },
];
const dataPie = [
  { name: 'Chi phí', value: 70 },
  { name: 'Lợi nhuận', value: 30 },
];
const COLORS = ['#6366f1', '#e0e7ff'];

const MeetingDetail: React.FC<MeetingDetailProps> = ({ onBack }) => {
  const [activeDoc, setActiveDoc] = useState<Document>(documents[0]);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Simulate loading DOCX content
  useEffect(() => {
    if (activeDoc.type === 'docx') {
      setLoading(true);
      // In a real app, we would fetch(activeDoc.url).then(res => res.arrayBuffer()).then(...)
      // Since we don't have a real backend for CORS-friendly DOCX files, we simulate the conversion or use a base64 string if provided.
      // For this "Make it Real" demo, I'll generate a dummy HTML to simulate Mammoth's output if fetch fails (which it will for local paths).
      
      setTimeout(() => {
         const mockHtml = `
            <div class="docx-content">
                <h1 style="text-align: center;">KẾ HOẠCH NHÂN SỰ NĂM 2024</h1>
                <p style="text-align: center;"><em>(Dự thảo trình Hội đồng quản trị)</em></p>
                <h2>1. Mục tiêu chung</h2>
                <p>Xây dựng đội ngũ nhân sự chất lượng cao, đáp ứng chiến lược phát triển bền vững của Tập đoàn trong giai đoạn 2024-2025. Tối ưu hóa cơ cấu tổ chức, nâng cao năng suất lao động.</p>
                <h2>2. Chỉ tiêu tuyển dụng</h2>
                <table>
                    <thead>
                        <tr style="background-color: #f1f5f9;">
                            <th>Bộ phận</th>
                            <th>Số lượng</th>
                            <th>Vị trí</th>
                            <th>Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Công nghệ (IT)</td>
                            <td>15</td>
                            <td>Senior Developer, DevOps</td>
                            <td>Quý 1</td>
                        </tr>
                         <tr>
                            <td>Kinh doanh</td>
                            <td>20</td>
                            <td>Sales Manager, Executive</td>
                            <td>Quý 2</td>
                        </tr>
                         <tr>
                            <td>Vận hành</td>
                            <td>5</td>
                            <td>Operations Lead</td>
                            <td>Quý 1</td>
                        </tr>
                    </tbody>
                </table>
                <h2>3. Ngân sách dự kiến</h2>
                <p>Tổng ngân sách tuyển dụng và đào tạo dự kiến tăng 15% so với năm 2023, tập trung vào các chương trình đào tạo Leadership và Chuyển đổi số.</p>
                <p><em>Hà Nội, ngày 15 tháng 10 năm 2023</em></p>
                <p><strong>Người lập kế hoạch</strong><br>Trần Thị B</p>
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
                <div className="space-y-4 mb-8">
                <div className="h-4 bg-slate-100 w-full rounded"></div>
                <div className="h-4 bg-slate-100 w-full rounded"></div>
                <div className="h-4 bg-slate-100 w-5/6 rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 h-64">
                    <h4 className="text-blue-800 font-bold mb-4 text-sm uppercase">Biểu đồ doanh thu</h4>
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataBar}>
                        <XAxis dataKey="name" hide />
                        <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 h-64 flex flex-col items-center justify-center">
                    <h4 className="text-indigo-800 font-bold mb-4 text-sm uppercase w-full text-left">Cơ cấu chi phí</h4>
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={dataPie}
                        innerRadius={40}
                        outerRadius={60}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        >
                        {dataPie.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                1. Phân tích chi tiết
                </h3>
                <p className="text-slate-700 text-base leading-relaxed mb-4 text-justify">
                Trong quý vừa qua, công ty đã đạt được những bước tiến đáng kể trong việc tối ưu hóa quy trình vận hành. Tỷ suất lợi nhuận gộp tăng 5% so với cùng kỳ năm trước. Tuy nhiên, chi phí marketing cũng tăng nhẹ do việc triển khai các chiến dịch mới nhằm mở rộng thị phần tại khu vực phía Nam.
                </p>
                <div className="space-y-3">
                <div className="h-3 bg-slate-100 w-full rounded"></div>
                <div className="h-3 bg-slate-100 w-11/12 rounded"></div>
                <div className="h-3 bg-slate-100 w-full rounded"></div>
                </div>
            </div>
        );
      case 'pdf':
        return (
             <div className="w-full h-full p-4 md:p-8 bg-slate-100 dark:bg-[#0b0e12] flex flex-col items-center">
                <div className="w-full max-w-5xl h-full shadow-lg rounded-lg overflow-hidden bg-white">
                    <iframe 
                        src={`${activeDoc.url}#toolbar=0`} 
                        className="w-full h-full"
                        title="PDF Viewer"
                    />
                </div>
             </div>
        );
      case 'docx':
        return (
            <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-slate-100 dark:bg-[#0b0e12]">
                 <div className="max-w-[850px] mx-auto bg-white shadow-soft min-h-[1100px] p-12 md:p-16 text-black" style={{ zoom: zoom / 100 }}>
                    {docxHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
                    ) : (
                        <p className="text-red-500">Không thể tải nội dung tài liệu.</p>
                    )}
                 </div>
            </div>
        );
      default:
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl">draft</span>
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Không hỗ trợ xem trước</h3>
                    <p className="text-sm">Vui lòng tải xuống để xem tài liệu này.</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-hover transition-colors">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Tải xuống ({activeDoc.size})
                </button>
            </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#101922] text-slate-800 dark:text-white font-display h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18232e] px-6 py-3 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white">Họp Hội đồng Quản trị Quý 3/2023</h2>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-600 dark:text-green-400 font-semibold">Đang diễn ra</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span>Phòng họp số 1</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span>09:00 - 11:30</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 dark:bg-[#283039] dark:hover:bg-[#3a4450] text-slate-600 dark:text-white transition-all relative">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#18232e]"></span>
            </button>
            <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 dark:bg-[#283039] dark:hover:bg-[#3a4450] text-slate-600 dark:text-white transition-all">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
            </button>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">Trần Văn Tú</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-1">Thư ký cuộc họp</p>
            </div>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-slate-200 dark:border-slate-700 ring-2 ring-transparent hover:ring-slate-100 transition-all" style={{ backgroundImage: "url('https://i.pravatar.cc/150?u=tu')" }}></div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-80 bg-white dark:bg-[#18232e] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-10 transition-all duration-300 hidden md:flex">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#18232e]">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">Danh sách tài liệu</h3>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary/10">{documents.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white dark:bg-[#18232e]">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                onClick={() => setActiveDoc(doc)}
                className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    activeDoc.id === doc.id 
                    ? 'bg-primary/5 border border-primary/20 shadow-sm relative overflow-hidden' 
                    : 'hover:bg-slate-50 dark:hover:bg-[#1f2937] border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                {activeDoc.id === doc.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                <div className={`shrink-0 rounded p-1.5 flex items-center justify-center border ${
                    activeDoc.id === doc.id
                    ? 'text-primary bg-white dark:bg-[#111418] border-primary/10' 
                    : 'text-slate-500 bg-slate-50 dark:bg-[#111418] border-slate-100 dark:border-transparent'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {doc.type === 'pdf' ? 'picture_as_pdf' : doc.type === 'report' ? 'bar_chart' : doc.type === 'docx' ? 'description' : 'table_chart'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate leading-snug ${activeDoc.id === doc.id ? 'text-primary font-bold' : 'text-slate-700 dark:text-slate-200'}`}>{doc.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{doc.size}</p>
                    {activeDoc.id === doc.id && <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-white dark:bg-[#111418] px-1.5 py-0.5 rounded border border-primary/10">Đang xem</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 bg-slate-100 dark:bg-[#0b0e12] flex flex-col relative overflow-hidden">
          {/* Document Toolbar */}
          <div className="h-12 bg-white dark:bg-[#18232e] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#111418] rounded-lg p-1 border border-slate-200 dark:border-transparent">
              <button onClick={() => setZoom(prev => Math.max(50, prev - 10))} className="hover:bg-white dark:hover:bg-[#283039] p-1 rounded text-slate-600 dark:text-slate-300 transition-colors shadow-sm"><span className="material-symbols-outlined text-[18px]">zoom_out</span></button>
              <span className="text-xs font-mono font-medium px-2 min-w-[3rem] text-center text-slate-600 dark:text-slate-300">{zoom}%</span>
              <button onClick={() => setZoom(prev => Math.min(200, prev + 10))} className="hover:bg-white dark:hover:bg-[#283039] p-1 rounded text-slate-600 dark:text-slate-300 transition-colors shadow-sm"><span className="material-symbols-outlined text-[18px]">zoom_in</span></button>
            </div>
            <div className="flex items-center gap-4">
               {activeDoc.pageCount && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Trang 1 / {activeDoc.pageCount}</span>}
            </div>
            <div className="flex items-center gap-2">
              <button className="text-slate-500 hover:text-primary p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#283039] transition-colors" title="Tải xuống">
                <span className="material-symbols-outlined text-[20px]">download</span>
              </button>
            </div>
          </div>

          {/* Document Renderer */}
          <div className="flex-1 overflow-hidden relative">
            {renderContent()}
          </div>
        </section>

        {/* Voting/Chat Sidebar (Right) */}
        <aside className="w-80 bg-white dark:bg-[#18232e] border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-10 hidden lg:flex">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined animate-pulse text-[18px]">how_to_vote</span>
                <span>Biểu quyết</span>
              </div>
              <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[10px]">timer</span> 02:15
              </span>
            </div>
            <h4 className="text-sm font-semibold mb-4 leading-snug text-slate-800 dark:text-white">Về việc thông qua kế hoạch ngân sách Marketing Q4/2023</h4>
            <div className="space-y-4">
              {[
                { label: 'Tán thành', count: '13 (65%)', color: 'bg-green-500', w: '65%' },
                { label: 'Không tán thành', count: '2 (10%)', color: 'bg-red-500', w: '10%' },
                { label: 'Không có ý kiến', count: '5 (25%)', color: 'bg-amber-500', w: '25%' }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                    <span className="font-bold">{item.count}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-100 dark:border-slate-600">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: item.w }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-black/20 py-2 rounded border border-slate-100 dark:border-transparent">
              Đã biểu quyết: <span className="font-bold text-slate-700 dark:text-white">20/20</span> đại biểu
            </div>
          </div>
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#18232e]">
             {/* Participants List */}
             <div className="p-4 pb-2 shrink-0">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
                    Đại biểu tham dự 
                    <span className="bg-slate-100 dark:bg-[#283039] text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md text-xs border border-slate-200 dark:border-transparent">20</span>
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                {/* User 1 */}
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-cover bg-center ring-2 ring-primary/30" style={{backgroundImage: "url('https://i.pravatar.cc/150?u=chair')"}}></div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#18232e] rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Nguyễn Văn A</p>
                        <p className="text-xs text-primary font-medium truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                            Chủ tọa • Đang nói
                        </p>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#111418] text-primary shadow-sm border border-primary/10">
                        <span className="material-symbols-outlined text-[18px]">mic</span>
                    </div>
                </div>
                 {/* Other Users */}
                 {['Trần Thị B', 'Lê Văn C', 'Hoàng Văn D'].map((name, i) => (
                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group border border-transparent hover:border-slate-100 dark:hover:border-transparent ${i===2 ? 'opacity-75' : ''}`}>
                         <div className="relative shrink-0">
                            <div className={`w-9 h-9 rounded-full bg-cover bg-center ${i!==2 ? 'grayscale group-hover:grayscale-0' : 'grayscale'} transition-all`} style={{backgroundImage: `url('https://i.pravatar.cc/150?u=${name}')`}}></div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${i===2 ? 'bg-slate-300' : 'bg-green-500'} border-2 border-white dark:border-[#18232e] rounded-full`}></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-primary transition-colors">{name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{i === 0 ? 'Thư ký' : i === 2 ? 'Đại biểu (Offline)' : 'Đại biểu'}</p>
                        </div>
                        {i !== 2 && <span className="material-symbols-outlined text-slate-300 dark:text-slate-500 text-[18px]">mic_off</span>}
                    </div>
                 ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="h-[88px] bg-white dark:bg-[#18232e] border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-center shrink-0 z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] relative">
        <div className="absolute left-6 flex items-center gap-3 hidden md:flex">
          <button className="flex flex-col items-center gap-1 group w-16">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 dark:border-transparent dark:bg-[#283039] flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all shadow-sm">
              <span className="material-symbols-outlined">edit_note</span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary">Ghi chú</span>
          </button>
           <button className="flex flex-col items-center gap-1 group w-16">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 dark:border-transparent dark:bg-[#283039] flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all shadow-sm">
              <span className="material-symbols-outlined">forum</span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary">Thảo luận</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="h-12 pl-6 pr-8 rounded-full bg-white dark:bg-[#283039] border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary text-slate-700 dark:text-white font-bold flex items-center gap-3 transition-all hover:shadow-lg hover:-translate-y-0.5 group">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#111418] flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">front_hand</span>
            </div>
            <span>Phát biểu</span>
          </button>
          <button className="h-14 px-8 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg flex items-center gap-3 shadow-[0_4px_20px_rgba(19,127,236,0.4)] hover:shadow-[0_6px_25px_rgba(19,127,236,0.5)] transition-all hover:-translate-y-0.5 hover:scale-105">
            <span className="material-symbols-outlined text-[24px]">how_to_vote</span>
            Biểu quyết
          </button>
        </div>
        <div className="absolute right-6 hidden md:block">
            <button onClick={onBack} className="h-10 px-5 rounded-lg bg-red-50 border border-red-100 hover:border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:border-transparent text-red-600 dark:text-red-400 font-bold flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span className="text-sm">Kết thúc</span>
            </button>
        </div>
      </footer>
    </div>
  );
};

export default MeetingDetail;