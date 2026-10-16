import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
          <Scissors className="w-6 h-6 -rotate-45" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">404</h1>
        <p className="text-sm font-semibold text-gray-700">Page Not Found</p>
        <p className="text-xs text-gray-500">
          The page you requested does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return Home
        </Link>
      </div>
    </div>
  );
};
