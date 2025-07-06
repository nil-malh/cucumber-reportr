// Core Cucumber types
export interface CucumberStep {
  keyword: string;
  name: string;
  line: number;
  result: StepResult;
  match?: StepMatch;
  embeddings?: Embedding[];
  output?: string[];
  rows?: TableRow[];
  doc_string?: DocString;
}

export interface StepResult {
  status: 'passed' | 'failed' | 'skipped' | 'pending' | 'undefined';
  duration?: number;
  error_message?: string;
}

export interface StepMatch {
  location: string;
  arguments?: StepArgument[];
}

export interface StepArgument {
  val: string;
  offset: number;
}

export interface TableRow {
  cells: string[];
}

export interface DocString {
  content_type?: string;
  value: string;
  line: number;
}

export interface Embedding {
  mime_type: string;
  data: string;
  name?: string;
}

export interface CucumberScenario {
  id: string;
  name: string;
  description?: string;
  line: number;
  keyword: string;
  tags?: Tag[];
  type: 'scenario' | 'background';
  steps: CucumberStep[];
  before?: Hook[];
  after?: Hook[];
}

export interface CucumberFeature {
  id: string;
  name: string;
  description?: string;
  line: number;
  keyword: string;
  uri: string;
  tags?: Tag[];
  elements: CucumberScenario[];
}

export interface Tag {
  name: string;
  line: number;
}

export interface Hook {
  result: StepResult;
  match: StepMatch;
  embeddings?: Embedding[];
  output?: string[];
}

// Application specific types
export type CucumberReport = CucumberFeature[];

export interface FolderStructure {
  [key: string]: {
    features: CucumberFeature[];
    subfolders: FolderStructure;
  };
}

export interface ReportStats {
  totalFeatures: number;
  totalScenarios: number;
  totalSteps: number;
  passedFeatures: number;
  failedFeatures: number;
  skippedFeatures: number;
  passedScenarios: number;
  failedScenarios: number;
  skippedScenarios: number;
  passedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  totalDuration: number;
  passRate: number;
}

export interface TabData {
  id: string;
  title: string;
  type: 'feature' | 'scenario' | 'analytics';
  data?: CucumberFeature | CucumberScenario | null;
}

export type FilterStatus = 'all' | 'passed' | 'failed' | 'skipped';

export interface FilterState {
  searchTerm: string;
  filterStatus: FilterStatus;
}

export interface ExpandedState {
  features: Set<string>;
  scenarios: Set<string>;
  folders: Set<string>;
}

// Hook return types
export interface CucumberDataHook {
  reportData: CucumberReport;
  folderStructure: FolderStructure;
  stats: ReportStats;
}

export interface ExpandableItemsHook {
  expandedFeatures: Set<string>;
  expandedScenarios: Set<string>;
  expandedFolders: Set<string>;
  toggleFeature: (featureId: string) => void;
  toggleScenario: (scenarioId: string) => void;
  toggleFolder: (folderPath: string) => void;
  resetExpanded: () => void;
  autoExpandMainFolders: (folderStructure: FolderStructure) => void;
}

export interface FiltersHook {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
}

export interface ConsoleHook {
  showConsole: boolean;
  setShowConsole: (show: boolean) => void;
}

export interface TabsHook {
  tabs: TabData[];
  activeTabId: string | null;
  openTab: (item: CucumberFeature | CucumberScenario | { type: 'analytics'; name: string }) => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  setActiveTabId: (tabId: string | null) => void;
  openAnalyticsTab: () => void;
}

// Component prop types
export interface TitleBarProps {
  onCollapseAll: () => void;
  onExpandAll: () => void;
}

export interface SidebarHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
}

export interface FolderTreeProps {
  folderStructure: FolderStructure;
  expandedFolders: Set<string>;
  expandedFeatures: Set<string>;
  onToggleFolder: (folderPath: string) => void;
  onToggleFeature: (featureId: string) => void;
  onOpenFeature: (feature: CucumberFeature) => void;
  searchTerm: string;
  filterStatus: FilterStatus;
}

export interface StatsBarProps {
  stats: ReportStats;
}

export interface TabbedMainContentProps {
  tabs: TabData[];
  activeTabId: string | null;
  onCloseTab: (tabId: string) => void;
  onTabClick: (tabId: string) => void;
  reportData: CucumberReport;
}

export interface ConsoleAreaProps {
  showConsole: boolean;
  onToggleConsole: () => void;
}

export interface StatusBarProps {
  showConsole: boolean;
  onToggleConsole: () => void;
}

export interface FeatureViewProps {
  feature: CucumberFeature;
  expandedScenarios: Set<string>;
  onToggleScenario: (scenarioId: string) => void;
  onOpenScenario: (scenario: CucumberScenario) => void;
}

export interface ScenarioViewProps {
  scenario: CucumberScenario;
}

export interface StepViewProps {
  step: CucumberStep;
  stepIndex: number;
}

export interface StatusIconProps {
  status: 'passed' | 'failed' | 'skipped' | 'pending' | 'undefined';
  size?: 'sm' | 'md' | 'lg';
}

export interface TabBarProps {
  tabs: TabData[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
}

export interface MainContentProps {
  activeTab: TabData | null;
  reportData: CucumberReport;
}

export interface GlobalAnalyticsProps {
  reportData: CucumberReport;
  stats: ReportStats;
}
