import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

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
        <footer className="bg-gray-900 text-white py-8 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-lg font-medium mb-2">Created by Ramdev Chaudhary</p>
            <div className="flex justify-center gap-6 text-sm">
              <a 
                href="https://github.com/ramoware" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors"
              >
                GitHub Profile
              </a>
              <span className="text-gray-600">•</span>
              <a 
                href="https://linkedin.com/in/ramdevchaudhary" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors"
              >
                LinkedIn Profile
              </a>
            </div>
            <p className="text-gray-400 text-xs mt-4">
              Built with Next.js 15, TypeScript, PostgreSQL & AI
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}