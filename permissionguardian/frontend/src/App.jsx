import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AnalyzerPage from './pages/AnalyzerPage';
import LoadingScreen from './pages/LoadingScreen';
import ResultsDashboard from './pages/ResultsDashboard';
import LoginPage from './pages/LoginPage';
import ErrorMessage from './components/ErrorMessage';
import { 
  analyzeApplicationUrl, 
  analyzeApkFile, 
  compareAnalyses,
  getMeApi,
  logoutApi
} from './services/api';

export default function App() {
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.hash === '#login')) {
      return 'login';
    }
    return 'home';
  }); // 'home' | 'analyzer' | 'loading' | 'results' | 'error' | 'login'
  const [currentUser, setCurrentUser] = useState(null);
  const [intendedRoute, setIntendedRoute] = useState(null);
  const [appData, setAppData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUrl, setLastUrl] = useState('');

  useEffect(() => {
    getMeApi().then(user => {
      if (user) {
        setCurrentUser(user);
      } else if (window.location.pathname === '/analyzer') {
        // Enforce route protection: redirect unauthenticated access to login
        setView('login');
        setIntendedRoute('analyzer');
      }
    }).catch(() => {
      if (window.location.pathname === '/analyzer') {
        setView('login');
        setIntendedRoute('analyzer');
      }
    });

    const handlePopState = () => {
      if (window.location.pathname === '/login' || window.location.hash === '#login') {
        setView('login');
      } else if (window.location.pathname === '/analyzer') {
        if (!currentUser) {
          setIntendedRoute('analyzer');
          setView('login');
        } else {
          setView('analyzer');
        }
      } else if (window.location.pathname === '/' || window.location.pathname === '') {
        setView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

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
    if (window.location.pathname === '/login' || window.location.pathname === '/analyzer') {
      window.history.pushState({}, '', '/');
    }
  };

  const openLogin = (target = 'analyzer') => {
    setIntendedRoute(target);
    setErrorMessage('');
    setView('login');
    if (window.location.pathname !== '/login') {
      window.history.pushState({}, '', '/login');
    }
  };

  const handleGetStarted = () => {
    if (currentUser) {
      // Authenticated user directly opens Analyzer
      openAnalyzer();
    } else {
      // Unauthenticated user directed through Authentication portal
      openLogin('analyzer');
    }
  };

  const openAnalyzer = () => {
    if (!currentUser) {
      openLogin('analyzer');
      return;
    }
    setErrorMessage('');
    setView('analyzer');
    if (window.location.pathname !== '/analyzer') {
      window.history.pushState({}, '', '/analyzer');
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (intendedRoute === 'analyzer') {
      setIntendedRoute(null);
      setErrorMessage('');
      setView('analyzer');
      if (window.location.pathname !== '/analyzer') {
        window.history.pushState({}, '', '/analyzer');
      }
    } else {
      handleReset();
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error('[Logout Error]:', err);
    } finally {
      setCurrentUser(null);
      handleReset();
    }
  };

  const handleRetry = () => {
    if (lastUrl) {
      handleAnalyze(lastUrl.input, lastUrl.mode);
    } else {
      handleReset();
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-[#F8FAFC] font-sans flex flex-col antialiased selection:bg-purple-500 selection:text-white">
      {view !== 'home' && view !== 'login' && (
        <Header 
          onReset={handleReset} 
          currentUser={currentUser}
          onOpenLogin={openLogin}
          onLogout={handleLogout}
        />
      )}

      {/* Main App Content View Router */}
      <main className="flex-1">
        {view === 'home' && (
          <HomePage 
            onGetStarted={handleGetStarted}
            onOpenAnalyzer={openAnalyzer} 
            onOpenLogin={() => openLogin('analyzer')} 
            onLogout={handleLogout}
            currentUser={currentUser} 
          />
        )}
        {view === 'login' && <LoginPage onBack={handleReset} onLoginSuccess={handleLoginSuccess} />}
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

      {view !== 'home' && view !== 'login' && <Footer />}
    </div>
  );
}
