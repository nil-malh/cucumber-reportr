// Reusable component for rendering Cucumber embeddings (screenshots, text, etc.)

import React from 'react';

interface EmbeddingsProps {
  embeddings: Embedding[];
}

interface Embedding {
  mime_type: string;
  data: string;
  name?: string;
}

const Embeddings: React.FC<EmbeddingsProps> = ({ embeddings }) => {
  if (!embeddings || embeddings.length === 0) return null;

  const renderEmbedding = (embedding: Embedding, idx: number) => {
    const { mime_type, data, name } = embedding;

    // Image embeddings (screenshots)
    if (mime_type.startsWith('image/')) {
      return (
        <div key={idx} className="mt-2">
          {name && (
            <div className="text-xs text-[#858585] mb-1">{name}</div>
          )}
          <img
            src={`data:${mime_type};base64,${data}`}
            alt={name || `Embedding ${idx + 1}`}
            className="max-w-full rounded border border-[#3e3e42]"
          />
        </div>
      );
    }

    // Text embeddings
    if (mime_type.startsWith('text/')) {
      let content: string;
      try {
        // Data may be base64-encoded
        content = atob(data);
      } catch {
        // If not base64, use raw data
        content = data;
      }
      return (
        <div key={idx} className="mt-2">
          {name && (
            <div className="text-xs text-[#858585] mb-1">{name}</div>
          )}
          <pre className="p-2 bg-[#1e1e1e] border border-[#3e3e42] rounded text-xs text-[#ce9178] whitespace-pre-wrap break-words">
{content}
          </pre>
        </div>
      );
    }

    // Application/JSON embeddings
    if (mime_type === 'application/json') {
      let content: string;
      try {
        content = atob(data);
      } catch {
        content = data;
      }
      return (
        <div key={idx} className="mt-2">
          {name && (
            <div className="text-xs text-[#858585] mb-1">{name}</div>
          )}
          <pre className="p-2 bg-[#1e1e1e] border border-[#3e3e42] rounded text-xs text-[#9cdcfe] whitespace-pre-wrap break-words">
{content}
          </pre>
        </div>
      );
    }

    // Unknown mime type - show a link to download
    const label = name || `Download embedding ${idx + 1} (${mime_type})`;
    return (
      <div key={idx} className="mt-2">
        <a
          href={`data:${mime_type};base64,${data}`}
          download={name || `embedding-${idx + 1}`}
          className="text-xs text-[#569cd6] hover:text-[#4daafc] underline"
        >
          {label}
        </a>
      </div>
    );
  };

  return (
    <div>
      {embeddings.map(renderEmbedding)}
    </div>
  );
};

export default Embeddings;