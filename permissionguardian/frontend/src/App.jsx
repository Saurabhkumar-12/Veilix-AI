import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AnalyzerPage from './pages/AnalyzerPage';
import LoadingScreen from './pages/LoadingScreen';
import ResultsDashboard from './pages/ResultsDashboard';
import ErrorMessage from './components/ErrorMessage';
import { 
  analyzeApplicationUrl, 
  analyzeApkFile, 
  compareAnalyses 
} from './services/api';

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'loading' | 'results' | 'error'
  const [appData, setAppData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUrl, setLastUrl] = useState('');

  const handleAnalyze = async (input, mode = 'playstore') => {
    setLastUrl({ input, mode });
    setView('loading');
    setErrorMessage('');

    try {
      let data;
      if (mode === 'compare') {
        const before = await analyzeApkFile(input.before); 
        const after = await analyzeApkFile(input.after);
        data = { ...after, comparison: await compareAnalyses(before.analysisId, after.analysisId) };
      } else {
        data = mode === 'apk' ? await analyzeApkFile(input) : await analyzeApplicationUrl(input, mode === 'playstore');
      }
      setAppData(data);
      setView('results');
    } catch (err) {
      console.error('[App Analysis Error]:', err.message);
      setErrorMessage(err.message || 'Unable to analyze this application.');
      setView('error');
    }
  };

  const handleReset = () => {
    setView('home');
    setAppData(null);
    setErrorMessage('');
    setLastUrl('');
  };

  const openAnalyzer = () => {
    setErrorMessage('');
    setView('analyzer');
  };

  const handleRetry = () => {
    if (lastUrl) {
      handleAnalyze(lastUrl.input, lastUrl.mode);
    } else {
      handleReset();
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-[#F8FAFC] font-sans flex flex-col antialiased selection:bg-green-500 selection:text-black">
      {view !== 'home' && <Header onReset={handleReset} />}

      {/* Main App Content View Router */}
      <main className="flex-1">
        {view === 'home' && <HomePage onOpenAnalyzer={openAnalyzer} />}
        {view === 'analyzer' && <AnalyzerPage onAnalyze={handleAnalyze} onBack={handleReset} />}
        {view === 'loading' && <LoadingScreen />}
        {view === 'results' && <ResultsDashboard data={appData} onReset={handleReset} />}
        {view === 'error' && (
          <ErrorMessage 
            message={errorMessage} 
            onRetry={handleRetry} 
            onReset={handleReset} 
          />
        )}
      </main>

      {view !== 'home' && <Footer />}
    </div>
  );
}
