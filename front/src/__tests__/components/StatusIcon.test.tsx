import { render } from '@testing-library/react';
import StatusIcon from '../../components/StatusIcon';

describe('StatusIcon', () => {
  it('renders passed status with correct color', () => {
    const { container } = render(<StatusIcon status="passed" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-green-500');
  });

  it('renders failed status with correct color', () => {
    const { container } = render(<StatusIcon status="failed" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-red-500');
  });

  it('renders skipped status with correct color', () => {
    const { container } = render(<StatusIcon status="skipped" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-gray-500');
  });

  it('renders pending status with correct color', () => {
    const { container } = render(<StatusIcon status="pending" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-yellow-500');
  });

  it('renders undefined status with correct color', () => {
    const { container } = render(<StatusIcon status="undefined" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-gray-400');
  });

  it('renders with small size', () => {
    const { container } = render(<StatusIcon status="passed" size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('w-3', 'h-3');
  });

  it('renders with medium size (default)', () => {
    const { container } = render(<StatusIcon status="passed" size="md" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('w-4', 'h-4');
  });

  it('renders with large size', () => {
    const { container } = render(<StatusIcon status="passed" size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('w-5', 'h-5');
  });
});
