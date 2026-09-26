import React from 'react';
import { Mic2, Users, FileEdit, Lock } from 'lucide-react';

interface HeaderProps {
  currentView: 'form' | 'jury' | 'success';
  onViewChange: (view: 'form' | 'jury') => void;
  candidateCount: number;
  isAdminAuthenticated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  candidateCount,
  isAdminAuthenticated,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:py-3 sm:px-6">
        
        {/* Brand & Title with Logo */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1 mr-2">
          <img
            src="/llo.png"
            alt="Logo Officiel JFAT"
            width={140}
            height={70}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            className="h-11 sm:h-14 md:h-16 w-auto max-w-[130px] sm:max-w-[170px] md:max-w-[200px] object-contain drop-shadow-xs shrink-0 transition-transform hover:scale-105 duration-200 cursor-pointer"
            onClick={() => onViewChange('form')}
            title="Accueil - Inscription Audition"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg md:text-xl leading-tight block truncate">
              JFAT Casting
            </span>
          </div>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Top navigation tabs */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 sm:p-1 border border-slate-200/60">
            <button
              type="button"
              id="nav-btn-form"
              onClick={() => onViewChange('form')}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold transition-all ${
                currentView === 'form' || currentView === 'success'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileEdit className="h-3.5 w-3.5" />
              <span>Candidature</span>
            </button>

            <button
              type="button"
              id="nav-btn-jury"
              onClick={() => onViewChange('jury')}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'jury'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Espace réservé au Jury"
            >
              {isAdminAuthenticated ? (
                <Users className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span>Jury</span>
            </button>
          </div>

          {/* Language indicator like in the original form screenshot */}
          <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
            <span className="text-sm">🇫🇷</span>
            <span className="font-medium text-[11px]">Français</span>
          </div>

        </div>

      </div>
    </header>
  );
};
