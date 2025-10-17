import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import MiniChatbot from '@/components/MiniChatbot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SkillSwap Hub - Peer Learning Marketplace',
  description: 'Connect with peers to exchange skills and grow together',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-slate-800 text-white py-12 mt-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/50"></div>
          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <div className="mb-6">
              <h3 className="text-2xl font-bold luxury-heading mb-2">SkillSwap Hub</h3>
              <p className="text-slate-300">Empowering peer-to-peer learning through AI-powered matching</p>
            </div>
            <p className="text-lg font-medium mb-4">Created by Ramdev Chaudhary</p>
            <div className="flex justify-center gap-6 text-sm mb-6">
              <a 
                href="https://github.com/ramoware" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-400 transition-colors flex items-center gap-2"
              >
                <span>GitHub Profile</span>
              </a>
              <span className="text-slate-600">•</span>
              <a 
                href="https://linkedin.com/in/ramdevchaudhary" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-400 transition-colors flex items-center gap-2"
              >
                <span>LinkedIn Profile</span>
              </a>
            </div>
            <div className="flex justify-center gap-4 text-xs text-slate-400">
              <span className="px-3 py-1 bg-slate-700 rounded-full">Next.js 15</span>
              <span className="px-3 py-1 bg-slate-700 rounded-full">TypeScript</span>
              <span className="px-3 py-1 bg-slate-700 rounded-full">PostgreSQL</span>
              <span className="px-3 py-1 bg-green-600 rounded-full">AI-Powered</span>
            </div>
          </div>
        </footer>
        <MiniChatbot />
      </body>
    </html>
  );
}