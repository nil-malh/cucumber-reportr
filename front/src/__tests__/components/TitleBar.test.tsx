import { render, screen } from '@testing-library/react';
import TitleBar from '../../components/TitleBar';

describe('TitleBar', () => {
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
});
