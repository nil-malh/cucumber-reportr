// Feature view component showing complete feature file content

import React from 'react';
import StatusIcon from './StatusIcon';
import { formatDuration, getScenarioStatus } from '../utils/cucumberUtils';
import type { CucumberFeature, CucumberScenario } from '../types/cucumber';

interface FeatureViewProps {
  feature: CucumberFeature | CucumberScenario;
}

const FeatureView: React.FC<FeatureViewProps> = ({ feature }) => {
  // Type guard to check if it's a feature
  const selectedItem = 'elements' in feature ? feature : null;
  
  if (!selectedItem) {
    return (
      <div className="text-center text-[#858585] p-8">
        <p>Invalid feature data</p>
      </div>
    );
  }

  return (
    <div className="font-mono">
      {/* Feature File View */}
      <div className="bg-[#252526] rounded p-4 mb-4 border border-[#3e3e42]">
        <h3 className="text-sm font-bold mb-3 text-[#4ec9b0]">Feature File: {selectedItem.uri}</h3>
        
        <div className="text-sm">
          {/* Feature header */}
          <div className="mb-4">
            <span className="text-[#c586c0]">Feature: </span>
            <span className="text-[#ce9178]">{selectedItem.name}</span>
            {selectedItem.description && (
              <div className="mt-2 ml-2 text-[#9cdcfe] text-xs">
                {selectedItem.description}
              </div>
            )}
          </div>
          
          {/* Background - display once at the feature level */}
          {(() => {
            const background = selectedItem.elements?.find(e => e.type === 'background');
            
            return background && (
              <div className="mb-4 ml-2">
                <div className="text-[#c586c0] mb-2">Background:</div>
                {background.steps?.map((step, idx) => (
                  <div key={idx} className="ml-4 mb-2">
                    <div className="flex items-start">
                      {step.result && <StatusIcon status={step.result.status} size="sm" />}
                      <div className="ml-2 flex-1">
                        <div>
                          <span className="text-[#c586c0]">{step.keyword}</span>
                          <span className="text-[#9cdcfe]">{step.name}</span>
                          {step.result?.duration && (
                            <span className="ml-2 text-xs text-[#858585]">
                              ({formatDuration(step.result.duration)})
                            </span>
                          )}
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
                        {step.result?.error_message && (
                          <div className="mt-2 p-2 bg-[#1e1e1e] border border-[#f14c4c] rounded text-xs text-[#f48771]">
                            <pre className="whitespace-pre-wrap">{step.result.error_message}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          
          {/* All Scenarios */}
          {selectedItem.elements?.filter(e => e.type === 'scenario').map((scenario, scenarioIdx) => (
            <div key={scenarioIdx} className="mb-6 ml-2">
              {/* Tags */}
              {scenario.tags && scenario.tags.length > 0 && (
                <div className="text-[#4ec9b0] mb-1">
                  {scenario.tags.map(tag => tag.name).join(' ')}
                </div>
              )}
              
              {/* Scenario header */}
              <div className="mb-2">
                <span className="text-[#c586c0]">Scenario: </span>
                <span className="text-[#ce9178]">{scenario.name}</span>
              </div>
              
              {/* Steps */}
              {scenario.steps?.map((step, idx) => (
                <div key={idx} className="ml-4 mb-2">
                  <div className="flex items-start">
                    {step.result ? <StatusIcon status={step.result.status} size="sm" /> : <div className="w-3 h-3 mr-1"></div>}
                    <div className="ml-2 flex-1">
                      <div>
                        <span className="text-[#c586c0]">{step.keyword || ''}</span>
                        <span className="text-[#9cdcfe]">{step.name || 'Unnamed step'}</span>
                        {step.result?.duration && (
                          <span className="ml-2 text-xs text-[#858585]">
                            ({formatDuration(step.result.duration)})
                          </span>
                        )}
                        {step.line && (
                          <span className="ml-2 text-xs text-[#858585]">
                            (Line {step.line})
                          </span>
                        )}
                      </div>
                      {step.rows && step.rows.length > 0 && (
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
                      {step.result?.error_message && (
                        <div className="mt-2 p-2 bg-[#1e1e1e] border border-[#f14c4c] rounded text-xs text-[#f48771]">
                          <pre className="whitespace-pre-wrap">{step.result.error_message}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Feature Statistics */}
      <div className="bg-[#252526] rounded p-4 border border-[#3e3e42]">
        <h3 className="text-sm font-bold mb-3 text-[#4ec9b0]">Feature Statistics</h3>
        {(() => {
          const scenarios = selectedItem.elements?.filter(e => e.type === 'scenario') || [];
          const backgroundSteps = selectedItem.elements?.find(e => e.type === 'background')?.steps || [];
          const allSteps = scenarios.flatMap(s => s.steps || []);
          
          const scenarioStats = {
            total: scenarios.length,
            passed: scenarios.filter(s => getScenarioStatus(s) === 'passed').length,
            failed: scenarios.filter(s => getScenarioStatus(s) === 'failed').length,
            pending: scenarios.filter(s => getScenarioStatus(s) === 'pending').length,
            skipped: scenarios.filter(s => getScenarioStatus(s) === 'skipped').length,
          };
          
          const stepStats = {
            total: allSteps.length,
            passed: allSteps.filter(s => s.result?.status === 'passed').length,
            failed: allSteps.filter(s => s.result?.status === 'failed').length,
            pending: allSteps.filter(s => s.result?.status === 'pending').length,
            skipped: allSteps.filter(s => s.result?.status === 'skipped').length,
          };
          
          const totalDuration = allSteps
            .filter(s => s.result?.duration)
            .reduce((sum, s) => sum + (s.result?.duration || 0), 0);
          
          return (
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="text-[#4ec9b0] mb-2">Scenarios</h4>
                <div className="space-y-1">
                  <div>Total: {scenarioStats.total}</div>
                  <div className="text-green-500">Passed: {scenarioStats.passed}</div>
                  <div className="text-red-500">Failed: {scenarioStats.failed}</div>
                  <div className="text-yellow-500">Pending: {scenarioStats.pending}</div>
                  <div className="text-gray-500">Skipped: {scenarioStats.skipped}</div>
                </div>
              </div>
              <div>
                <h4 className="text-[#4ec9b0] mb-2">Steps</h4>
                <div className="space-y-1">
                  <div>Total: {stepStats.total}</div>
                  <div className="text-green-500">Passed: {stepStats.passed}</div>
                  <div className="text-red-500">Failed: {stepStats.failed}</div>
                  <div className="text-yellow-500">Pending: {stepStats.pending}</div>
                  <div className="text-gray-500">Skipped: {stepStats.skipped}</div>
                  <div className="text-[#858585] mt-2">
                    Duration: {formatDuration(totalDuration)}
                  </div>
                  {backgroundSteps.length > 0 && (
                    <div className="text-[#858585]">
                      Background Steps: {backgroundSteps.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default FeatureView;
