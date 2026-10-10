// Reusable collapsible error display: shows first line by default, full stack trace on click
// Style: red left-accent bar (callout) with subtle red-tinted background

import React, { useState } from 'react';

interface CollapsibleErrorProps {
  errorMessage: string;
}

const CollapsibleError: React.FC<CollapsibleErrorProps> = ({ errorMessage }) => {
  const [expanded, setExpanded] = useState(false);

  const errorLines = errorMessage.split('\n');
  const firstLine = errorLines[0] || '';
  const hasStackTrace = errorLines.length > 1;
  const stackTraceLines = errorLines.slice(1).join('\n');

  return (
    <div className="mt-2 pl-3 py-1.5 bg-[#3c1414]/40 border-l-2 border-[#f14c4c] rounded-r">
      {/* First line - always visible */}
      <div className="flex items-start gap-2">
        <svg
          className="w-3.5 h-3.5 text-[#f14c4c] mt-0.5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
        </svg>
        <pre className="text-xs text-[#f48771] whitespace-pre-wrap break-words font-mono m-0">
{firstLine}
        </pre>
      </div>

      {/* Collapsible stack trace */}
      {hasStackTrace && (
        <div className="mt-1.5 ml-5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-[#569cd6] hover:text-[#4daafc] transition-colors"
          >
            <svg
              className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="border-b border-dashed border-[#569cd6]">
              {expanded ? 'Hide stack trace' : `Show stack trace (${errorLines.length - 1} lines)`}
            </span>
          </button>
          {expanded && (
            <pre className="mt-1.5 pl-2 border-l border-[#f14c4c]/40 text-xs text-[#dcdcaa] whitespace-pre-wrap break-words font-mono overflow-x-auto">
{stackTraceLines}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default CollapsibleError;
