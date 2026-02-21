import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSentimentStore } from '../store';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';

const Layout: React.FC = () => {
  const { sidebarCollapsed } = useSentimentStore();
  
  return (
    <div className="min-h-screen bg-background-dark">
      <Header />
      <div className="flex">
        <Sidebar />
        <main 
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-60'
          }`}
          style={{ marginTop: '60px', minHeight: 'calc(100vh - 60px)' }}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
