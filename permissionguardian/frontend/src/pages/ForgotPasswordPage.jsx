import React, { useState } from 'react';
import { Shield, Mail, KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { forgotPasswordApi } from '../services/api';

export default function ForgotPasswordPage({ onNavigateToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordApi(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to complete request.');
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
            <KeyRound className="w-9 h-9" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-[#F8FAFC] tracking-tight mb-1">
            Password Recovery
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] font-medium">
            Veilix AI Security Workspace
          </p>
        </div>

        {/* Card */}
        <div className="sec-card p-6 sm:p-8 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl">
          
          {submitted ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="font-heading font-bold text-base text-[#111827]">
                Reset Link Dispatched
              </h2>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                If an account exists with <strong>{email}</strong>, a secure password reset link has been dispatched with a 15-minute token expiry.
              </p>
              <div className="pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="btn-primary w-full py-3 px-4 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                  <span>Return to Login</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#E5E7EB]">
                <Mail className="w-5 h-5 text-[#16A34A]" />
                <h2 className="font-heading font-extrabold text-lg text-[#111827]">
                  Reset Password
                </h2>
              </div>

              <p className="text-xs text-[#6B7280] mb-5 leading-relaxed">
                Enter your account email address below. If valid, you will receive a cryptographically generated reset token link.
              </p>

              {error && (
                <div role="alert" className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email-input" className="block text-xs font-mono font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="forgot-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      required
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] text-xs sm:text-sm placeholder-[#6B7280] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 px-4 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <span>Sending Reset Link...</span>
                  ) : (
                    <span>Send Password Reset Link</span>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-xs text-[#6B7280] hover:text-[#111827] font-bold inline-flex items-center gap-1.5 hover:underline transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
