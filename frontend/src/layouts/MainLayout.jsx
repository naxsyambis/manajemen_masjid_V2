import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = ({ children, activeMenu, setActiveMenu, onLogout, user }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-gray-50">

      {}
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        onLogout={onLogout}
        user={user} 
      />

      {}
      <div className="flex-1 flex flex-col w-full transition-all duration-300">

        {}
        <Navbar 
          setIsOpen={setIsOpen} 
        />

        {}
        <main className="flex-1 p-4 md:p-8 animate-fadeIn relative">
          {children}
        </main>

      </div>
    </div>
  );
};

export default MainLayout;