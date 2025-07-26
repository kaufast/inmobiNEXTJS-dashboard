import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { I18nDebugTools } from '../debug';

interface BaseLayoutProps {
  children: React.ReactNode;
  showDebugTools?: boolean;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children, showDebugTools = process.env.NODE_ENV === 'development' }) => {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      <Navbar />
      <main className="flex-grow px-4 sm:px-6 md:px-8 pt-4 pb-16">
        {children}
      </main>
      <Footer />
      {showDebugTools && <I18nDebugTools />}
    </div>
  );
};

export default BaseLayout;
