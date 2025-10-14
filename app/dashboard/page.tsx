'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, BookOpen, Users, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  skillsOffered: number;
  skillsWanted: number;
  sessionsHosted: number;
  sessionsJoined: number;
}

interface Skill {
  id: string;
  title: string;
  category: string;
  level: string;
  type: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    skillsOffered: 0,
    skillsWanted: 0,
    sessionsHosted: 0,
    sessionsJoined: 0,
  });
  const [recentSkills, setRecentSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setStats(data.stats);
      setRecentSkills(data.recentSkills);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600 mt-2 text-lg">Here&apos;s your learning overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Skills Offered"
            value={stats.skillsOffered}
            color="bg-blue-500"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Skills Wanted"
            value={stats.skillsWanted}
            color="bg-green-500"
            bgColor="bg-green-50"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Sessions Hosted"
            value={stats.sessionsHosted}
            color="bg-purple-500"
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Sessions Joined"
            value={stats.sessionsJoined}
            color="bg-orange-500"
            bgColor="bg-orange-50"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ActionCard
            href="/skills/new"
            icon={<PlusCircle className="w-6 h-6" />}
            title="Add Skill"
            description="Offer or request a skill"
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <ActionCard
            href="/sessions/new"
            icon={<Users className="w-6 h-6" />}
            title="Create Session"
            description="Host a learning session"
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <ActionCard
            href="/matches"
            icon={<TrendingUp className="w-6 h-6" />}
            title="AI Matches"
            description="Find skill partners"
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        {/* Recent Skills */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Skills</h2>
            <Link href="/skills" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentSkills.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No skills yet</p>
                <Link 
                  href="/skills/new"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add your first skill →
                </Link>
              </div>
            ) : (
              recentSkills.map((skill) => (
                <div key={skill.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{skill.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {skill.category} • {skill.level}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        skill.type === 'offer'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {skill.type === 'offer' ? 'Offering' : 'Wanting'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} ${bgColor} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
  bgColor,
  iconColor,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1"
    >
      <div className="flex items-center space-x-4">
        <div className={`${bgColor} p-3 rounded-lg ${iconColor}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>
    </Link>
  );
}