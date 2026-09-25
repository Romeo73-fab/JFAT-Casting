import { useState, useEffect, useCallback } from 'react';
import { VoiceCandidate } from './types';
import { getStoredCandidates, fetchCandidatesFromServer, subscribeToCandidatesRealtime } from './utils/storage';
import { Header } from './components/Header';
import { AuditionForm } from './components/AuditionForm';
import { SubmissionSuccess } from './components/SubmissionSuccess';
import { AdminJuryDashboard } from './components/AdminJuryDashboard';
import { AdminLogin } from './components/AdminLogin';
import bg2Image from './assets/images/bg2.png';

export default function App() {
  const [currentView, setCurrentView] = useState<'form' | 'jury' | 'success'>('form');
  const [candidates, setCandidates] = useState<VoiceCandidate[]>([]);
  const [lastSubmittedCandidate, setLastSubmittedCandidate] = useState<VoiceCandidate | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('jfat_jury_auth') === 'true';
  });

  const syncCandidates = useCallback(async () => {
    if (isAdminAuthenticated) {
      const serverList = await fetchCandidatesFromServer();
      setCandidates(serverList);
    }
  }, [isAdminAuthenticated]);

  // Load candidates into memory and set up real-time polling across all devices
  useEffect(() => {
    if (!isAdminAuthenticated) {
      setCandidates([]);
      return;
    }

    // Initial load from local cache then immediate fetch from server
    setCandidates(getStoredCandidates());
    syncCandidates();

    // Instant real-time listener from Firebase Firestore across all devices
    const unsubscribeFirestore = subscribeToCandidatesRealtime((liveList) => {
      setCandidates(liveList);
    });

    // Backup polling every 5 seconds
    const interval = setInterval(() => {
      syncCandidates();
    }, 5000);

    return () => {
      unsubscribeFirestore();
      clearInterval(interval);
    };
  }, [isAdminAuthenticated, syncCandidates]);

  const refreshCandidates = () => {
    if (isAdminAuthenticated) {
      syncCandidates();
    }
  };

  const handleSubmissionSuccess = (candidate: VoiceCandidate) => {
    setLastSubmittedCandidate(candidate);
    setCurrentView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewSubmission = () => {
    setLastSubmittedCandidate(null);
    setCurrentView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoutJury = () => {
    sessionStorage.removeItem('jfat_jury_auth');
    setIsAdminAuthenticated(false);
    setCandidates([]);
    setCurrentView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-600 selection:text-white overflow-x-hidden">
      
      {/* Fixed static background layer rendered clearer and brighter with bg2.png */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-65"
        style={{ 
          backgroundImage: `url(${bg2Image})`,
          filter: 'brightness(1.10) contrast(1.02)',
          transform: 'translate3d(0, 0, 0)',
          WebkitTransform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
        }}
        aria-hidden="true"
      />

      {/* Top Application Bar */}
      <Header
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        candidateCount={candidates.length}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16 pt-4 relative z-10">
        {currentView === 'form' && (
          <AuditionForm onSuccess={handleSubmissionSuccess} />
        )}

        {currentView === 'success' && lastSubmittedCandidate && (
          <SubmissionSuccess
            candidate={lastSubmittedCandidate}
            onNewSubmission={handleNewSubmission}
            onViewJury={() => {
              setCurrentView('jury');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'jury' && (
          isAdminAuthenticated ? (
            <AdminJuryDashboard
              candidates={candidates}
              onRefresh={refreshCandidates}
              onGoToForm={() => {
                setCurrentView('form');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onLogout={handleLogoutJury}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={() => {
                setIsAdminAuthenticated(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBackToForm={() => {
                setCurrentView('form');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )
        )}
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur-md py-7 text-xs text-slate-600 relative z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">JF &amp; Les Adorateur du Tabernacle Casting</span>
            <span>— Plateforme Officielle de Recrutement Vocal</span>
          </div>

          <div className="flex items-center gap-5 text-slate-500 text-xs">
            <span>Données protégées</span>
            <span>•</span>
            <span>Fluxio Agency</span>
            <span>•</span>
            <span>Édition 2026 - 2027</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
