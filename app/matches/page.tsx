'use client';

import { useEffect, useState } from 'react';
import { Sparkles, BookOpen, TrendingUp } from 'lucide-react';

interface Match {
  user: { id: string; name: string; bio: string | null };
  skillsOffered: Array<{ title: string; category: string }>;
  skillsWanted: Array<{ title: string; category: string }>;
  matchScore: number;
  matchReasons: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/ai/match');
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI-Powered Matches</h1>
          <p className="text-gray-600 text-lg">We found {matches.length} potential learning partners for you</p>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No matches found yet</p>
            <p className="text-gray-400">Add more skills to find compatible learning partners!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match, index) => (
              <div key={match.user.id} className="bg-white p-6 rounded-lg shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {match.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{match.user.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-purple-600">
                        <Sparkles className="w-3 h-3" />
                        {match.matchScore}% Match
                      </div>
                    </div>
                  </div>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                    #{index + 1}
                  </span>
                </div>

                {match.user.bio && (
                  <p className="text-gray-600 text-sm mb-4">{match.user.bio}</p>
                )}

                <div className="space-y-3 mb-4">
                  {match.skillsOffered.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        Offers
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {match.skillsOffered.slice(0, 3).map((skill, i) => (
                          <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                            {skill.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {match.skillsWanted.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Wants
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {match.skillsWanted.slice(0, 3).map((skill, i) => (
                          <span key={i} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                            {skill.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {match.matchReasons && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-900">{match.matchReasons}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}