import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, Eye, EyeOff, Mail, ArrowRight, 
  Sparkles, CheckCircle, AlertCircle, Loader2, ArrowLeft, ShieldCheck, KeyRound
} from 'lucide-react';
import { SplineScene } from '@/components/ui/splite';
import { Spotlight } from '@/components/ui/spotlight';
import { loginApi, registerApi, forgotPasswordApi, googleAuthApi, getMeApi, getAuthConfigApi } from '../services/api';

export default function LoginPage({ onBack, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [configClientId, setConfigClientId] = useState('');
  
  // Bot Interaction State: 'IDLE' | 'EMAIL_FOCUS' | 'PASSWORD_FOCUS' | 'LOADING' | 'SUCCESS' | 'ERROR'
  const [botState, setBotState] = useState('IDLE');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'error' | 'success', text: string }

  // Check if already authenticated on mount & load dynamic auth config
  useEffect(() => {
    let isMounted = true;
    getMeApi().then(user => {
      if (user && isMounted && onLoginSuccess) {
        // user already authenticated
      }
    }).catch(() => {});

    getAuthConfigApi().then(cfg => {
      if (isMounted && cfg?.googleClientId) {
        setConfigClientId(cfg.googleClientId);
      }
    }).catch(() => {});

    return () => { isMounted = false; };
  }, [onLoginSuccess]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setStatusMessage({ type: 'error', text: 'Please enter both email and password.' });
      setBotState('ERROR');
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    setBotState('LOADING');

    try {
      const result = await loginApi(email, password, rememberMe);
      setStatusMessage({ type: 'success', text: 'Authentication successful! Redirecting...' });
      setBotState('SUCCESS');
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(result?.user || { email });
        } else if (onBack) {
          onBack();
        }
      }, 900);
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      setStatusMessage({ type: 'error', text: msg });
      setBotState('ERROR');
      setTimeout(() => setBotState('IDLE'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Please complete all required fields.' });
      setBotState('ERROR');
      return;
    }
    if (password !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
      setBotState('ERROR');
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    setBotState('LOADING');

    try {
      const result = await registerApi(name, email, password, confirmPassword);
      setStatusMessage({ type: 'success', text: 'Account created! Signing you in...' });
      setBotState('SUCCESS');
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(result?.user || { email, name });
        } else if (onBack) {
          onBack();
        }
      }, 900);
    } catch (err) {
      const msg = err.message || 'Registration failed. Please check your information.';
      setStatusMessage({ type: 'error', text: msg });
      setBotState('ERROR');
      setTimeout(() => setBotState('IDLE'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e?.preventDefault();
    if (!email) {
      setStatusMessage({ type: 'error', text: 'Please enter your account email address.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      await forgotPasswordApi(email);
      setStatusMessage({ 
        type: 'success', 
        text: 'If an account exists with this email, password reset instructions have been sent.' 
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Unable to process reset request.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Launch official Google OAuth account selector flow
  const handleGoogleAuth = async () => {
    if (isLoading || isGoogleLoading) return;

    let googleClientId = configClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    if (!googleClientId) {
      try {
        const cfg = await getAuthConfigApi();
        if (cfg?.googleClientId) {
          googleClientId = cfg.googleClientId;
          setConfigClientId(cfg.googleClientId);
        }
      } catch (e) {}
    }

    if (!googleClientId) {
      setStatusMessage({ 
        type: 'error', 
        text: 'Google OAuth Client ID is not configured. Please set GOOGLE_CLIENT_ID in your environment.' 
      });
      setBotState('ERROR');
      setTimeout(() => setBotState('IDLE'), 4000);
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setStatusMessage({ 
        type: 'error', 
        text: 'Google Identity Services is initializing. Please try again in a moment.' 
      });
      setBotState('ERROR');
      setTimeout(() => setBotState('IDLE'), 3000);
      return;
    }

    try {
      setIsGoogleLoading(true);
      setStatusMessage(null);
      setBotState('LOADING');

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setIsGoogleLoading(false);
            if (tokenResponse.error === 'popup_closed_by_user') {
              setStatusMessage({ type: 'error', text: 'Google sign-in was cancelled.' });
            } else if (tokenResponse.error === 'access_denied') {
              setStatusMessage({ type: 'error', text: 'Google sign-in permission was denied.' });
            } else {
              setStatusMessage({ type: 'error', text: `Google authentication failed: ${tokenResponse.error}` });
            }
            setBotState('ERROR');
            setTimeout(() => setBotState('IDLE'), 3500);
            return;
          }

          if (tokenResponse.access_token) {
            try {
              const result = await googleAuthApi({ token: tokenResponse.access_token });
              setStatusMessage({ type: 'success', text: 'Google identity verified! Entering workspace...' });
              setBotState('SUCCESS');
              setTimeout(() => {
                if (onLoginSuccess) {
                  onLoginSuccess(result?.user);
                } else if (onBack) {
                  onBack();
                }
              }, 800);
            } catch (err) {
              setStatusMessage({ type: 'error', text: err.message || 'Google authentication verification failed.' });
              setBotState('ERROR');
              setTimeout(() => setBotState('IDLE'), 3500);
            } finally {
              setIsGoogleLoading(false);
            }
          }
        },
        error_callback: (error) => {
          setIsGoogleLoading(false);
          console.error('Google OAuth window error:', error);
          setStatusMessage({ type: 'error', text: 'Google authentication window was closed or blocked.' });
          setBotState('ERROR');
          setTimeout(() => setBotState('IDLE'), 3500);
        }
      });

      // Opens Google's official Account Chooser (select_account)
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.error('[Google OAuth trigger error]:', err);
      setIsGoogleLoading(false);
      setStatusMessage({ type: 'error', text: 'Unable to start Google sign-in. Please try again.' });
      setBotState('ERROR');
      setTimeout(() => setBotState('IDLE'), 3500);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-slate-200 flex flex-col lg:flex-row relative overflow-x-hidden font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Background Ambience / Spotlight */}
      <Spotlight
        className="-top-40 left-0 md:left-40 md:-top-20"
        size={450}
      />
      <div 
        aria-hidden="true" 
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[160px] pointer-events-none" 
      />

      {/* LEFT COLUMN: Authentication Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-6 sm:px-12 lg:px-16 py-8 sm:py-12 z-20 relative bg-black/40 backdrop-blur-md border-r border-white/5 min-h-screen">
        
        {/* Top Header & Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div 
            onClick={onBack}
            className="flex items-center gap-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-sm"
            tabIndex={0}
            role="button"
            aria-label="Return to Veilix AI Home"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onBack && onBack(); }}
          >
            <img 
              src="/veilix-ai-logo.png" 
              alt="Veilix AI Logo" 
              className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-105" 
            />
            <span className="font-mono font-extrabold text-lg text-white tracking-tight">
              Veilix <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">AI</span>
            </span>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-sm border border-slate-800 hover:border-slate-700 bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              aria-label="Back to landing page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-purple-500/30 bg-purple-500/10 rounded-sm text-[10px] font-mono text-purple-300 mb-4 uppercase tracking-widest shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" aria-hidden="true" />
            <span>[ AUTHENTICATION GATEWAY ]</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight mb-2">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Security Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
            {mode === 'login' && 'Sign in to access deep Android permission intelligence, static verification, and threat exposure simulation.'}
            {mode === 'register' && 'Register your Veilix AI security account to inspect APKs and store audit analyses.'}
            {mode === 'forgot' && 'Enter your registered email address to receive password reset instructions.'}
          </p>

          {/* Alert Status Banner */}
          {statusMessage && (
            <div 
              role="alert"
              className={`p-3.5 rounded-md text-xs font-mono mb-5 flex items-start gap-2.5 border transition-all ${
                statusMessage.type === 'error' 
                  ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              ) : (
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4 font-mono">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="analyst@veilix.ai"
                    className="w-full bg-black/80 border border-slate-800 focus:border-purple-500 rounded-sm pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition-all font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] hover:from-[#4F46E5] hover:via-[#7C3AED] hover:to-[#9333EA] text-white font-mono font-bold tracking-wider uppercase py-3.5 text-xs rounded-sm transition-all shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.65)] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <span>SEND RESET INSTRUCTIONS →</span>}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setStatusMessage(null); }}
                  className="text-xs text-slate-400 hover:text-purple-400 font-sans transition-colors underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          ) : (
            /* LOGIN & REGISTER FORMS */
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              
              {/* Name Field (Register Mode Only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-mono text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setBotState('EMAIL_FOCUS')}
                    onBlur={() => setBotState('IDLE')}
                    required
                    placeholder="Security Analyst"
                    className="w-full bg-black/80 border border-slate-800 focus:border-purple-500 rounded-sm px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition-all font-sans"
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="auth-email" className="block text-xs font-mono text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setBotState('EMAIL_FOCUS')}
                    onBlur={() => setBotState('IDLE')}
                    required
                    placeholder="analyst@veilix.ai"
                    className="w-full bg-black/80 border border-slate-800 focus:border-purple-500 rounded-sm pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="auth-password" className="text-xs font-mono text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setStatusMessage(null); }}
                      className="text-[11px] font-sans text-purple-400 hover:text-purple-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setBotState('PASSWORD_FOCUS')}
                    onBlur={() => setBotState('IDLE')}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-black/80 border border-slate-800 focus:border-purple-500 rounded-sm pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Register Mode Only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="reg-confirm-password" className="block text-xs font-mono text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setBotState('PASSWORD_FOCUS')}
                      onBlur={() => setBotState('IDLE')}
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-black/80 border border-slate-800 focus:border-purple-500 rounded-sm pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition-all font-sans"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me Checkbox (Login Mode) */}
              {mode === 'login' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-black text-purple-600 focus:ring-purple-500 focus:ring-offset-black cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="text-xs text-slate-400 font-sans cursor-pointer select-none">
                    Remember my session on this device
                  </label>
                </div>
              )}

              {/* Submit CTA Button (Reference Style) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] hover:from-[#4F46E5] hover:via-[#7C3AED] hover:to-[#9333EA] text-white font-mono font-bold tracking-wider uppercase py-4 text-xs sm:text-sm rounded-sm transition-all shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.65)] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'SIGN IN TO VEILIX AI' : 'CREATE ACCOUNT'}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>

              {/* OR Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-[#000000] px-3 text-[11px] font-mono text-slate-500 uppercase tracking-widest absolute">
                  OR
                </span>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading || isGoogleLoading}
                className="w-full border border-white/10 hover:border-purple-500/40 bg-black/80 hover:bg-slate-900/60 text-slate-200 hover:text-white font-mono text-xs py-3.5 px-4 rounded-sm flex items-center justify-center gap-3 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Toggle Register / Login mode */}
              <div className="text-center pt-3 text-xs font-sans text-slate-400">
                {mode === 'login' ? (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('register'); setStatusMessage(null); }}
                      className="text-purple-400 hover:text-purple-300 font-semibold underline ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    >
                      Sign Up
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setStatusMessage(null); }}
                      className="text-purple-400 hover:text-purple-300 font-semibold underline ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    >
                      Sign In
                    </button>
                  </span>
                )}
              </div>

            </form>
          )}

        </div>

        {/* Footer info note */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-600">
          <span>Veilix AI Platform</span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            256-Bit Static Analysis
          </span>
        </div>

      </div>

      {/* RIGHT COLUMN: 3D Bot with Interactive State Halo */}
      <div className="w-full lg:w-1/2 min-h-[420px] lg:min-h-screen bg-[#000000] relative flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden select-none">
        
        {/* Dynamic Ambient Backlight based on botState */}
        <div 
          aria-hidden="true" 
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            botState === 'PASSWORD_FOCUS' 
              ? 'bg-gradient-to-tr from-purple-900/25 via-indigo-900/20 to-transparent opacity-100'
              : botState === 'EMAIL_FOCUS'
              ? 'bg-gradient-to-tr from-blue-900/20 via-purple-900/15 to-transparent opacity-80'
              : botState === 'SUCCESS'
              ? 'bg-gradient-to-tr from-emerald-900/30 via-green-900/20 to-transparent opacity-100'
              : botState === 'ERROR'
              ? 'bg-gradient-to-tr from-red-900/25 via-rose-900/15 to-transparent opacity-90'
              : 'bg-gradient-to-tr from-blue-900/10 via-purple-900/10 to-transparent opacity-60'
          }`}
        />

        {/* Status Indicator Floating Badge */}
        <div className="absolute top-8 right-8 z-20">
          <div 
            className={`transition-all duration-300 px-3.5 py-1.5 rounded-full border text-[11px] font-mono flex items-center gap-2 backdrop-blur-md ${
              botState === 'PASSWORD_FOCUS'
                ? 'bg-purple-950/80 border-purple-500/50 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                : botState === 'EMAIL_FOCUS'
                ? 'bg-blue-950/80 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                : botState === 'SUCCESS'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(34,197,94,0.35)]'
                : botState === 'ERROR'
                ? 'bg-red-950/80 border-red-500/50 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                : 'bg-black/60 border-slate-800 text-slate-400'
            }`}
          >
            <span 
              className={`w-2 h-2 rounded-full ${
                botState === 'PASSWORD_FOCUS' ? 'bg-purple-400 animate-ping' :
                botState === 'EMAIL_FOCUS' ? 'bg-blue-400 animate-pulse' :
                botState === 'SUCCESS' ? 'bg-emerald-400' :
                botState === 'ERROR' ? 'bg-red-400 animate-pulse' :
                'bg-slate-500'
              }`} 
            />
            <span>
              {botState === 'PASSWORD_FOCUS' && 'PRIVACY PROTOCOL ACTIVE'}
              {botState === 'EMAIL_FOCUS' && 'IDENTITY RESOLUTION'}
              {botState === 'LOADING' && 'AUTHENTICATING...'}
              {botState === 'SUCCESS' && 'ACCESS GRANTED'}
              {botState === 'ERROR' && 'VERIFICATION FAILED'}
              {botState === 'IDLE' && 'VEILIX BOT READY'}
            </span>
          </div>
        </div>

        {/* 3D Spline Bot Container with Protective Halo Transition */}
        <div 
          className={`w-full max-w-xl h-[380px] sm:h-[460px] lg:h-[min(580px,80vh)] relative rounded-2xl overflow-hidden transition-all duration-500 flex items-center justify-center ${
            botState === 'PASSWORD_FOCUS'
              ? 'ring-2 ring-purple-500/40 shadow-[0_0_70px_rgba(168,85,247,0.3)] bg-purple-950/10'
              : botState === 'EMAIL_FOCUS'
              ? 'ring-1 ring-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.2)]'
              : botState === 'SUCCESS'
              ? 'ring-2 ring-emerald-500/50 shadow-[0_0_60px_rgba(34,197,94,0.35)]'
              : botState === 'ERROR'
              ? 'ring-1 ring-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.25)]'
              : 'ring-1 ring-white/5 shadow-[0_0_30px_rgba(0,0,0,0.8)]'
          }`}
        >
          {/* Permanent mounted SplineScene so canvas does not reload */}
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />

          {/* Protective Halo Overlay on Password Focus */}
          <div 
            aria-hidden="true" 
            className={`absolute inset-0 pointer-events-none transition-opacity duration-500 flex flex-col items-center justify-end pb-8 ${
              botState === 'PASSWORD_FOCUS' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="bg-black/75 border border-purple-500/40 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-xs font-mono text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>Password Input Shield Active</span>
            </div>
          </div>
        </div>

        {/* Bottom Subtitle / Guidance */}
        <div className="mt-4 text-center z-10">
          <p className="text-[11px] font-mono text-slate-500 tracking-wider">
            [ INTERACTIVE 3D SECURITY ASSISTANT ]
          </p>
        </div>

      </div>

    </div>
  );
}
