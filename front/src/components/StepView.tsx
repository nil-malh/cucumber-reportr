// Step view component showing individual step details

import React from 'react';
import StatusIcon from './StatusIcon';
import { formatDuration } from '../utils/cucumberUtils';
import type { CucumberStep } from '../types/cucumber';

interface StepViewProps {
  step: CucumberStep;
}

const StepView: React.FC<StepViewProps> = ({ step }) => {
  return (
    <div>
      <div className="flex items-center mb-4">
        <StatusIcon status={step.result?.status || 'undefined'} size="lg" />
        <h2 className="text-lg ml-2">Step Details</h2>
      </div>
      <div className="bg-[#252526] rounded p-4 border border-[#3e3e42]">
        <div className="mb-2">
          <span className="text-[#c586c0]">{step.keyword}</span>
          <span className="text-[#ce9178]">{step.name}</span>
        </div>
        <div className="text-xs text-[#858585]">
          {step.line && `Line ${step.line}`}
          {step.line && step.result?.duration ? ' • ' : ''}
          {step.result?.duration ? `Duration: ${formatDuration(step.result.duration)}` : ''}
        </div>
        {/* Data table for individual step view */}
        {step.rows && step.rows.length > 0 && (
          <div className="mt-3">
            <table className="text-xs bg-[#1e1e1e] rounded">
              <tbody>
                {step.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx === 0 ? 'border-b border-[#3e3e42]' : ''}>
                    {row.cells?.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-1 border-r border-[#3e3e42] last:border-r-0">
                        <span className={rowIdx === 0 ? 'text-[#4ec9b0] font-semibold' : 'text-[#ce9178]'}>
                          {cell}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {step.result?.error_message && (
          <pre className="mt-3 p-2 bg-[#1e1e1e] border border-[#f14c4c] rounded text-xs text-[#f48771] overflow-x-auto">
{step.result.error_message}
          </pre>
        )}
      </div>
    </div>
  );
};

export default StepView;
