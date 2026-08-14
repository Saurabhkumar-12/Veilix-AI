import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Search, ShieldAlert, Bot, ArrowDown, ChevronRight } from 'lucide-react';
import { loginApi } from '../services/api';

export default function LoginPage({ onLoginSuccess, onNavigateToSignup, onNavigateToForgot }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi(email.trim(), password, rememberMe);
      if (res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-8 sm:py-12 font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ========================================================================= */}
        {/* LEFT SIDE — PRODUCT INTRODUCTION                                         */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-6 text-left">
          
          {/* Brand Shield & Title */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16A34A]/15 border border-[#16A34A]/30 text-[#22C55E] text-xs font-mono font-bold mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>SECURITY INTELLIGENCE PLATFORM</span>
            </div>
            
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#F8FAFC] tracking-tight leading-tight">
              Veilix <span className="text-[#22C55E]">AI</span>
            </h1>
            
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#22C55E] mt-2">
              "Understand what an application can access before you trust it."
            </h2>
          </div>

          {/* Short Description */}
          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            AI-powered permission intelligence that analyzes applications, detects risky access, and explains privacy impact before you install or trust an app.
          </p>

          {/* 3 Simple Feature Cards */}
          <div className="grid gap-3 pt-2">
            
            {/* Feature 1: Analyze */}
            <div className="p-3.5 rounded-xl bg-[#1E293B]/70 border border-[#334155] flex items-start gap-3 transition-all hover:border-[#22C55E]/40">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-455 shrink-0 mt-0.5">
                <Search className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#F8FAFC] flex items-center gap-1.5">
                  <span>🔍 Analyze</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">
                  Analyze APK files, Play Store apps, and application/software URLs.
                </p>
              </div>
            </div>

            {/* Feature 2: Detect Risk */}
            <div className="p-3.5 rounded-xl bg-[#1E293B]/70 border border-[#334155] flex items-start gap-3 transition-all hover:border-[#22C55E]/40">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#F8FAFC] flex items-center gap-1.5">
                  <span>🛡️ Detect Risk</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">
                  AI evaluates permissions and generates an easy-to-understand security score.
                </p>
              </div>
            </div>

            {/* Feature 3: Understand */}
            <div className="p-3.5 rounded-xl bg-[#1E293B]/70 border border-[#334155] flex items-start gap-3 transition-all hover:border-[#22C55E]/40">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#F8FAFC] flex items-center gap-1.5">
                  <span>🤖 Understand</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">
                  Get clear explanations of suspicious permissions and privacy risks.
                </p>
              </div>
            </div>

          </div>

          {/* Simple Visual Flow Pipeline */}
          <div className="pt-2">
            <p className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider mb-2">
              ANALYSIS PIPELINE FLOW
            </p>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A] border border-[#334155] text-xs font-mono text-[#F8FAFC] overflow-x-auto">
              <span className="px-2.5 py-1 rounded bg-[#1E293B] border border-[#334155] font-bold text-green-400">
                App
              </span>
              <ChevronRight className="w-4 h-4 text-[#64748B] shrink-0" />
              <span className="px-2.5 py-1 rounded bg-[#1E293B] border border-[#334155] font-bold text-amber-300">
                Permissions
              </span>
              <ChevronRight className="w-4 h-4 text-[#64748B] shrink-0" />
              <span className="px-2.5 py-1 rounded bg-[#1E293B] border border-[#334155] font-bold text-green-400">
                AI Analysis
              </span>
              <ChevronRight className="w-4 h-4 text-[#64748B] shrink-0" />
              <span className="px-2.5 py-1 rounded bg-[#16A34A]/20 border border-[#22C55E]/40 font-bold text-[#22C55E]">
                Security Score
              </span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDE — LOGIN FORM                                                  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="sec-card p-6 sm:p-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl transition-all">
            
            {/* Welcome Back Header */}
            <div className="mb-6 pb-4 border-b border-[#E5E7EB]">
              <h2 className="font-heading font-extrabold text-2xl text-[#111827]">
                Welcome back
              </h2>
              <p className="text-xs text-[#6B7280] mt-1 font-medium">
                Sign in to continue to Veilix AI.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div 
                role="alert" 
                className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email-input" className="block text-xs font-mono font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all disabled:opacity-60 font-sans"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password-input" className="block text-xs font-mono font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all disabled:opacity-60 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B7280] hover:text-[#111827] focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#111827] font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 rounded border-[#E5E7EB] text-[#16A34A] focus:ring-[#16A34A]"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={onNavigateToForgot}
                  className="text-[#16A34A] hover:text-[#15803D] font-bold transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 px-4 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-white" />
                    <span>🔐 Secure Login</span>
                  </>
                )}
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center text-xs text-[#6B7280]">
              <span>Don't have an account? </span>
              <button
                type="button"
                onClick={onNavigateToSignup}
                className="text-[#16A34A] hover:text-[#15803D] font-bold hover:underline transition-colors inline-flex items-center gap-1"
              >
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Security Subtext */}
          <p className="text-center text-[11px] font-mono text-[#94A3B8] mt-6 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Your sign-in is protected with secure sessions.</span>
          </p>

        </div>

      </div>
    </div>
  );
}
