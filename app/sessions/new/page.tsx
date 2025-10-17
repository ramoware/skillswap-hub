'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Skill {
  id: string;
  title: string;
}

export default function NewSessionPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillId: '',
    date: '',
    duration: 60,
    mode: 'online' as 'online' | 'in-person',
    maxParticipants: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills?type=offer');
      const data = await res.json();
      setSkills(data);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.title || !formData.description || !formData.skillId || !formData.date) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.title.length < 3) {
      setError('Session title must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (formData.description.length < 10) {
      setError('Description must be at least 10 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/sessions');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while creating the session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6">Create Learning Session</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Session Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg h-32"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Related Skill</label>
              <select
                value={formData.skillId}
                onChange={(e) => setFormData({...formData, skillId: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Select a skill</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration (min)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="15"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({...formData, mode: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Participants</label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
              <Link
                href="/sessions"
                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}