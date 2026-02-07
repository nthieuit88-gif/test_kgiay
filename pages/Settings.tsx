
import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'workflow' | 'logs'>('general');

  // Mock Data cho Quản lý người dùng
  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'admin@paperless.com', role: 'Quản trị viên', dept: 'Ban Giám Đốc', status: 'active', avatar: 'https://i.pravatar.cc/150?u=admin' },
    { id: 2, name: 'Trần Thị B', email: 'b.tran@paperless.com', role: 'Quản lý', dept: 'Phòng Nhân sự', status: 'active', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Lê Văn C', email: 'c.le@paperless.com', role: 'Nhân viên', dept: 'Phòng IT', status: 'inactive', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, name: 'Phạm Minh T', email: 't.pham@paperless.com', role: 'Nhân viên', dept: 'Phòng Marketing', status: 'active', avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: 5, name: 'Hoàng Văn D', email: 'd.hoang@paperless.com', role: 'Quản lý', dept: 'Phòng Kế toán', status: 'active', avatar: 'https://i.pravatar.cc/150?u=5' },
  ];

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative bg-[#f8fafc] font-display">
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-200 sticky top-0 z-20">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Cài đặt hệ thống</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý cấu hình toàn bộ hệ thống Paperless Meeting</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 rounded-lg shadow-xs transition-all">Hủy thay đổi</button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">save</span>
            Lưu cài đặt
          </button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
          
          {/* Navigation Tabs */}
          <div className="border-b border-slate-200">
            <nav aria-label="Tabs" className="-mb-px flex space-x-8">
              <button 
                onClick={() => setActiveTab('general')}
                className={`${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors`}
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
                Cấu hình chung
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors`}
              >
                <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                Quản lý người dùng
              </button>
              <button 
                onClick={() => setActiveTab('workflow')}
                className={`${activeTab === 'workflow' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors`}
              >
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
                Quy trình phê duyệt
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`${activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors`}
              >
                <span className="material-symbols-outlined text-[20px]">history</span>
                Nhật ký hoạt động
              </button>
            </nav>
          </div>

          {/* CONTENT: Cấu hình chung */}
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Section 1 */}
              <section className="bg-white shadow-xs rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-base font-bold text-slate-900">Thông tin tổ chức</h3>
                  <p className="text-sm text-slate-500 mt-1">Cập nhật thông tin cơ bản về doanh nghiệp hiển thị trên các tài liệu.</p>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên tổ chức</label>
                    <input className="w-full bg-white border-slate-300 rounded-lg text-sm text-slate-900 shadow-sm focus:ring-primary focus:border-primary placeholder-slate-400 py-2.5" type="text" defaultValue="Công ty Cổ phần Công nghệ ABC" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email hệ thống</label>
                    <input className="w-full bg-white border-slate-300 rounded-lg text-sm text-slate-900 shadow-sm focus:ring-primary focus:border-primary placeholder-slate-400 py-2.5" type="email" defaultValue="no-reply@abc-corp.com" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Logo hệ thống</label>
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer group">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">image</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors self-start">
                          Tải lên logo mới
                        </button>
                        <p className="text-xs text-slate-500">Hỗ trợ PNG, JPG. Kích thước tối đa 2MB.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* Section 2 */}
              <section className="bg-white shadow-xs rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-base font-bold text-slate-900">Bảo mật & Truy cập</h3>
                  <p className="text-sm text-slate-500 mt-1">Cấu hình các quy tắc đăng nhập và bảo mật tài liệu.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1 pr-4">
                      <span className="text-sm font-semibold text-slate-900">Xác thực hai lớp (2FA)</span>
                      <span className="text-sm text-slate-500">Bắt buộc tất cả nhân viên kích hoạt 2FA khi đăng nhập vào hệ thống quản trị.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input defaultChecked className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </label>
                  </div>
                  <div className="w-full h-px bg-slate-100"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1 pr-4">
                      <span className="text-sm font-semibold text-slate-900">Watermark tài liệu</span>
                      <span className="text-sm text-slate-500">Tự động chèn watermark "MẬT" chìm lên background các tài liệu nhạy cảm.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input defaultChecked className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* CONTENT: Quản lý người dùng */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Actions Bar */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative w-full max-w-sm group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                    <input className="w-full bg-white border border-slate-300 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" placeholder="Tìm kiếm nhân sự..." type="text" />
                  </div>
                  <div className="flex items-center gap-3">
                    <select className="bg-white border border-slate-300 text-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-sm text-slate-700">
                      <option>Tất cả phòng ban</option>
                      <option>Ban Giám Đốc</option>
                      <option>Phòng Nhân sự</option>
                      <option>Phòng IT</option>
                    </select>
                    <button className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
                       <span className="material-symbols-outlined text-[18px]">add</span> Thêm mới
                    </button>
                  </div>
               </div>

               {/* Users Table */}
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                         <th className="px-6 py-4 text-[11px] uppercase font-black text-slate-400 tracking-wider">Nhân viên</th>
                         <th className="px-6 py-4 text-[11px] uppercase font-black text-slate-400 tracking-wider">Vai trò & Phòng ban</th>
                         <th className="px-6 py-4 text-[11px] uppercase font-black text-slate-400 tracking-wider">Trạng thái</th>
                         <th className="px-6 py-4 text-right text-[11px] uppercase font-black text-slate-400 tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {users.map((user) => (
                          <tr key={user.id} className="group hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover bg-slate-200 border border-slate-100" />
                                   <div className="flex flex-col">
                                      <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{user.name}</span>
                                      <span className="text-xs text-slate-500">{user.email}</span>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex flex-col">
                                   <span className="text-sm font-semibold text-slate-800">{user.role}</span>
                                   <span className="text-xs text-slate-500">{user.dept}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${user.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                   <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                   {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   <button className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all hover:shadow-sm" title="Chỉnh sửa">
                                      <span className="material-symbols-outlined text-[18px]">edit</span>
                                   </button>
                                   <button className="p-2 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg text-slate-400 hover:text-rose-500 transition-all hover:shadow-sm" title="Xóa">
                                      <span className="material-symbols-outlined text-[18px]">delete</span>
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                  </table>
                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
                     <span className="text-xs font-semibold text-slate-500">Hiển thị 5 / 125 nhân viên</span>
                     <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-primary hover:border-primary disabled:opacity-50 transition-all"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
                        <button className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-primary hover:border-primary transition-all"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* CONTENT: Quy trình phê duyệt */}
          {activeTab === 'workflow' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Workflow Đặt lịch họp */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div>
                         <h3 className="text-base font-bold text-slate-900">Quy trình Đặt lịch họp</h3>
                         <p className="text-sm text-slate-500 mt-1">Cấu hình luồng duyệt cho yêu cầu đặt phòng họp mới.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input defaultChecked className="sr-only peer" type="checkbox" />
                         <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </label>
                   </div>
                   
                   <div className="p-8">
                      {/* Visual Steps */}
                      <div className="relative flex items-center justify-between gap-4">
                         {/* Connecting Line */}
                         <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                         
                         {/* Step 1 */}
                         <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-4 border-white shadow-md">
                               <span className="material-symbols-outlined">person_add</span>
                            </div>
                            <div className="text-center bg-white px-2">
                               <p className="text-sm font-bold text-slate-900">Người tạo</p>
                               <p className="text-xs text-slate-500">Gửi yêu cầu</p>
                            </div>
                         </div>

                         {/* Step 2 */}
                         <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border-4 border-white shadow-md">
                               <span className="material-symbols-outlined">supervisor_account</span>
                            </div>
                            <div className="text-center bg-white px-2">
                               <p className="text-sm font-bold text-slate-900">Quản lý trực tiếp</p>
                               <p className="text-xs text-slate-500">Duyệt sơ bộ</p>
                            </div>
                         </div>

                         {/* Step 3 */}
                         <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center border-4 border-white shadow-md">
                               <span className="material-symbols-outlined">meeting_room</span>
                            </div>
                            <div className="text-center bg-white px-2">
                               <p className="text-sm font-bold text-slate-900">Admin Phòng</p>
                               <p className="text-xs text-slate-500">Duyệt phòng</p>
                            </div>
                         </div>

                         {/* Step 4 */}
                         <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-md">
                               <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <div className="text-center bg-white px-2">
                               <p className="text-sm font-bold text-slate-900">Hoàn tất</p>
                               <p className="text-xs text-slate-500">Gửi thông báo</p>
                            </div>
                         </div>
                      </div>

                      {/* Settings Detail */}
                      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                         <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">settings_suggest</span> Cấu hình nâng cao</h4>
                            <div className="space-y-4">
                               <div className="flex items-start gap-3">
                                  <input type="checkbox" id="skip_manager" className="mt-1 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20" defaultChecked />
                                  <label htmlFor="skip_manager" className="text-sm text-slate-600">
                                     <span className="font-semibold text-slate-800 block">Tự động duyệt cấp quản lý</span>
                                     Nếu người tạo là Trưởng bộ phận trở lên.
                                  </label>
                               </div>
                               <div className="flex items-start gap-3">
                                  <input type="checkbox" id="auto_room" className="mt-1 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20" />
                                  <label htmlFor="auto_room" className="text-sm text-slate-600">
                                     <span className="font-semibold text-slate-800 block">Duyệt phòng tự động</span>
                                     Nếu phòng trống và số lượng người dưới 10.
                                  </label>
                               </div>
                            </div>
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-rose-500">timer</span> Thời gian xử lý</h4>
                            <div className="space-y-3">
                               <label className="text-sm text-slate-600">Tự động hủy yêu cầu nếu không được duyệt sau:</label>
                               <select className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5">
                                  <option>24 giờ</option>
                                  <option>48 giờ</option>
                                  <option>Không giới hạn</option>
                               </select>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Workflow Duyệt Tài liệu */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden opacity-70">
                   <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div>
                         <h3 className="text-base font-bold text-slate-900">Quy trình Duyệt Tài liệu Mật</h3>
                         <p className="text-sm text-slate-500 mt-1">Áp dụng cho các tài liệu có gắn nhãn "Tuyệt mật".</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                         <input className="sr-only peer" type="checkbox" />
                         <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </label>
                   </div>
                   <div className="p-8 flex items-center justify-center border-t border-slate-100">
                      <p className="text-slate-400 font-medium italic flex items-center gap-2"><span className="material-symbols-outlined">info</span> Quy trình này hiện đang tắt</p>
                   </div>
                </div>

             </div>
          )}

          {activeTab === 'logs' && (
             <div className="p-20 text-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl">
                <span className="material-symbols-outlined text-6xl mb-4">history_toggle_off</span>
                <p className="font-bold text-lg">Nhật ký hoạt động chưa có dữ liệu</p>
             </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Settings;
