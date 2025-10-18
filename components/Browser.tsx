import React, { useState, useRef, useEffect } from 'react';

interface BrowserProps {
  defaultUrl?: string;
}

const Browser: React.FC<BrowserProps> = ({ defaultUrl = 'https://www.google.com' }) => {
  const [url, setUrl] = useState<string>(defaultUrl);
  const [displayUrl, setDisplayUrl] = useState<string>(defaultUrl);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([defaultUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayUrl(e.target.value);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let processedUrl = displayUrl;
    
    // Add https:// if no protocol is specified
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
    }

    setUrl(processedUrl);
    // Update history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), processedUrl]);
    setHistoryIndex(prev => prev + 1);
    setIsLoading(true);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setUrl(history[historyIndex - 1]);
      setDisplayUrl(history[historyIndex - 1]);
      setIsLoading(true);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setUrl(history[historyIndex + 1]);
      setDisplayUrl(history[historyIndex + 1]);
      setIsLoading(true);
    }
  };

  const reload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  };

  useEffect(() => {
    const handleIframeLoad = () => {
      setIsLoading(false);
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, [url]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center p-2 space-x-2 bg-gray-100 border-b">
        <button
          onClick={goBack}
          disabled={historyIndex === 0}
          className={`p-1 rounded ${historyIndex === 0 ? 'text-gray-400' : 'hover:bg-gray-200'}`}
          title="Go back"
        >
          ←
        </button>
        <button
          onClick={goForward}
          disabled={historyIndex === history.length - 1}
          className={`p-1 rounded ${historyIndex === history.length - 1 ? 'text-gray-400' : 'hover:bg-gray-200'}`}
          title="Go forward"
        >
          →
        </button>
        <button
          onClick={reload}
          className="p-1 rounded hover:bg-gray-200"
          title="Reload"
        >
          ⟳
        </button>
        <form onSubmit={handleUrlSubmit} className="flex-1">
          <input
            type="text"
            value={displayUrl}
            onChange={handleUrlChange}
            className="w-full px-3 py-1 border rounded"
            placeholder="Enter URL"
          />
        </form>
      </div>
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-none"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          title="Web Browser"
        />
      </div>
    </div>
  );
};

export default Browser;