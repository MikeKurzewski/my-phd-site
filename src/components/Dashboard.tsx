import React from 'react';
import { User } from '../types';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const calculateProfileCompletion = (user: User) => {
    const fields = [
      user.name,
      user.title,
      user.institution,
      user.department,
      user.bio,
      user.profileImage,
    ];
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const completion = calculateProfileCompletion(user);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome, {user.name}!</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-medium text-gray-900">{completion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 rounded-full h-2"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <ul className="space-y-3">
            <li>
              <a
                href="/profile"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Complete your profile
              </a>
            </li>
            <li>
              <a
                href="/projects"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Add a new project
              </a>
            </li>
            <li>
              <a
                href="/publications"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Add a publication
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Website Preview</h3>
          <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
            <span className="text-gray-500">Preview coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}