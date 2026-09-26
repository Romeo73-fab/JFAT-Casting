import React, { useState, useEffect } from 'react';
import { Mail, KeyRound, ArrowLeft, AlertCircle, ShieldCheck, Clock, Lock } from 'lucide-react';
import { verifyAdminCredentials } from '../utils/crypto';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToForm: () => void;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToForm,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Compteur de verrouillage anti brute-force
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;
    setError(null);
    setIsLoading(true);

    try {
      const isValid = await verifyAdminCredentials(email, password);

      if (isValid) {
        setFailedAttempts(0);
        sessionStorage.setItem('jfat_jury_auth', 'true');
        onLoginSuccess();
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
          setLockoutRemaining(LOCKOUT_SECONDS);
          setError(`Trop de tentatives erronées. Par mesure de sécurité, l'accès est bloqué pendant ${LOCKOUT_SECONDS} secondes.`);
        } else {
          setError(`Identifiants incorrects. Tentative ${nextAttempts}/${MAX_FAILED_ATTEMPTS}. Veuillez vérifier l'e-mail et le mot de passe.`);
        }
      }
    } catch {
      setError("Erreur de vérification sécurisée. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 relative z-10">
      
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-xl">
        
        {/* Title requested by user */}
        <div className="text-center mb-6">
          <img
            src="/logo-soiree-des-restaures-08.png"
            alt="Soirée des Restaurés - Logo Officiel"
            className="h-16 sm:h-20 w-auto max-w-[190px] object-contain mx-auto mb-4 drop-shadow-xs"
          />
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Espace réservé au Jury
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Portail d'évaluation et de sélection des candidatures vocales.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adresse e-mail du jury
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                id="input-jury-email"
                required
                placeholder=""
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                id="input-jury-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              id="btn-jury-login"
              disabled={isLoading || lockoutRemaining > 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : lockoutRemaining > 0 ? (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Accès temporairement bloqué ({lockoutRemaining}s)
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </form>

        {/* Protection Reassurance Badge */}
        <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-left">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-slate-600">
              <strong className="font-semibold text-slate-800">Protection des données actives :</strong> Identifiants hachés en SHA-256 (non exposés). Données du casting et coordonnées personnelles chiffrées localement au repos.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onBackToForm}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour au formulaire de candidature
          </button>
        </div>

      </div>

    </div>
  );
};
