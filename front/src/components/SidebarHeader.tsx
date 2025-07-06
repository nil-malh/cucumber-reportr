// Sidebar header with search and filter controls

import React from 'react';
import { Play, Search, Filter, BarChart3 } from 'lucide-react';
import type { FilterStatus } from '../types/cucumber';

interface SidebarHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  onOpenAnalytics: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ 
  searchTerm, 
  onSearchChange, 
  filterStatus, 
  onFilterChange,
  onOpenAnalytics
}) => {
  return (
    <div className="p-3 border-b border-[#3e3e42]">
      <div className="flex items-center space-x-2 mb-3">
        <Play className="w-4 h-4 text-[#16825d]" />
        <span className="text-xs font-semibold uppercase">Test Explorer</span>
      </div>
      
      {/* Search */}
      <div className="relative mb-2">
        <Search className="w-3 h-3 absolute left-2 top-2.5 text-[#858585]" />
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#3c3c3c] border border-[#3e3e42] rounded px-7 py-1.5 text-xs focus:outline-none focus:border-[#007acc]"
        />
      </div>
      
      {/* Filter and Analytics */}
      <div className="flex items-center space-x-1">
        <Filter className="w-3 h-3 text-[#858585]" />
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value as FilterStatus)}
          className="flex-1 bg-[#3c3c3c] border border-[#3e3e42] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#007acc]"
        >
          <option value="all">All Tests</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="skipped">Skipped</option>
        </select>
        <button
          onClick={onOpenAnalytics}
          className="p-1.5 bg-[#3c3c3c] border border-[#3e3e42] rounded hover:bg-[#4e4e4e] focus:outline-none focus:border-[#007acc] transition-colors"
          title="Open Global Analytics"
        >
          <BarChart3 className="w-3 h-3 text-[#4ec9b0]" />
        </button>
      </div>
    </div>
  );
};

export default SidebarHeader;
