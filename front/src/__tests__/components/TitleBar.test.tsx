import { render, screen } from '@testing-library/react';
import TitleBar from '../../components/TitleBar';

describe('TitleBar', () => {
  const originalReportGeneratedAt = (window as any).REPORT_GENERATED_AT;

  afterEach(() => {
    (window as any).REPORT_GENERATED_AT = originalReportGeneratedAt;
  });

  it('renders with default title', () => {
    render(<TitleBar />);
    expect(screen.getByText('Cucumber Tests Results')).toBeInTheDocument();
  });

  it('displays bug icon', () => {
    const { container } = render(<TitleBar />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-[#16825d]');
  });

  it('has correct styling', () => {
    const { container } = render(<TitleBar />);
    const titleElement = container.firstChild;
    expect(titleElement).toHaveClass('bg-[#2d2d30]', 'border-b', 'border-[#3e3e42]');
  });

  it('displays the title with correct styling', () => {
    render(<TitleBar />);
    const titleText = screen.getByText('Cucumber Tests Results');
    expect(titleText).toBeInTheDocument();
    expect(titleText).toHaveClass('text-xs');
  });

  it('has flex layout with proper alignment', () => {
    const { container } = render(<TitleBar />);
    const titleBar = container.firstChild;
    expect(titleBar).toHaveClass('flex', 'items-center', 'justify-between');
  });

  it('does not display timestamp when REPORT_GENERATED_AT is not set', () => {
    (window as any).REPORT_GENERATED_AT = undefined;
    render(<TitleBar />);
    expect(screen.queryByText(/Generated|UTC|:/)).not.toBeInTheDocument();
  });

  it('displays formatted timestamp when REPORT_GENERATED_AT is set', () => {
    (window as any).REPORT_GENERATED_AT = '2026-07-01T14:30:00Z';
    render(<TitleBar />);
    // The timestamp should render as a localized string; check for the clock icon's parent
    const timestampContainer = screen.getByText(/2026/);
    expect(timestampContainer).toBeInTheDocument();
    expect(timestampContainer.closest('div')).toHaveClass('text-xs', 'text-[#858585]');
  });

  it('does not display timestamp when REPORT_GENERATED_AT is invalid', () => {
    (window as any).REPORT_GENERATED_AT = 'not-a-date';
    render(<TitleBar />);
    expect(screen.queryByText(/2026|Invalid/)).not.toBeInTheDocument();
  });
});
