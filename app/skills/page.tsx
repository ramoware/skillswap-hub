'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, BookOpen, TrendingUp } from 'lucide-react';

interface Skill {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  type: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'offer' | 'want'>('all');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      setSkills(data);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    
    try {
      const res = await fetch(`/api/skills?id=${id}`, { method: 'DELETE' });
      
      if (res.ok) {
        setSkills(skills.filter(s => s.id !== id));
      } else {
        alert('Failed to delete skill');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred');
    }
  };

  const filteredSkills = skills.filter(skill => {
    if (filter === 'all') return true;
    return skill.type === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Skills</h1>
            <p className="text-gray-600 mt-1">Browse and manage skills in the community</p>
          </div>
          <Link
            href="/skills/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            Add Skill
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Skills
          </button>
          <button
            onClick={() => setFilter('offer')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              filter === 'offer'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Offering
          </button>
          <button
            onClick={() => setFilter('want')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              filter === 'want'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Wanting
          </button>
        </div>

        {/* Skills Grid */}
        {filteredSkills.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No skills found</p>
            <p className="text-gray-400 mt-2">Be the first to add a skill!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <div key={skill.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    skill.type === 'offer' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {skill.type === 'offer' ? 'Offering' : 'Wanting'}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.location.href = `/skills/edit/${skill.id}`}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(skill.id)}
                      className="text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{skill.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{skill.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {skill.category}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {skill.level}
                  </span>
                </div>

                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                    {skill.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{skill.user.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}