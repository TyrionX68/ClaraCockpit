import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownReader = ({ filePath, className = "" }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMarkdownFile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch the markdown file from the public directory
        const response = await fetch(`/docs/manifest/${filePath}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load ${filePath}: ${response.status}`);
        }
        
        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error('Error loading markdown file:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (filePath) {
      loadMarkdownFile();
    }
  }, [filePath]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Lade Dokumentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <h3 className="text-red-400 font-semibold mb-2">Fehler beim Laden</h3>
          <p className="text-red-300 text-sm">{error}</p>
          <p className="text-slate-400 text-xs mt-2">
            Datei: {filePath}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling for markdown elements
          h1: ({children}) => (
            <h1 className="text-3xl font-bold text-yellow-400 mb-6 border-b border-slate-700 pb-3">
              {children}
            </h1>
          ),
          h2: ({children}) => (
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 mt-8">
              {children}
            </h2>
          ),
          h3: ({children}) => (
            <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-6">
              {children}
            </h3>
          ),
          h4: ({children}) => (
            <h4 className="text-lg font-semibold text-slate-300 mb-2 mt-4">
              {children}
            </h4>
          ),
          p: ({children}) => (
            <p className="text-slate-300 mb-4 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({children}) => (
            <ul className="text-slate-300 mb-4 space-y-2 list-disc list-inside">
              {children}
            </ul>
          ),
          ol: ({children}) => (
            <ol className="text-slate-300 mb-4 space-y-2 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({children}) => (
            <li className="text-slate-300">
              {children}
            </li>
          ),
          code: ({inline, children}) => (
            inline ? (
              <code className="bg-slate-800 text-yellow-300 px-2 py-1 rounded text-sm">
                {children}
              </code>
            ) : (
              <code className="block bg-slate-800 text-slate-200 p-4 rounded-lg overflow-x-auto text-sm">
                {children}
              </code>
            )
          ),
          pre: ({children}) => (
            <pre className="bg-slate-800 rounded-lg overflow-x-auto mb-4">
              {children}
            </pre>
          ),
          blockquote: ({children}) => (
            <blockquote className="border-l-4 border-yellow-400 pl-4 italic text-slate-400 mb-4">
              {children}
            </blockquote>
          ),
          table: ({children}) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-slate-700 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({children}) => (
            <thead className="bg-slate-800">
              {children}
            </thead>
          ),
          tbody: ({children}) => (
            <tbody className="bg-slate-900">
              {children}
            </tbody>
          ),
          tr: ({children}) => (
            <tr className="border-b border-slate-700">
              {children}
            </tr>
          ),
          th: ({children}) => (
            <th className="px-4 py-3 text-left text-yellow-400 font-semibold">
              {children}
            </th>
          ),
          td: ({children}) => (
            <td className="px-4 py-3 text-slate-300">
              {children}
            </td>
          ),
          a: ({href, children}) => (
            <a 
              href={href} 
              className="text-blue-400 hover:text-blue-300 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({children}) => (
            <strong className="text-slate-100 font-semibold">
              {children}
            </strong>
          ),
          em: ({children}) => (
            <em className="text-slate-300 italic">
              {children}
            </em>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownReader;

