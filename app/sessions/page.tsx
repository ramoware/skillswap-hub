'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Users, MapPin, Video, Trash2 } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  mode: string;
  maxParticipants: number;
  status: string;
  host: { id: string; name: string };
  skill: { title: string; category: string };
  participants: { id: string; name: string }[];
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      const res = await fetch(`/api/sessions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions(sessions.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Sessions</h1>
            <p className="text-gray-600 mt-1">Browse and join sessions</p>
          </div>
          <Link
            href="/sessions/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg"
          >
            Create Session
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No sessions yet</p>
            <p className="text-gray-400 mt-2">Create your first session!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-4">{session.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {session.duration} minutes
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {session.mode === 'online' ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    {session.mode === 'online' ? 'Online' : 'In-Person'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {session.participants.length} / {session.maxParticipants} participants
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                    {session.skill.category}
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                    {session.status}
                  </span>
                </div>

                <div className="text-sm text-gray-500">
                  Hosted by <span className="font-medium">{session.host.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}