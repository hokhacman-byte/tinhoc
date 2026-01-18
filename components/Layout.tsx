
import React, { ReactNode, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }: { children?: ReactNode }) => {
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  // Sidebar state for Desktop only
  const [isDesktopMenuCollapsed, setIsDesktopMenuCollapsed] = useState(false);

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">{children}</div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // --- MODERN LAVENDER THEME CONFIG ---
  // Active State: Gradient Lavender + Shadow
  const activeClass = "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-200 scale-[1.02]";
  // Inactive State: Gray text + Lavender Hover
  const inactiveClass = "text-slate-500 hover:bg-violet-50 hover:text-violet-600";

  // Mobile Bottom Nav Item
  const MobileNavItem = ({ to, icon, label, isActive }: { to: string; icon: string; label: string; isActive: boolean }) => (
    <Link to={to} className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-300 group ${isActive ? 'text-violet-600' : 'text-gray-400 hover:text-violet-400'}`}>
      {/* Active Glow Background */}
      {isActive && <div className="absolute top-2 w-10 h-10 bg-violet-100 rounded-full -z-10 animate-fade-in"></div>}
      
      <div className={`text-xl transition-transform duration-300 ${isActive ? '-translate-y-1 scale-110' : 'group-hover:-translate-y-0.5'}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <span className={`text-[9px] font-bold tracking-wide transition-opacity ${isActive ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
    </Link>
  );

  // Desktop Sidebar Item
  const SidebarItem = ({ to, icon, label }: { to: string; icon: string; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group mb-1.5 ${
          isActive ? activeClass : inactiveClass
        }`}
      >
        <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-400 group-hover:text-violet-600 group-hover:bg-violet-100 shadow-sm'}`}>
            <i className={`${icon} text-lg transition-transform group-hover:scale-110`}></i>
        </div>
        {!isDesktopMenuCollapsed && (
            <span className={`font-bold text-sm tracking-wide ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-violet-700'}`}>
                {label}
            </span>
        )}
        {/* Active Indicator Dot (Only when collapsed) */}
        {isActive && isDesktopMenuCollapsed && (
            <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"></div>
        )}
      </Link>
    );
  };

  // Helper for Section Divider/Header
  const SectionHeader = ({ label, icon, colorClass }: { label: string, icon: string, colorClass: string }) => (
      !isDesktopMenuCollapsed ? (
        <div className="px-4 mt-4 mb-2 flex items-center space-x-2 animate-fade-in">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${colorClass} flex items-center`}>
                <i className={`fas ${icon} mr-2 opacity-70`}></i> {label}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-violet-100 to-transparent"></div>
        </div>
      ) : (
        <div className="h-px w-8 mx-auto bg-violet-100 my-2"></div>
      )
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      
      {/* MOBILE HEADER (App Bar) - Clean & Modern */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl z-40 px-5 flex items-center justify-between shadow-sm border-b border-gray-100">
          <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-violet-200 transform rotate-3">
                  L
              </div>
              <h1 className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-fuchsia-600 tracking-tight">LHP LMS</h1>
          </div>
          <Link to="/profile" className="relative group">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-violet-500 to-fuchsia-500">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-violet-600">{currentUser.name.charAt(0)}</span>
                    )}
                  </div>
              </div>
          </Link>
      </div>

      {/* DESKTOP SIDEBAR - Lavender Theme */}
      <aside className={`hidden md:flex flex-col fixed h-screen bg-white border-r border-gray-100 z-30 transition-all duration-500 ease-in-out ${isDesktopMenuCollapsed ? 'w-24' : 'w-72'} shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
        {/* Logo Section */}
        <div className="p-6 mb-2 flex items-center justify-between">
          <div className={`flex items-center space-x-3 transition-opacity duration-300 ${isDesktopMenuCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-violet-200">
              L
            </div>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-fuchsia-600 tracking-tight">LHP LMS</span>
          </div>
          
          {/* Collapse Button */}
          <button 
            onClick={() => setIsDesktopMenuCollapsed(!isDesktopMenuCollapsed)} 
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all ${isDesktopMenuCollapsed ? 'mx-auto' : ''}`}
          >
              <i className={`fas ${isDesktopMenuCollapsed ? 'fa-angle-double-right' : 'fa-angle-double-left'} text-lg`}></i>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
            
            <SectionHeader label="Hệ thống" icon="fa-cube" colorClass="text-violet-400" />
            
            {currentUser.role === Role.ADMIN && <SidebarItem to="/admin" icon="fa-user-shield" label="Quản trị viên" />}
            {currentUser.role === Role.TEACHER && <SidebarItem to="/teacher" icon="fa-chalkboard-teacher" label="Giáo viên" />}
            {currentUser.role === Role.STUDENT && <SidebarItem to="/dashboard" icon="fa-home" label="Trang chủ" />}
            
            <SidebarItem to="/lectures" icon="fa-book-open" label="Bài giảng" />
            <SidebarItem to="/worksheets" icon="fa-file-alt" label="Phiếu bài tập" />
            <SidebarItem to="/code-exercise" icon="fa-laptop-code" label="Thực hành Code" />
            
            {/* Added New Menus */}
            <SidebarItem to="/calendar" icon="fa-calendar-alt" label="Lịch học tập" />
            <SidebarItem to="/library" icon="fa-book" label="Thư viện số" />
            <SidebarItem to="/codelab" icon="fa-code" label="Phòng Code Lab" />

            <SectionHeader label="Luyện tập" icon="fa-bullseye" colorClass="text-fuchsia-400" />
            
            {(currentUser.role === Role.STUDENT || currentUser.role === Role.ADMIN) && (
             <>
                <SidebarItem to="/mock-exams" icon="fa-pen-nib" label="Thi thử (HK1)" />
                <SidebarItem to="/quiz" icon="fa-clipboard-check" label="Kiểm tra" />
                <SidebarItem to="/challenge" icon="fa-gamepad" label="Game thử thách" />
             </>
            )}
            
            <SectionHeader label="Tiện ích" icon="fa-layer-group" colorClass="text-purple-400" />
            
            <SidebarItem to="/posts" icon="fa-comments" label="Diễn đàn" />
            <SidebarItem to="/chatbot" icon="fa-robot" label="AI Tutor" />
            <SidebarItem to="/infographics" icon="fa-images" label="Thư viện ảnh" />
            <SidebarItem to="/survey" icon="fa-poll-h" label="Khảo sát" />
            
            {currentUser.role === Role.STUDENT && <SidebarItem to="/profile" icon="fa-id-card" label="Hồ sơ" />}
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isDesktopMenuCollapsed ? 'justify-center' : 'justify-start space-x-3'} px-4 py-3 text-red-500 hover:bg-red-50 hover:shadow-sm rounded-2xl transition-all duration-300 group`}
          >
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <i className="fas fa-sign-out-alt w-4 text-center group-hover:scale-110 transition-transform"></i>
            </div>
            {!isDesktopMenuCollapsed && <span className="font-bold text-sm">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR - Glassmorphism & Floating Action Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-white/90 backdrop-blur-lg border-t border-gray-100 z-50 px-6 pb-2 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl">
          <div className="flex-1 h-full pt-2">
             <MobileNavItem to="/dashboard" icon="fa-home" label="Home" isActive={location.pathname === '/dashboard'} />
          </div>
          <div className="flex-1 h-full pt-2">
             <MobileNavItem to="/lectures" icon="fa-book" label="Học" isActive={location.pathname === '/lectures'} />
          </div>
          
          {/* Central Floating Action Button (AI) - Lavender Glow */}
          <div className="relative -top-8 group">
              <Link 
                to="/chatbot" 
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transform transition-all duration-300 active:scale-95 group-hover:-translate-y-1 ${
                    location.pathname === '/chatbot' 
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 ring-4 ring-violet-200 shadow-violet-400' 
                    : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-violet-300'
                }`}
              >
                  <i className="fas fa-robot text-2xl animate-pulse"></i>
              </Link>
              {/* Ripple Effect */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-violet-400 rounded-full opacity-20 animate-ping -z-10"></div>
          </div>

          <div className="flex-1 h-full pt-2">
             <MobileNavItem to="/mock-exams" icon="fa-pen-nib" label="Thi thử" isActive={location.pathname === '/mock-exams'} />
          </div>
          <div className="flex-1 h-full pt-2">
             <MobileNavItem to="/posts" icon="fa-compass" label="Khám phá" isActive={location.pathname === '/posts' || location.pathname === '/worksheets'} />
          </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 transition-all duration-500 ease-in-out ${isDesktopMenuCollapsed ? 'md:ml-24' : 'md:ml-72'}`}>
        <div className="pt-24 pb-28 md:py-10 px-4 md:px-10 max-w-7xl mx-auto min-h-screen">
            {children}
        </div>
      </main>

    </div>
  );
};

export default Layout;
