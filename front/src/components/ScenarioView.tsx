// Scenario view component showing individual scenario details

import React from 'react';
import StatusIcon from './StatusIcon';
import { formatDuration, getScenarioStatus } from '../utils/cucumberUtils';
import type { CucumberScenario, CucumberReport, CucumberFeature } from '../types/cucumber';

interface ScenarioViewProps {
  scenario: CucumberFeature | CucumberScenario;
  reportData: CucumberReport;
}

const ScenarioView: React.FC<ScenarioViewProps> = ({ scenario, reportData }) => {
  // Type guard to check if it's a scenario
  const selectedItem = 'steps' in scenario ? scenario : null;
  
  if (!selectedItem) {
    return (
      <div className="text-center text-[#858585] p-8">
        <p>Invalid scenario data</p>
      </div>
    );
  }

  return (
    <div className="font-mono">
      {/* Gherkin Feature File View */}
      <div className="bg-[#252526] rounded p-4 mb-4 border border-[#3e3e42]">
        <h3 className="text-sm font-bold mb-3 text-[#4ec9b0]">Scenario View</h3>
        
        {/* Find the parent feature */}
        {(() => {
          const parentFeature = reportData.find(f => 
            f.elements.some(e => e.id === selectedItem.id)
          );
          
          return (
            <div className="text-sm">
              {/* Feature header */}
              <div className="mb-3">
                <span className="text-[#c586c0]">Feature: </span>
                <span className="text-[#ce9178]">{parentFeature?.name}</span>
              </div>
              
              {/* Note about background */}
              {parentFeature?.elements.find(e => e.type === 'background') && (
                <div className="mb-3 text-xs text-[#858585] italic">
                  Note: Background steps are executed before this scenario (click on feature to see background)
                </div>
              )}
              
              {/* Scenario */}
              <div className="ml-2">
                {/* Tags */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="text-[#4ec9b0] mb-1">
                    {selectedItem.tags.map(tag => tag.name).join(' ')}
                  </div>
                )}
                
                {/* Scenario header */}
                <div className="mb-1">
                  <span className="text-[#c586c0]">Scenario: </span>
                  <span className="text-[#ce9178]">{selectedItem.name}</span>
                </div>
                
                {/* Steps */}
                {selectedItem.steps?.map((step, idx) => (
                  <div key={idx} className="ml-4 mb-2">
                    <div>
                      <span className="text-[#c586c0]">{step.keyword}</span>
                      <span className="text-[#9cdcfe]">{step.name}</span>
                    </div>
                    {step.rows && (
                      <div className="ml-2 mt-1">
                        <table className="text-xs">
                          <tbody>
                            {step.rows.map((row, rowIdx) => (
                              <tr key={rowIdx}>
                                {row.cells?.map((cell, cellIdx) => (
                                  <td key={cellIdx} className="px-2 py-0.5 text-[#ce9178]">
                                    | {cell}
                                  </td>
                                ))}
                                <td className="text-[#ce9178]">|</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
      
      {/* Test Execution Details */}
      <div className="mb-4">
        <h3 className="text-sm font-bold mb-3 text-[#4ec9b0]">Execution Details</h3>
        <div className="flex items-center mb-2">
          <StatusIcon status={getScenarioStatus(selectedItem)} size="lg" />
          <h2 className="text-lg ml-2">{selectedItem.name}</h2>
        </div>
      </div>
      
      <div className="space-y-3">
        {selectedItem.steps?.map((step, idx) => (
          <div key={idx} className="bg-[#252526] rounded p-3 border border-[#3e3e42]">
            <div className="flex items-start">
              <span className="text-[#858585] mr-3 text-xs">{step.line}</span>
              <div className="flex-1">
                <div className="flex items-center">
                  <StatusIcon status={step?.result?.status || 'undefined'} size="md" />
                  <span className="ml-2">
                    <span className="text-[#c586c0]">{step.keyword}</span>
                    <span className="text-[#ce9178]">{step.name}</span>
                  </span>
                  {step?.result?.duration && step.result.duration > 0 && (
                    <span className="ml-auto text-xs text-[#858585]">
                      {formatDuration(step.result.duration)}
                    </span>
                  )}
                </div>
                {/* Data table */}
                {step.rows && step.rows.length > 0 && (
                  <div className="mt-2 ml-6">
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
                {step?.result?.error_message && (
                  <pre className="mt-2 p-2 bg-[#1e1e1e] border border-[#f14c4c] rounded text-xs text-[#f48771] overflow-x-auto">
{step.result.error_message}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScenarioView;
