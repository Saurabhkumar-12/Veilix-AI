import React from 'react';
import { Shield, Lock } from 'lucide-react';
export default function Footer() {
  return <footer className="mt-auto border-t border-slate-800 bg-[#050811] py-6"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-400 sm:flex-row"><div className="flex items-center gap-2"><img src="/veilix-ai-logo.png" alt="Veilix AI Logo" className="h-5 w-5 object-contain"/><span className="font-heading font-bold text-slate-100">Veilix AI</span><span>— Uncover what app can access</span></div><div className="flex items-center gap-4 text-[11px]"><span className="flex items-center gap-1 font-medium text-green-400"><Lock className="h-3.5 w-3.5"/>Static analysis active</span><span className="text-slate-700">•</span><span>© {new Date().getFullYear()} Veilix AI</span></div></div></footer>;
}
