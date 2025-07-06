// Global execution analytics component with charts and metrics

import React, { useMemo } from 'react';
import { 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Target,
  Timer,
  Activity
} from 'lucide-react';
import { formatDuration, getScenarioStatus } from '../utils/cucumberUtils';
import type { CucumberReport } from '../types/cucumber';

interface GlobalAnalyticsProps {
  reportData: CucumberReport;
}

interface ChartDataItem {
  label: string;
  value: number;
  color: string;
  strokeColor?: string;
}

interface FeatureStats {
  name: string;
  scenarios: number;
  steps: number;
  passed: number;
  failed: number;
  duration: number;
}

interface Analytics {
  scenarios: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    skipped: number;
  };
  steps: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    skipped: number;
  };
  features: {
    total: number;
  };
  executionTime: {
    total: number;
    average: number;
    min: number;
    max: number;
  };
  passRate: number;
  failRate: number;
  stepDurations: number[];
  scenarioDurations: number[];
  featureStats: FeatureStats[];
}

const GlobalAnalytics: React.FC<GlobalAnalyticsProps> = ({ reportData }) => {
  // Calculate comprehensive analytics from report data
  const analytics = useMemo((): Analytics => {
    if (!reportData || reportData.length === 0) {
      return {
        scenarios: { total: 0, passed: 0, failed: 0, pending: 0, skipped: 0 },
        steps: { total: 0, passed: 0, failed: 0, pending: 0, skipped: 0 },
        features: { total: 0 },
        executionTime: { total: 0, average: 0, min: 0, max: 0 },
        passRate: 0,
        failRate: 0,
        stepDurations: [],
        scenarioDurations: [],
        featureStats: []
      };
    }

    const scenarios: any[] = [];
    const steps: any[] = [];
    const features: FeatureStats[] = [];
    
    // Process all data
    reportData.forEach(feature => {
      const featureScenarios = feature.elements?.filter(e => e.type === 'scenario') || [];
      const featureSteps = featureScenarios.flatMap(s => s.steps || []);
      
      features.push({
        name: feature.name || feature.uri,
        scenarios: featureScenarios.length,
        steps: featureSteps.length,
        passed: featureScenarios.filter(s => getScenarioStatus(s) === 'passed').length,
        failed: featureScenarios.filter(s => getScenarioStatus(s) === 'failed').length,
        duration: featureSteps.reduce((sum, step) => sum + (step.result?.duration || 0), 0)
      });
      
      scenarios.push(...featureScenarios);
      steps.push(...featureSteps);
    });

    // Calculate scenario stats
    const scenarioStats = {
      total: scenarios.length,
      passed: scenarios.filter(s => getScenarioStatus(s) === 'passed').length,
      failed: scenarios.filter(s => getScenarioStatus(s) === 'failed').length,
      pending: scenarios.filter(s => getScenarioStatus(s) === 'pending').length,
      skipped: scenarios.filter(s => getScenarioStatus(s) === 'skipped').length,
    };

    // Calculate step stats
    const stepStats = {
      total: steps.length,
      passed: steps.filter(s => s.result?.status === 'passed').length,
      failed: steps.filter(s => s.result?.status === 'failed').length,
      pending: steps.filter(s => s.result?.status === 'pending').length,
      skipped: steps.filter(s => s.result?.status === 'skipped').length,
    };

    // Calculate execution times
    const stepDurations = steps
      .filter(s => s.result?.duration > 0)
      .map(s => s.result.duration);
    
    const scenarioDurations = scenarios.map(scenario => {
      const scenarioSteps = scenario.steps || [];
      return scenarioSteps.reduce((sum: number, step: any) => sum + (step.result?.duration || 0), 0);
    }).filter(d => d > 0);

    const totalExecutionTime = stepDurations.reduce((sum, d) => sum + d, 0);
    const averageStepTime = stepDurations.length > 0 ? totalExecutionTime / stepDurations.length : 0;

    return {
      scenarios: scenarioStats,
      steps: stepStats,
      features: { total: features.length },
      executionTime: {
        total: totalExecutionTime,
        average: averageStepTime,
        min: stepDurations.length > 0 ? Math.min(...stepDurations) : 0,
        max: stepDurations.length > 0 ? Math.max(...stepDurations) : 0
      },
      passRate: scenarioStats.total > 0 ? (scenarioStats.passed / scenarioStats.total) * 100 : 0,
      failRate: scenarioStats.total > 0 ? (scenarioStats.failed / scenarioStats.total) * 100 : 0,
      stepDurations,
      scenarioDurations,
      featureStats: features.sort((a, b) => b.duration - a.duration)
    };
  }, [reportData]);

  // Create simple chart components
  const BarChart: React.FC<{ data: ChartDataItem[]; title: string; className?: string }> = ({ 
    data, 
    title, 
    className = "" 
  }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className={`bg-[#252526] rounded p-4 border border-[#3e3e42] ${className}`}>
        <h3 className="text-sm font-bold mb-3 text-[#4ec9b0]">{title}</h3>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-20 text-xs text-right mr-2 text-[#858585]">
                {item.label}
              </div>
              <div className="flex-1 bg-[#1e1e1e] rounded h-4 relative">
                <div 
                  className={`h-full rounded transition-all duration-300 ${item.color}`}
                  style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs text-[#cccccc]">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const DonutChart: React.FC<{ data: ChartDataItem[]; title: string; className?: string }> = ({ 
    data, 
    title, 
    className = "" 
  }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className={`bg-[#252526] rounded p-4 border border-[#3e3e42] ${className}`}>
        <h3 className="text-sm font-bold mb-3 text-[#4ec9b0]">{title}</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3e3e42" strokeWidth="8"/>
              {data.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                const strokeDasharray = `${percentage * 2.51} ${251.2 - percentage * 2.51}`;
                const strokeDashoffset = -cumulativePercentage * 2.51;
                cumulativePercentage += percentage;
                
                if (item.value === 0) return null;
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={item.strokeColor}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-[#cccccc]">{total}</div>
                <div className="text-xs text-[#858585]">Total</div>
              </div>
            </div>
          </div>
          <div className="ml-4 space-y-1">
            {data.map((item, index) => (
              <div key={index} className="flex items-center text-xs">
                <div 
                  className="w-3 h-3 rounded mr-2"
                  style={{ backgroundColor: item.strokeColor }}
                />
                <span className="text-[#858585] mr-2">{item.label}:</span>
                <span className="text-[#cccccc]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const MetricCard: React.FC<{
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }> = ({ icon: Icon, title, value, subtitle, color = "text-[#cccccc]" }) => (
    <div className="bg-[#252526] rounded p-4 border border-[#3e3e42]">
      <div className="flex items-center mb-2">
        <Icon className={`w-4 h-4 mr-2 ${color}`} />
        <span className="text-xs text-[#858585]">{title}</span>
      </div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      {subtitle && <div className="text-xs text-[#858585] mt-1">{subtitle}</div>}
    </div>
  );

  const scenarioChartData: ChartDataItem[] = [
    { label: 'Passed', value: analytics.scenarios.passed, color: 'bg-[#4ade80]', strokeColor: '#4ade80' },
    { label: 'Failed', value: analytics.scenarios.failed, color: 'bg-[#ef4444]', strokeColor: '#ef4444' },
    { label: 'Pending', value: analytics.scenarios.pending, color: 'bg-[#f59e0b]', strokeColor: '#f59e0b' },
    { label: 'Skipped', value: analytics.scenarios.skipped, color: 'bg-[#6b7280]', strokeColor: '#6b7280' }
  ];

  const stepChartData: ChartDataItem[] = [
    { label: 'Passed', value: analytics.steps.passed, color: 'bg-[#4ade80]', strokeColor: '#4ade80' },
    { label: 'Failed', value: analytics.steps.failed, color: 'bg-[#ef4444]', strokeColor: '#ef4444' },
    { label: 'Pending', value: analytics.steps.pending, color: 'bg-[#f59e0b]', strokeColor: '#f59e0b' },
    { label: 'Skipped', value: analytics.steps.skipped, color: 'bg-[#6b7280]', strokeColor: '#6b7280' }
  ];

  const topFeaturesData: ChartDataItem[] = analytics.featureStats.slice(0, 5).map(f => ({
    label: f.name.length > 15 ? f.name.substring(0, 15) + '...' : f.name,
    value: Math.round(f.duration / 10000000), // Convert to seconds
    color: 'bg-[#007acc]'
  }));

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#cccccc] mb-2 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-[#4ec9b0]" />
            Global Test Execution Analytics
          </h1>
          <p className="text-sm text-[#858585]">
            Comprehensive analysis of test execution metrics and performance data
          </p>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <MetricCard
            icon={Target}
            title="Features"
            value={analytics.features.total}
            color="text-[#4ec9b0]"
          />
          <MetricCard
            icon={Activity}
            title="Scenarios"
            value={analytics.scenarios.total}
            color="text-[#569cd6]"
          />
          <MetricCard
            icon={CheckCircle}
            title="Pass Rate"
            value={`${analytics.passRate.toFixed(1)}%`}
            color={analytics.passRate >= 90 ? "text-[#4ade80]" : analytics.passRate >= 70 ? "text-[#f59e0b]" : "text-[#ef4444]"}
          />
          <MetricCard
            icon={Timer}
            title="Total Time"
            value={formatDuration(analytics.executionTime.total)}
            color="text-[#ce9178]"
          />
          <MetricCard
            icon={Clock}
            title="Avg Step Time"
            value={formatDuration(analytics.executionTime.average)}
            color="text-[#dcdcaa]"
          />
          <MetricCard
            icon={TrendingUp}
            title="Total Steps"
            value={analytics.steps.total}
            color="text-[#9cdcfe]"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DonutChart
            data={scenarioChartData}
            title="Scenario Status Distribution"
          />
          <DonutChart
            data={stepChartData}
            title="Step Status Distribution"
          />
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BarChart
            data={topFeaturesData}
            title="Top 5 Features by Execution Time"
          />
          <div className="bg-[#252526] rounded p-4 border border-[#3e3e42]">
            <h3 className="text-sm font-bold mb-3 text-[#4ec9b0]">Execution Time Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#858585]">Total Execution Time:</span>
                <span className="text-xs text-[#cccccc]">{formatDuration(analytics.executionTime.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#858585]">Average Step Duration:</span>
                <span className="text-xs text-[#cccccc]">{formatDuration(analytics.executionTime.average)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#858585]">Fastest Step:</span>
                <span className="text-xs text-[#4ade80]">{formatDuration(analytics.executionTime.min)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#858585]">Slowest Step:</span>
                <span className="text-xs text-[#ef4444]">{formatDuration(analytics.executionTime.max)}</span>
              </div>
              <div className="pt-2 border-t border-[#3e3e42]">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#858585]">Success Rate:</span>
                  <span className={`text-xs ${analytics.passRate >= 90 ? 'text-[#4ade80]' : analytics.passRate >= 70 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                    {analytics.passRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#858585]">Failure Rate:</span>
                  <span className="text-xs text-[#ef4444]">{analytics.failRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Performance Table */}
        {analytics.featureStats.length > 0 && (
          <div className="bg-[#252526] rounded p-4 border border-[#3e3e42]">
            <h3 className="text-sm font-bold mb-3 text-[#4ec9b0]">Feature Performance Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#3e3e42]">
                    <th className="text-left py-2 text-[#858585]">Feature</th>
                    <th className="text-right py-2 text-[#858585]">Scenarios</th>
                    <th className="text-right py-2 text-[#858585]">Steps</th>
                    <th className="text-right py-2 text-[#858585]">Passed</th>
                    <th className="text-right py-2 text-[#858585]">Failed</th>
                    <th className="text-right py-2 text-[#858585]">Duration</th>
                    <th className="text-right py-2 text-[#858585]">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.featureStats.map((feature, index) => {
                    const successRate = feature.scenarios > 0 ? (feature.passed / feature.scenarios) * 100 : 0;
                    return (
                      <tr key={index} className="border-b border-[#3e3e42] hover:bg-[#2a2d2e]">
                        <td className="py-2 text-[#cccccc] truncate max-w-xs" title={feature.name}>
                          {feature.name}
                        </td>
                        <td className="py-2 text-right text-[#cccccc]">{feature.scenarios}</td>
                        <td className="py-2 text-right text-[#cccccc]">{feature.steps}</td>
                        <td className="py-2 text-right text-[#4ade80]">{feature.passed}</td>
                        <td className="py-2 text-right text-[#ef4444]">{feature.failed}</td>
                        <td className="py-2 text-right text-[#ce9178]">{formatDuration(feature.duration)}</td>
                        <td className={`py-2 text-right ${successRate >= 90 ? 'text-[#4ade80]' : successRate >= 70 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                          {successRate.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalAnalytics;
