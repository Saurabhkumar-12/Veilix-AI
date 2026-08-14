import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { registerApi } from '../services/api';

export default function SignupPage({ onSignupSuccess, onNavigateToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Requirements Check
  const reqs = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
  };

  const score = Object.values(reqs).filter(Boolean).length;
  const strengthLabel = score <= 2 ? 'Weak' : score <= 4 ? 'Good' : 'Strong';
  const strengthColor = score <= 2 ? 'bg-rose-500 text-rose-700' : score <= 4 ? 'bg-amber-500 text-amber-700' : 'bg-emerald-500 text-emerald-700';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (score < 5) {
      setError('Please satisfy all password security requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerApi(name.trim(), email.trim(), password, confirmPassword);
      if (res.user) {
        onSignupSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Unable to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-md">
        
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#16A34A] text-white mb-4 shadow-lg shadow-emerald-900/20">
            <Shield className="w-9 h-9" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-[#F8FAFC] tracking-tight mb-1">
            Veilix <span className="text-[#22C55E]">AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] font-medium">
            Create your enterprise security account
          </p>
        </div>

        {/* Card */}
        <div className="sec-card p-6 sm:p-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#E5E7EB]">
            <User className="w-5 h-5 text-[#16A34A]" />
            <h2 className="font-heading font-extrabold text-lg text-[#111827]">
              Create Account
            </h2>
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
            {/* Name Field */}
            <div>
              <label htmlFor="name-input" className="block text-xs font-mono font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email-signup-input" className="block text-xs font-mono font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-signup-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="pass-signup-input" className="block text-xs font-mono font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="pass-signup-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all disabled:opacity-60"
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

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-2 text-xs">
                <div className="flex justify-between items-center font-mono text-[11px]">
                  <span className="text-[#6B7280] font-bold">Password Strength:</span>
                  <span className={`font-bold ${score <= 2 ? 'text-rose-600' : score <= 4 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {strengthLabel} ({score}/5)
                  </span>
                </div>
                <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${score <= 2 ? 'bg-rose-500' : score <= 4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${(score / 5) * 100}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-[#6B7280]">
                  <div className="flex items-center gap-1">
                    {reqs.length ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                    <span>8+ characters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {reqs.uppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {reqs.lowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {reqs.number ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                    <span>Number (0-9)</span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    {reqs.special ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                    <span>Special character (!@#$%^&*...)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirm-pass-input" className="block text-xs font-mono font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirm-pass-input"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 px-4 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 transition-all disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span>Creating Security Account...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-white" />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center text-xs text-[#6B7280]">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-[#16A34A] hover:text-[#15803D] font-bold hover:underline transition-colors"
            >
              Log In
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
