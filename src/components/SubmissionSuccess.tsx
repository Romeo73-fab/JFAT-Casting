import React from 'react';
import { 
  CheckCircle2, 
  PlusCircle,
  Calendar
} from 'lucide-react';
import { VoiceCandidate } from '../types';

interface SubmissionSuccessProps {
  candidate: VoiceCandidate;
  onNewSubmission: () => void;
  onViewJury?: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  candidate,
  onNewSubmission,
}) => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md p-6 sm:p-10 shadow-lg text-center">
        {/* Success Header */}
        <div className="pb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-xs ring-8 ring-emerald-50">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/80 mb-2">
            Candidature Enregistrée avec Succès
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Votre dossier d'audition est validé !
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
            Merci <strong className="text-slate-900">{candidate.firstName} {candidate.lastName}</strong>. 
            Votre candidature a bien été enregistrée et transmise au comité de sélection.
          </p>

          {/* Dossier Code Card */}
          <div className="mt-6 inline-flex flex-col items-center gap-2 rounded-2xl border-2 border-indigo-200 bg-indigo-50/90 px-8 py-5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Votre Numéro de Dossier Officiel
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-black text-indigo-950 tracking-wider">
              {candidate.registrationNumber}
            </span>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">
              Veuillez noter ou faire une capture d'écran de ce numéro.
            </p>
          </div>

          {/* Date uniquement */}
          <div className="mt-6 max-w-xs mx-auto">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 flex items-center justify-center gap-2.5">
              <Calendar className="h-4 w-4 text-indigo-600 shrink-0" />
              <div className="text-center">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date de l'audition</span>
                <p className="text-sm font-bold text-slate-900">Samedi 03 Octobre 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-center">
          <button
            type="button"
            id="btn-new-candidacy"
            onClick={onNewSubmission}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Nouvelle inscription
          </button>
        </div>

      </div>
    </div>
  );
};
