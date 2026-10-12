import { Plus } from 'lucide-react';
import { useState } from 'react';
import CurrentUser from './CurrentUser';

export default function AddNewLead({ onNewLeadClick,CurrentUser }) {
  
  return (
    <div className="flex justify-between items-center mb-8">
      <p className="text-gray-500">
        Welcome back, {CurrentUser?.name} at {CurrentUser?.company}. Here is your sales summary.
      </p>

      <button
        onClick={onNewLeadClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
      >
        <Plus size={16} />
        New Deal
      </button>
    </div>
  );
}