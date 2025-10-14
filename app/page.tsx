import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Learn. Teach. <span className="text-blue-600">Grow Together.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with peers to exchange skills, host learning sessions, and discover your next learning partner with AI-powered matching.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 border-2 border-gray-200 shadow hover:shadow-lg transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Skill Exchange</h3>
            <p className="text-gray-600">
              Offer skills you excel at and request skills you want to learn. Find the perfect match.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Learning Sessions</h3>
            <p className="text-gray-600">
              Host or join interactive learning sessions. Build a community of learners.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Matching</h3>
            <p className="text-gray-600">
              Discover ideal learning partners with our AI-powered skill matching system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}