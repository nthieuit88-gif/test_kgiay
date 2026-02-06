import React from 'react';

const Documents: React.FC = () => {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#f0f7ff]">
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
                <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:scale-105 transition-all">
                  <span className="material-symbols-outlined text-[20px]">upload_file</span>
                  <span>Tải lên</span>
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
                  placeholder="Tìm kiếm theo tên, nội dung..."
                  type="text"
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <div className="flex items-center gap-2 border-r border-slate-200 pr-4 mr-1">
                  <button className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Dạng lưới">
                    <span className="material-symbols-outlined">grid_view</span>
                  </button>
                  <button className="p-2 text-primary bg-primary/10 rounded-lg transition-colors" title="Dạng danh sách">
                    <span className="material-symbols-outlined">view_list</span>
                  </button>
                </div>
                <select className="rounded-lg border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-text-main font-medium focus:ring-1 focus:ring-primary cursor-pointer hover:border-primary/50 transition-colors">
                  <option>Mới nhất</option>
                  <option>Cũ nhất</option>
                  <option>Theo tên A-Z</option>
                </select>
                <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-text-secondary hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all bg-white">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  <span>Bộ lọc</span>
                </button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button className="whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-white shadow-md shadow-primary/20">Tất cả</button>
              {['Tài liệu họp', 'Báo cáo tài chính', 'Văn bản nội bộ', 'Hình ảnh & Media'].map(filter => (
                 <button key={filter} className="whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-sm font-medium text-text-secondary hover:text-primary border border-slate-200 hover:border-primary transition-all shadow-sm">{filter}</button>
              ))}
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
                    <th className="px-6 py-4 text-right" scope="col">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    {name: 'Báo cáo tài chính Q3_2023.pdf', size: '2.4 MB • PDF', user: 'Nguyễn Thu Hà', date: '20/10/2023 09:30', access: 'Công khai', accessColor: 'emerald', icon: 'picture_as_pdf', iconColor: 'red'},
                    {name: 'Biên bản cuộc họp HĐQT tháng 10.docx', size: '856 KB • Word', user: 'Phạm Minh Tuấn', date: '19/10/2023 14:15', access: 'Nội bộ', accessColor: 'amber', icon: 'description', iconColor: 'blue'},
                    {name: 'Slide trình bày chiến lược 2024.pptx', size: '15.2 MB • PowerPoint', user: 'Trần Văn Quản', date: '18/10/2023 08:00', access: 'Riêng tư', accessColor: 'rose', icon: 'slideshow', iconColor: 'orange'},
                    {name: 'Danh sách nhân sự tham gia.xlsx', size: '45 KB • Excel', user: 'Lê Thị Bích', date: '17/10/2023 16:45', access: 'Nội bộ', accessColor: 'amber', icon: 'table_view', iconColor: 'emerald'},
                    {name: 'Tài liệu dự án XYZ (Archive).zip', size: '120 MB • Zip', user: 'Hoàng Nam', date: '15/10/2023 10:00', access: 'Riêng tư', accessColor: 'rose', icon: 'folder_zip', iconColor: 'purple'}
                  ].map((doc, idx) => (
                    <tr key={idx} className="group hover:bg-blue-50/40 transition-colors cursor-pointer">
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
                           <div className="h-8 w-8 rounded-full bg-cover ring-2 ring-white shadow-sm" style={{backgroundImage: `url('https://i.pravatar.cc/150?u=${idx + 20}')`}}></div>
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
                        <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <span className="text-sm text-text-secondary">Hiển thị <span className="font-bold text-text-main">1-5</span> trên <span className="font-bold text-text-main">128</span> tài liệu</span>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-text-secondary hover:bg-white hover:text-primary hover:border-primary disabled:opacity-50 shadow-sm transition-all">Trước</button>
                <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-text-secondary hover:bg-white hover:text-primary hover:border-primary shadow-sm transition-all">Sau</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center ring-4 ring-blue-50/50">
                <span className="material-symbols-outlined">cloud</span>
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium">Dung lượng đã dùng</p>
                <h4 className="text-lg font-bold text-text-main">45.2 GB <span className="text-sm font-medium text-slate-400">/ 100 GB</span></h4>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" style={{width: '45%'}}></div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-4 ring-emerald-50/50">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium">Tài liệu đã duyệt</p>
                <h4 className="text-lg font-bold text-text-main">1,240</h4>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center ring-4 ring-amber-50/50">
                <span className="material-symbols-outlined">pending</span>
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium">Đang chờ xử lý</p>
                <h4 className="text-lg font-bold text-text-main">5</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Documents;