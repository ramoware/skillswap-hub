'use client';

import { useEffect, useState } from 'react';
import { Sparkles, BookOpen, TrendingUp, Users, Star, Heart, MessageCircle, Filter, Search, Zap, Target, Award, Brain, BarChart3, Clock, MapPin } from 'lucide-react';
import { findAIMatches, analyzeMatchPatterns, generateMatchNotifications, type SkillMatch, type MatchPreferences } from '@/lib/ai-matching';

interface Match {
  user: { id: string; name: string; bio: string | null };
  skillsOffered: Array<{ title: string; category: string }>;
  skillsWanted: Array<{ title: string; category: string }>;
  matchScore: number;
  matchReasons: string;
}

interface Skill {
  id: string;
  title: string;
  category: string;
  level: string;
  type: string;
  description: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [aiMatches, setAiMatches] = useState<SkillMatch[]>([]);
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minScore, setMinScore] = useState(70);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [matchAnalysis, setMatchAnalysis] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'basic' | 'enhanced'>('enhanced');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      // Fetch both basic and enhanced matches
      const [basicRes, skillsRes, allSkillsRes] = await Promise.all([
        fetch('/api/ai/match'),
        fetch('/api/skills'),
        fetch('/api/skills?type=all')
      ]);

      if (basicRes.ok) {
        const basicData = await basicRes.json();
        setMatches(basicData.matches || []);
      }

      if (skillsRes.ok && allSkillsRes.ok) {
        const userSkillsData = await skillsRes.json();
        const allSkillsData = await allSkillsRes.json();
        
        setUserSkills(userSkillsData.skills || []);
        setAllSkills(allSkillsData.skills || []);
        
        // Generate AI matches
        const preferences: MatchPreferences = {
          preferredCategories: ['Programming', 'Design', 'Data Science'],
          preferredLevels: ['Intermediate', 'Advanced'],
        };
        
        const enhancedMatches = await findAIMatches(
          'current-user', // In real app, get from auth
          userSkillsData.skills || [],
          allSkillsData.skills || [],
          preferences
        );
        
        setAiMatches(enhancedMatches);
        
        // Analyze match patterns
        const analysis = analyzeMatchPatterns(enhancedMatches);
        setMatchAnalysis(analysis);
        
        // Generate notifications
        const newNotifications = generateMatchNotifications(enhancedMatches);
        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBasicMatches = matches.filter(match => {
    const matchesSearch = match.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.skillsOffered.some(skill => skill.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         match.skillsWanted.some(skill => skill.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesScore = match.matchScore >= minScore;
    return matchesSearch && matchesScore;
  });

  const filteredAiMatches = aiMatches.filter(match => {
    const matchesSearch = match.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.skillTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.skillCategory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || match.skillCategory === selectedCategory;
    const matchesLevel = !selectedLevel || match.skillLevel === selectedLevel;
    const matchesScore = match.compatibilityScore >= minScore;
    
    return matchesSearch && matchesCategory && matchesLevel && matchesScore;
  });

  const categories = [...new Set(aiMatches.map(m => m.skillCategory))];
  const levels = [...new Set(aiMatches.map(m => m.skillLevel))];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-luxury-slide-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl font-bold luxury-heading">AI-Powered Matches</h1>
            <Brain className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover perfect skill exchange partners using advanced AI matching algorithms
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setViewMode('enhanced')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${
                viewMode === 'enhanced'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Enhanced AI
              </div>
            </button>
            <button
              onClick={() => setViewMode('basic')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${
                viewMode === 'basic'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Basic Matches
              </div>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && viewMode === 'enhanced' && (
          <div className="mb-8 space-y-4">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="luxury-card p-6 animate-luxury-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    notification.priority === 'high' ? 'bg-green-500' :
                    notification.priority === 'medium' ? 'bg-orange-500' :
                    'bg-slate-500'
                  }`}>
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900">{notification.title}</h3>
                    <p className="text-slate-600">{notification.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {viewMode === 'enhanced' && matchAnalysis && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="luxury-card p-6 text-center animate-luxury-slide-in">
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-600">{matchAnalysis.averageCompatibility.toFixed(1)}%</h3>
              <p className="text-slate-600">Average Compatibility</p>
            </div>
            
            <div className="luxury-card p-6 text-center animate-luxury-slide-in" style={{ animationDelay: '0.1s' }}>
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-600">{aiMatches.length}</h3>
              <p className="text-slate-600">AI Matches Found</p>
            </div>
            
            <div className="luxury-card p-6 text-center animate-luxury-slide-in" style={{ animationDelay: '0.2s' }}>
              <Target className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-orange-500">{matchAnalysis.topCategories.length}</h3>
              <p className="text-slate-600">Skill Categories</p>
            </div>
            
            <div className="luxury-card p-6 text-center animate-luxury-slide-in" style={{ animationDelay: '0.3s' }}>
              <BarChart3 className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800">{userSkills.length}</h3>
              <p className="text-slate-600">Your Skills</p>
            </div>
          </div>
        )}

        {viewMode === 'basic' && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="luxury-card p-6 text-center animate-luxury-slide-in">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-600">{matches.length}</h3>
              <p className="text-slate-600">Total Matches</p>
            </div>
            
            <div className="luxury-card p-6 text-center animate-luxury-slide-in" style={{ animationDelay: '0.1s' }}>
              <Star className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-orange-500">
                {matches.length > 0 ? (matches.reduce((sum, match) => sum + match.matchScore, 0) / matches.length).toFixed(1) : 0}%
              </h3>
              <p className="text-slate-600">Average Compatibility</p>
            </div>
            
            <div className="luxury-card p-6 text-center animate-luxury-slide-in" style={{ animationDelay: '0.2s' }}>
              <Target className="w-12 h-12 text-slate-800 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800">
                {matches.filter(m => m.matchScore >= 80).length}
              </h3>
              <p className="text-slate-600">High-Quality Matches</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="luxury-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={viewMode === 'enhanced' ? "Search AI matches by skill, user, or category..." : "Search matches by name or skills..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="luxury-input w-full pl-10"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="luxury-button flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 animate-luxury-slide-in">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min Compatibility: {minScore}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                {viewMode === 'enhanced' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="luxury-input w-full"
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Skill Level</label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="luxury-input w-full"
                      >
                        <option value="">All Levels</option>
                        {levels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced AI Matches */}
        {viewMode === 'enhanced' && (
          <>
            {filteredAiMatches.length === 0 ? (
              <div className="luxury-card p-12 text-center">
                <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No AI matches found</h3>
                <p className="text-slate-500 mb-6">
                  {aiMatches.length === 0 
                    ? "Add more skills to your profile to find AI-powered matches!"
                    : "Try adjusting your filters or search terms"
                  }
                </p>
                <button className="luxury-button">
                  Add Skills to Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAiMatches.map((match, index) => (
                  <div
                    key={`${match.userId}-${match.skillId}`}
                    className="luxury-card p-6 hover:shadow-glow transition-all duration-300 animate-luxury-slide-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Compatibility Score */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          {match.userName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900">{match.userName}</h3>
                          <p className="text-sm text-slate-600">{match.skillCategory}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-orange-500 fill-current" />
                          <span className="font-bold text-lg text-green-600">{match.compatibilityScore}%</span>
                        </div>
                        <p className="text-xs text-slate-500">Match</p>
                      </div>
                    </div>

                    {/* Skill Details */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-slate-900 mb-2">{match.skillTitle}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          {match.skillLevel}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs rounded-full font-medium">
                          {match.skillCategory}
                        </span>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="mb-4">
                      <p className="text-sm text-slate-600 mb-2">Why this is a great match:</p>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <Heart className="w-3 h-3 text-green-500" />
                          <span>Perfect skill level compatibility</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="w-3 h-3 text-slate-500" />
                          <span>Complementary skill categories</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Award className="w-3 h-3 text-orange-500" />
                          <span>High demand skill area</span>
                        </li>
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 luxury-button text-sm py-2">
                        Connect
                      </button>
                      <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Basic Matches */}
        {viewMode === 'basic' && (
          <>
            {filteredBasicMatches.length === 0 ? (
              <div className="luxury-card p-12 text-center">
                <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No matches found</h3>
                <p className="text-slate-500 mb-6">
                  {matches.length === 0 
                    ? "Add more skills to your profile to find compatible learning partners!"
                    : "Try adjusting your filters or search terms"
                  }
                </p>
                <button className="luxury-button">
                  Add Skills to Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBasicMatches.map((match, index) => (
                    <div
                      key={match.user.id}
                      className="luxury-card p-6 hover:shadow-glow transition-all duration-300 animate-luxury-slide-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Match Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {match.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{match.user.name}</h3>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 text-orange-500 fill-current" />
                              <span className="font-semibold text-green-600">{match.matchScore}% Match</span>
                            </div>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Bio */}
                      {match.user.bio && (
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{match.user.bio}</p>
                      )}

                      {/* Skills Offered */}
                      {match.skillsOffered.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                            <BookOpen className="w-4 h-4 text-green-600" />
                            <span>Offers ({match.skillsOffered.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {match.skillsOffered.slice(0, 3).map((skill, i) => (
                              <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                                {skill.title}
                              </span>
                            ))}
                            {match.skillsOffered.length > 3 && (
                              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs">
                                +{match.skillsOffered.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills Wanted */}
                      {match.skillsWanted.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                            <span>Wants ({match.skillsWanted.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {match.skillsWanted.slice(0, 3).map((skill, i) => (
                              <span key={i} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                                {skill.title}
                              </span>
                            ))}
                            {match.skillsWanted.length > 3 && (
                              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs">
                                +{match.skillsWanted.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Match Reasons */}
                      {match.matchReasons && (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
                          <div className="flex items-start gap-2">
                            <Award className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-green-900">{match.matchReasons}</p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 luxury-button text-sm py-2 flex items-center justify-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Connect
                        </button>
                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        {/* Recommendations */}
        {viewMode === 'enhanced' && matchAnalysis?.recommendations && (
          <div className="luxury-card p-6 mt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              AI Recommendations
            </h3>
            <div className="space-y-2">
              {matchAnalysis.recommendations.map((rec: string, index: number) => (
                <p key={index} className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  {rec}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}