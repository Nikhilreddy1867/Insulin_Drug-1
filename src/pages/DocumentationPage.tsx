import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

// Direct URL to the PDF in the public folder
const PDF_URL = '/documentation.pdf';

export default function DocumentationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="page-container min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">Documentation</h1>
              <a
                href={PDF_URL}
                download
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Download PDF"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* PDF Container */}
          <div className="relative w-full h-[80vh] bg-black/5">
            {error ? (
              <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <div className="text-red-400 mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Error loading document</h3>
                <p className="text-blue-200 mb-4">{error}</p>
                <div className="text-sm text-blue-200/80 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p>Make sure the PDF file exists at: <code className="bg-white/10 px-2 py-1 rounded">/public/documentation.pdf</code></p>
                </div>
              </div>
            ) : (
              <iframe
                src={`${PDF_URL}#view=fitH`}
                className="w-full h-full border-0"
                onLoad={() => setLoading(false)}
                onError={(e) => {
                  console.error('Failed to load PDF:', e);
                  setError('Failed to load PDF. Please check the console for more details.');
                  setLoading(false);
                }}
                title="Documentation PDF"
              >
                <p className="text-white">Your browser does not support iframes. Please download the PDF to view it: 
                  <a className="underline" href={PDF_URL} download>Download PDF</a>
                </p>
              </iframe>
            )}
            
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


