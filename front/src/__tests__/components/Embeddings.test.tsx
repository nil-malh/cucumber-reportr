import { render, screen } from '@testing-library/react';
import Embeddings from '../../components/Embeddings';

describe('Embeddings', () => {
  it('renders nothing when embeddings array is empty', () => {
    const { container } = render(<Embeddings embeddings={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when embeddings is undefined', () => {
    const { container } = render(<Embeddings embeddings={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders image embedding as img tag with data URI', () => {
    const embeddings = [
      { mime_type: 'image/png', data: 'iVBORw0KGgo=', name: 'screenshot.png' }
    ];
    render(<Embeddings embeddings={embeddings} />);
    
    const img = screen.getByAltText('screenshot.png');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgo=');
  });

  it('renders image embedding with default alt text when no name', () => {
    const embeddings = [
      { mime_type: 'image/png', data: 'iVBORw0KGgo=' }
    ];
    render(<Embeddings embeddings={embeddings} />);
    
    const img = screen.getByAltText('Embedding 1');
    expect(img).toBeInTheDocument();
  });

  it('renders text embedding decoded from base64', () => {
    // base64 for "Hello World"
    const base64Text = btoa('Hello World');
    const embeddings = [
      { mime_type: 'text/plain', data: base64Text, name: 'output.txt' }
    ];
    render(<Embeddings embeddings={embeddings} />);
    
    expect(screen.getByText('output.txt')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders text embedding with raw data when not base64', () => {
    // Use invalid base64 (contains characters not in base64 alphabet)
    const embeddings = [
      { mime_type: 'text/plain', data: '!!!not base64!!!' }
    ];
    render(<Embeddings embeddings={embeddings} />);
    
    expect(screen.getByText('!!!not base64!!!')).toBeInTheDocument();
  });

  it('renders application/json embedding', () => {
    const jsonContent = '{"key": "value"}';
    const base64Json = btoa(jsonContent);
    const embeddings = [
      { mime_type: 'application/json', data: base64Json, name: 'data.json' }
    ];
    render(<Embeddings embeddings={embeddings} />);
    
    expect(screen.getByText('data.json')).toBeInTheDocument();
    expect(screen.getByText(jsonContent)).toBeInTheDocument();
  });

  it('renders application/json embedding with raw data when not base64', () => {
    const embeddings = [
      { mime_type: 'application/json', data: '{"raw": "json"}', name: 'raw.json' }
    ];
    render(<Embeddings embeddings={embeddings} />);
    
    expect(screen.getByText('raw.json')).toBeInTheDocument();
    expect(screen.getByText('{"raw": "json"}')).toBeInTheDocument();
  });

  it('renders unknown mime type as download link', () => {
    const embeddings = [
      { mime_type: 'application/pdf', data: 'JVBERi', name: 'report.pdf' }
    ];
    render(<Embeddings embeddings={embeddings} />);
    
    const link = screen.getByText('report.pdf');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toContain('data:application/pdf;base64,JVBERi');
  });

  it('renders unknown mime type with default name', () => {
    const embeddings = [
      { mime_type: 'application/octet-stream', data: 'binarydata' }
    ];
    render(<Embeddings embeddings={embeddings} />);
    
    expect(screen.getByText(/Download embedding 1/)).toBeInTheDocument();
  });

  it('renders multiple embeddings', () => {
    const base64Text = btoa('First');
    const embeddings = [
      { mime_type: 'image/png', data: 'img1=', name: 'img1.png' },
      { mime_type: 'text/plain', data: base64Text, name: 'text1.txt' }
    ];
    render(<Embeddings embeddings={embeddings} />);
    
    expect(screen.getByAltText('img1.png')).toBeInTheDocument();
    expect(screen.getByText('text1.txt')).toBeInTheDocument();
  });

  it('does not render content_type label for image without name', () => {
    const embeddings = [
      { mime_type: 'image/png', data: 'iVBOR=' }
    ];
    render(<Embeddings embeddings={embeddings} />);
    
    // No name, so no label div - just the img
    expect(screen.getByAltText('Embedding 1')).toBeInTheDocument();
  });
});