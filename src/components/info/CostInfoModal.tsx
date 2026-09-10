import React from 'react';
import { X, HelpCircle, CheckCircle2, ShieldCheck, DollarSign, Zap, Globe, Server, Sparkles } from 'lucide-react';

interface CostInfoModalProps {
  onClose: () => void;
}

export const CostInfoModal: React.FC<CostInfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Publishing & Cost Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent guide to hosting, Gemini API, and custom domains.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* 1. Gemini AI API */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wide">
              <Sparkles className="w-4 h-4" />
              1. Google Gemini AI API Usage
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              • <strong>Free Tier Available</strong>: Google AI Studio provides a generous free tier for Gemini models (like Gemini 2.5/3 Flash) with generous daily requests at no cost.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              • <strong>Pay-as-you-go (if upgraded)</strong>: Gemini Flash is extremely cost-efficient (fractions of a cent per thousands of tokens). Average workout generation or coach chat costs less than $0.0001 per message.
            </p>
          </div>

          {/* 2. Hosting & Cloud Run */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wide">
              <Server className="w-4 h-4 text-emerald-500" />
              2. App Hosting & Publishing
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              • <strong>AI Studio Live Preview / Share Link</strong>: Included directly within your AI Studio environment without separate infrastructure billing.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              • <strong>Google Cloud Run (if deployed to production GCP)</strong>: Cloud Run includes a generous free tier of 2 million requests per month, 360,000 GB-seconds of compute, and automatic scale-to-zero when not in use.
            </p>
          </div>

          {/* 3. Custom Domains */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wide">
              <Globe className="w-4 h-4 text-indigo-500" />
              3. Custom Domain Name (Optional)
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              • <strong>Default URL</strong>: You automatically get a hosted application URL at no additional charge.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              • <strong>Custom Domain (e.g. yourbrand.com)</strong>: Only if you choose to purchase your own personalized `.com` or `.app` domain from a registrar (typically $10–$15 / year).
            </p>
          </div>

          {/* Key Summary */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-normal">
              <strong>Summary</strong>: You do not need to pay anything mandatory to run and use the published app. The free tier limits for Gemini and standard preview hosting cover full personal and development usage!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
