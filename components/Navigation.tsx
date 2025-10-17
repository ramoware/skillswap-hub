'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, BookOpen, Users, Sparkles, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isAuthPage) return null;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/skills', label: 'Skills', icon: BookOpen },
    { href: '/sessions', label: 'Sessions', icon: Users },
    { href: '/matches', label: 'AI Matches', icon: Sparkles, badge: 'ENHANCED' },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold luxury-heading hover:scale-105 transition-transform">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              SkillSwap Hub
            </Link>
            
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map(({ href, label, icon: Icon, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    pathname === href
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-slate-700 hover:bg-green-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {badge && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-300 font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 animate-luxury-slide-in">
            <div className="space-y-2">
              {navLinks.map(({ href, label, icon: Icon, badge }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    pathname === href
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-slate-700 hover:bg-green-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                  {badge && (
                    <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}