
import React, { useState, useRef, useEffect } from 'react';

// Declare globals from CDN
declare var mammoth: any;
declare var pdfjsLib: any;

interface DocumentItem {
  id: string;
  name: string;
  size: string;
  user: string;
  date: string;
  access: string;
  accessColor: string;
  icon: string;
  iconColor: string;
  type: string;
  content?: any; // HTML string for docx or ArrayBuffer for pdf
  file?: File;
}

const Documents: React.FC = () => {
  const [docs, setDocs] = useState<DocumentItem[]>([
    { id: '1', name: 'Báo cáo tài chính Q3_2023.pdf', size: '2.4 MB', user: 'Nguyễn Thu Hà', date: '20/10/2023 09:30', access: 'Công khai', accessColor: 'emerald', icon: 'picture_as_pdf', iconColor: 'red', type: 'pdf' },
    { id: '2', name: 'Biên bản cuộc họp HĐQT tháng 10.docx', size: '856 KB', user: 'Phạm Minh Tuấn', date: '19/10/2023 14:15', access: 'Nội bộ', accessColor: 'amber', icon: 'description', iconColor: 'blue', type: 'docx' },
  ]);

  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    const newDoc: DocumentItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      user: 'Nguyễn Văn A (Tôi)',
      date: new Date().toLocaleString('vi-VN'),
      access: 'Riêng tư',
      accessColor: 'rose',
      icon: fileType === 'pdf' ? 'picture_as_pdf' : 'description',
      iconColor: fileType === 'pdf' ? 'red' : 'blue',
      type: fileType || 'unknown',
      file: file
    };

    setDocs(prev => [newDoc, ...prev]);
    openPreview(newDoc);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openPreview = async (doc: DocumentItem) => {
    setPreviewDoc(doc);
    setZoom(1.0);
    if (!doc.file) return;

    setIsPreviewLoading(true);
    try {
      if (doc.type === 'docx') {
        const arrayBuffer = await doc.file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setPreviewDoc({ ...doc, content: result.value });
      } else if (doc.type === 'pdf') {
        const arrayBuffer = await doc.file.arrayBuffer();
        setPreviewDoc({ ...doc, content: arrayBuffer });
      }
    } catch (error) {
      console.error("Preview error:", error);
      alert("Không thể xem trước tài liệu này.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Render PDF function using PDF.js
  useEffect(() => {
    if (previewDoc?.type === 'pdf' && previewDoc.content && pdfContainerRef.current) {
      const renderPdf = async () => {
        try {
          const loadingTask = pdfjsLib.getDocument({ data: previewDoc.content });
          const pdf = await loadingTask.promise;
          setNumPages(pdf.numPages);
          
          const container = pdfContainerRef.current;
          if (!container) return;
          container.innerHTML = ''; // Clear previous

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: zoom * 1.5 }); // High-def render
            
            const wrapper = document.createElement('div');
            wrapper.className = 'pdf-page-wrapper mb-6';
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            wrapper.appendChild(canvas);
            container.appendChild(wrapper);

            const renderContext = {
              canvasContext: context,
              viewport: viewport
            };
            await page.render(renderContext).promise;
          }
        } catch (err) {
          console.error("PDF Render Error:", err);
        }
      };
      renderPdf();
    }
  }, [previewDoc, zoom]);

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#f0f7ff] relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".pdf,.docx"
      />

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18232e] w-full max-w-6xl h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-${previewDoc.iconColor}-500`}>{previewDoc.icon}</span>
                <h3 className="font-bold text-slate-800 truncate max-w-md">{previewDoc.name}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                  <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 hover:bg-slate-100 rounded text-slate-500"><span className="material-symbols-outlined text-[18px]">zoom_out</span></button>
                  <span className="text-xs font-bold px-2 text-slate-700 min-w-[3.5rem] text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(z => Math.min(2.0, z + 0.1))} className="p-1 hover:bg-slate-100 rounded text-slate-500"><span className="material-symbols-outlined text-[18px]">zoom_in</span></button>
                </div>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-slate-200/50 p-4 md:p-8">
              {isPreviewLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                  <span className="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
                  <p className="font-bold">Đang tải bản xem trước...</p>
                </div>
              ) : (
                <div className="flex justify-center min-h-full">
                  {previewDoc.type === 'docx' ? (
                    <div className="w-full max-w-[850px] bg-white shadow-lg p-16 docx-preview-container">
                      <div className="docx-content" dangerouslySetInnerHTML={{ __html: previewDoc.content || '' }} />
                    </div>
                  ) : previewDoc.type === 'pdf' ? (
                    <div ref={pdfContainerRef} className="pdf-canvas-container" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <span className="material-symbols-outlined text-6xl">visibility_off</span>
                      <p className="mt-4">Không hỗ trợ xem trước định dạng này</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center">
              <div className="text-xs font-medium text-slate-500">
                {previewDoc.type === 'pdf' && numPages > 0 && `Tổng số: ${numPages} trang`}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPreviewDoc(null)} className="px-6 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors">Đóng</button>
                {previewDoc.file && (
                  <a 
                    href={URL.createObjectURL(previewDoc.file)} 
                    download={previewDoc.name}
                    className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                  >
                    Tải xuống máy
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="md:hidden flex items-center justify-between border-b border-slate-200 p-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">description</span>
          <span className="font-bold text-slate-800">Paperless</span>
        </div>
        <button className="text-slate-600"><span className="material-symbols-outlined">menu</span></button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="layout-content-container mx-auto max-w-[1200px] p-6 md:p-10 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary font-medium">
              <a className="hover:text-primary transition-colors" href="#">Trang chủ</a>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-text-main">Kho Tài liệu</span>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-text-main tracking-tight">Kho Tài liệu</h1>
                <p className="text-text-secondary mt-1">Quản lý, lưu trữ và chia sẻ tài liệu cuộc họp an toàn.</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-bold text-text-secondary hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">cloud_download</span>
                  <span>Xuất báo cáo</span>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:scale-105 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">upload_file</span>
                  <span>Tải lên từ PC</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-text-main placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                  placeholder="Tìm kiếm tài liệu đã tải lên..."
                  type="text"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-secondary">
                <thead className="bg-slate-50/80 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 w-[40%]" scope="col">Tên tài liệu</th>
                    <th className="px-6 py-4" scope="col">Người tạo</th>
                    <th className="px-6 py-4" scope="col">Ngày cập nhật</th>
                    <th className="px-6 py-4" scope="col">Quyền truy cập</th>
                    <th className="px-6 py-4 text-right" scope="col">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {docs.map((doc) => (
                    <tr key={doc.id} onClick={() => openPreview(doc)} className="group hover:bg-blue-50/40 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-${doc.iconColor}-50 text-${doc.iconColor}-600 ring-1 ring-${doc.iconColor}-100`}>
                            <span className="material-symbols-outlined">{doc.icon}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-text-main group-hover:text-primary transition-colors text-[15px]">{doc.name}</span>
                            <span className="text-xs text-slate-400 font-medium">{doc.size}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="h-8 w-8 rounded-full bg-slate-200 bg-cover ring-2 ring-white shadow-sm" style={{backgroundImage: `url('https://i.pravatar.cc/150?u=${doc.id}')`}}></div>
                          <span className="text-text-main font-medium">{doc.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{doc.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full bg-${doc.accessColor}-100 px-3 py-1 text-xs font-bold text-${doc.accessColor}-700 border border-${doc.accessColor}-200`}>
                          {doc.access === 'Riêng tư' ? <span className="material-symbols-outlined text-[14px]">lock</span> : <span className={`h-1.5 w-1.5 rounded-full bg-${doc.accessColor}-500`}></span>}
                          {doc.access}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="rounded-lg p-2 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button className="rounded-lg p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Documents;
