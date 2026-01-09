import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Building2, 
  LogOut, 
  User,
  Circle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: { userName: string; role: string };
  onLogout: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout,
  isSidebarOpen,
  setIsSidebarOpen
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-orange-500 to-red-500' },
    { id: 'weekly-planning', label: 'Weekly Planning', icon: Calendar, color: 'from-cyan-500 to-blue-500' },
    { id: 'daily-reports', label: 'Daily Reports', icon: FileText, color: 'from-green-500 to-emerald-500' },
    { id: 'hospitals', label: 'Hospitals', icon: Building2, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <>
    {/* Overlay للموبايل */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}
 <div className={`
  fixed left-0 top-0 h-full w-64 
  backdrop-blur-xl bg-white/10 border-r border-white/20 z-50
  transform transition-transform duration-300 ease-in-out
  ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  md:translate-x-0
`}>     {/* Header */}
      <div className="p-6 border-b border-white/20">
        <h2 className="text-2xl font-bold text-white">MedReps</h2>
        <p className="text-white/70 text-sm mt-1">Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
               <button
  onClick={() => {
    console.log("🔴 Clicked:", item.id);
    console.log("🟡 Current activeTab:", activeTab);
    setActiveTab(item.id);
    console.log("🟢 New activeTab set to:", item.id);
    setTimeout(() => {
      setIsSidebarOpen(false);
    }, 300);
  }}
  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
    isActive 
      ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105` 
      : 'text-white/70 hover:text-white hover:bg-white/10'
  }`}
>
  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
  <span className="font-medium">{item.label}</span>
  {isActive && (
    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
  )}
</button>

              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white/20 flex items-center justify-center">
              <Circle className="w-2 h-2 text-white fill-current" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{currentUser.userName}</p>
            <p className="text-white/60 text-sm capitalize">{currentUser.role}</p>
          </div>
        </div>

        <button
          onClick={() => {
  onLogout();
  setIsSidebarOpen(false);
}}

          className="w-full flex items-center space-x-3 px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-xl transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
      
    </div>
    </>
  );
};

export default Sidebar;
