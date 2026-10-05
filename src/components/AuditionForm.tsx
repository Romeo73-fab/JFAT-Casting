import React from 'react';
import { Lock } from 'lucide-react';
import { VoiceCandidate } from '../types';

interface AuditionFormProps {
  onSuccess?: (candidate: VoiceCandidate) => void;
}

export const AuditionForm: React.FC<AuditionFormProps> = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24 sm:px-6 relative z-10 flex items-center justify-center min-h-[55vh]">
      <div className="w-full rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-8 sm:p-12 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 border border-orange-200/60 text-[#f44c00] mb-6 shadow-2xs">
          <Lock className="h-8 w-8" />
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          Nous avons clôturé les inscriptions, merci.
        </h1>
      </div>
    </div>
  );
};
