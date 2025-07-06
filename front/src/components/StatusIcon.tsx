// Status icons component for test results

import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { StatusIconProps } from '../types/cucumber';

const StatusIcon: React.FC<StatusIconProps> = ({ status, size = 'md' }) => {
  let sizeClass = '';
  switch(size) {
    case 'sm': sizeClass = 'w-3 h-3'; break;
    case 'md': sizeClass = 'w-4 h-4'; break;
    case 'lg': sizeClass = 'w-5 h-5'; break;
    default: sizeClass = 'w-4 h-4';
  }
  
  switch (status) {
    case 'passed': return <CheckCircle className={`${sizeClass} text-green-500`} />;
    case 'failed': return <XCircle className={`${sizeClass} text-red-500`} />;
    case 'pending': return <Clock className={`${sizeClass} text-yellow-500`} />;
    case 'skipped': return <AlertCircle className={`${sizeClass} text-gray-500`} />;
    case 'undefined': return <AlertCircle className={`${sizeClass} text-gray-400`} />;
    default: return <AlertCircle className={`${sizeClass} text-gray-400`} />;
  }
};

export default StatusIcon;
