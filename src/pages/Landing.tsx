import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Palette, Lock, GraduationCap, Check } from 'lucide-react';

export default function Landing() {
  return (
    <div className="bg-gray-900">
      {/* Sticky Navigation */}
      <div className="fixed top-0 inset-x-0 z-50 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75 border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-indigo-500" />
              <span className="ml-2 text-xl font-bold text-white">My PhD Website</span>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
            >
              Launch App
            </Link>
          </div>
        </nav>
      </div>

      {/* Add padding to account for fixed nav */}
      <div className="pt-16">
        {/* Rest of the Landing page content remains the same */}
        {/* ... */}
      </div>
    </div>
  );
}