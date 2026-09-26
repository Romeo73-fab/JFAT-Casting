import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Star, 
  Trash2, 
  Phone, 
  Mail, 
  Church, 
  Music, 
  CheckCircle, 
  Clock, 
  MapPin,
  MessageCircle,
  LogOut,
  Sparkles
} from 'lucide-react';
import { VoiceCandidate, CandidateStatus } from '../types';
import { updateCandidateJury, deleteCandidate } from '../utils/storage';
import { getWhatsAppUrl } from '../utils/whatsapp';

interface AdminJuryDashboardProps {
  candidates: VoiceCandidate[];
  onRefresh: () => void;
  onGoToForm: () => void;
  onLogout?: () => void;
}

export const AdminJuryDashboard: React.FC<AdminJuryDashboardProps> = ({
  candidates,
  onRefresh,
  onGoToForm,
  onLogout,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRange, setFilterRange] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeNotesCandidateId, setActiveNotesCandidateId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [candidateToDelete, setCandidateToDelete] = useState<VoiceCandidate | null>(null);

  const handleStatusChange = (id: string, newStatus: CandidateStatus) => {
    updateCandidateJury(id, { status: newStatus });
    onRefresh();
  };

  const handleRatingChange = (id: string, rating: number) => {
    updateCandidateJury(id, { juryRating: rating });
    onRefresh();
  };

  const handleSaveNotes = (id: string) => {
    updateCandidateJury(id, { juryNotes: tempNotes });
    setActiveNotesCandidateId(null);
    onRefresh();
  };

  const confirmDelete = () => {
    if (candidateToDelete) {
      deleteCandidate(candidateToDelete.id);
      setCandidateToDelete(null);
      onRefresh();
    }
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.churchCommunity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.pastorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cityAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRange = filterRange === 'all' || c.vocalRange === filterRange;
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;

    return matchesSearch && matchesRange && matchesStatus;
  });

  // Stats calculation
  const totalCount = candidates.length;
  const choirCount = candidates.filter((c) => c.choirMember && c.choirMember.toLowerCase().includes('oui')).length;
  const shortlistedCount = candidates.filter((c) => c.status === 'convoque' || c.status === 'retenu').length;
  const sopranoCount = candidates.filter((c) => c.vocalRange === 'soprano' || c.vocalRange === 'mezzo').length;
  const tenorCount = candidates.filter((c) => c.vocalRange === 'tenor').length;
  const altoCount = candidates.filter((c) => c.vocalRange === 'alto').length;
  const bassCount = candidates.filter((c) => c.vocalRange === 'baryton' || c.vocalRange === 'basse').length;

  const getStatusBadge = (status: CandidateStatus) => {
    switch (status) {
      case 'convoque':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            <Clock className="h-3 w-3" /> Convoqué pour audition
          </span>
        );
      case 'retenu':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-3 w-3" /> Retenu / Sélectionné
          </span>
        );
      case 'non_retenu':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
            Non retenu
          </span>
        );
      case 'en_attente':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            En attente d'écoute
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      
      {/* Top Banner Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 w-full md:w-auto">
          <img
            src="/logo-soiree-des-restaures-08.png"
            alt="Logo Soirée des Restaurés"
            className="h-12 sm:h-16 w-auto max-w-[120px] object-contain drop-shadow-2xs shrink-0"
          />
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
                Session d'audition Soirée des Restaurés 2026
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Synchronisé en direct
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Espace Jury &amp; Gestion des Auditions
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-xl">
              Évaluez les profils vocaux, notez les candidats du casting et exportez les convocations officielles.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-end gap-2.5 shrink-0 w-full md:w-auto">
          {onLogout && (
            <button
              type="button"
              id="btn-jury-logout"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
              title="Déconnexion de l'espace jury"
            >
              <LogOut className="h-3.5 w-3.5" />
              Déconnexion
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Total Candidatures</span>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalCount}</p>
          <span className="text-[10px] text-slate-500">Inscrits au casting</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Membres de Chorale</span>
          <p className="mt-1 text-2xl font-bold text-indigo-600">{choirCount}</p>
          <span className="text-[10px] text-slate-500">Pratique chorale active</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Retenus / Convoqués</span>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{shortlistedCount}</p>
          <span className="text-[10px] text-slate-500">Admis aux étapes suivantes</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Équilibre des Pupitres</span>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span title="Sopranos" className="text-pink-600">S:{sopranoCount}</span>
            <span>·</span>
            <span title="Altos" className="text-amber-600">A:{altoCount}</span>
            <span>·</span>
            <span title="Ténors" className="text-indigo-600">T:{tenorCount}</span>
            <span>·</span>
            <span title="Basses" className="text-emerald-700">B:{bassCount}</span>
          </div>
          <span className="text-[10px] text-slate-400">Répartition vocale</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs mb-6 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            id="input-search-candidates"
            placeholder="Rechercher par nom, prénom, église, pasteur, dossier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Vocal Range Filter */}
          <select
            id="select-filter-range"
            value={filterRange}
            onChange={(e) => setFilterRange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">Toutes les tessitures</option>
            <option value="soprano">Soprano</option>
            <option value="mezzo">Mezzo-Soprano</option>
            <option value="alto">Alto</option>
            <option value="tenor">Ténor</option>
            <option value="baryton">Baryton</option>
            <option value="basse">Basse</option>
          </select>

          {/* Status Filter */}
          <select
            id="select-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="convoque">Convoqué</option>
            <option value="retenu">Retenu</option>
            <option value="non_retenu">Non retenu</option>
          </select>
        </div>
      </div>

      {/* Candidate List */}
      {filteredCandidates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">Aucune candidature correspondante</h3>
          <p className="text-xs text-slate-400 mt-1">
            Modifiez vos filtres ou effectuez une nouvelle recherche.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((candidate) => {
            const displayPhone = `${candidate.phoneCountryCode} ${candidate.phone}`;
            const displayEmail = candidate.email;
            const displayAddress = candidate.cityAddress || 'Adresse N/R';
            const displayPastorPhone = candidate.pastorPhone || '';

            return (
              <div
                key={candidate.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  
                  {/* Identity & Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {candidate.registrationNumber}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {candidate.lastName} {candidate.firstName}
                      </h3>
                      <span className="text-xs text-slate-400">
                        • {candidate.gender === 'femme' ? 'Femme' : candidate.gender === 'homme' ? 'Homme' : ''} ({candidate.age ? `${candidate.age} ans` : 'Âge N/R'})
                      </span>
                      {getStatusBadge(candidate.status)}
                    </div>

                    {/* Contact & Church info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-xs text-slate-600">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <a href={`tel:${candidate.phoneCountryCode}${candidate.phone}`} className="hover:text-indigo-600 font-medium">
                            {displayPhone}
                          </a>
                        </div>
                        
                        {/* Bouton WhatsApp direct vers l'inbox */}
                        <a
                          href={getWhatsAppUrl(
                            candidate.phoneCountryCode,
                            candidate.phone,
                            `Bonjour ${candidate.firstName}, nous vous contactons de la part du jury concernant votre candidature (${candidate.registrationNumber}) au casting de voix JF & Les Adorateur du Tabernacle.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer"
                          title="Ouvrir directement la conversation WhatsApp avec le candidat"
                        >
                          <MessageCircle className="h-3 w-3 fill-current" />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{displayEmail}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{displayAddress}</span>
                      </div>

                      {/* Community & Pastor from form */}
                      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                        <div className="flex items-center gap-1.5">
                          <Church className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>
                            <strong>Église :</strong> {candidate.churchCommunity || 'N/R'} — <strong>Pasteur :</strong> {candidate.pastorName || 'N/R'}
                          </span>
                        </div>

                        {candidate.pastorPhone && (
                          <div className="flex items-center gap-1.5 text-[11px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                            <span className="text-slate-500">Tél Pasteur :</span>
                            <span className="font-medium text-slate-700 font-mono">{displayPastorPhone}</span>
                            <a
                              href={getWhatsAppUrl(
                                candidate.phoneCountryCode,
                                candidate.pastorPhone,
                                `Bonjour Pasteur, nous vous contactons concernant la candidature au casting vocal de ${candidate.firstName} ${candidate.lastName}.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
                              title="Ouvrir WhatsApp avec le pasteur"
                            >
                              <MessageCircle className="h-2.5 w-2.5 fill-current" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        )}
                      </div>

                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      <Music className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        <strong className="text-slate-700">Tessiture :</strong> <span className="font-semibold text-indigo-700 capitalize">{candidate.vocalRange}</span> ({candidate.yearsExperience ? `${candidate.yearsExperience} ans exp.` : 'Débutant'})
                        {candidate.choirMember && (
                          <span className="ml-2 text-slate-600">• <strong>Chorale :</strong> {candidate.choirMember}</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Jury Controls */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  {/* Status Dropdown */}
                  <div className="w-full sm:w-auto">
                    <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                      Décision d'audition
                    </label>
                    <select
                      value={candidate.status}
                      onChange={(e) => handleStatusChange(candidate.id, e.target.value as CandidateStatus)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="en_attente">⏳ En attente</option>
                      <option value="convoque">🎙️ Convoquer pour audition</option>
                      <option value="retenu">✅ Retenu dans l'équipe</option>
                      <option value="non_retenu">❌ Non retenu</option>
                    </select>
                  </div>

                  {/* Star Rating */}
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                      Note Jury (1 à 5)
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(candidate.id, star)}
                          className="p-0.5 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              (candidate.juryRating || 0) >= star
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNotesCandidateId(
                          activeNotesCandidateId === candidate.id ? null : candidate.id
                        );
                        setTempNotes(candidate.juryNotes || '');
                      }}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
                    >
                      {candidate.juryNotes ? 'Modifier remarques' : '+ Ajouter remarque'}
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setCandidateToDelete(candidate)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      title="Supprimer définitivement la candidature"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>

              </div>

              {/* Collapsible Jury Notes */}
              {activeNotesCandidateId === candidate.id && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    Commentaires confidentiels du jury d'écoute :
                  </label>
                  <textarea
                    rows={2}
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Ex: Belle aisance dans les aigus, justesse impeccable, tenue de souffle à perfectionner..."
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveNotesCandidateId(null)}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveNotes(candidate.id)}
                      className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                    >
                      Enregistrer la remarque
                    </button>
                  </div>
                </div>
              )}

              {/* Display existing notes if not editing */}
              {candidate.juryNotes && activeNotesCandidateId !== candidate.id && (
                <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-100 flex items-start gap-2">
                  <span className="font-semibold text-indigo-900 shrink-0">Note du jury :</span>
                  <span>{candidate.juryNotes}</span>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {/* Modal de Confirmation de Suppression (Fiable à 100% dans l'iframe) */}
      {candidateToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 border border-rose-100 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirmer la suppression
                </h3>
                <p className="text-xs text-slate-500">
                  Dossier : <span className="font-mono font-semibold text-indigo-700">{candidateToDelete.registrationNumber}</span>
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-3">
              Voulez-vous vraiment supprimer définitivement le dossier de{' '}
              <strong className="text-slate-900 font-semibold">
                {candidateToDelete.firstName} {candidateToDelete.lastName}
              </strong>{' '}
              ?
            </p>

            <div className="rounded-xl bg-rose-50/80 border border-rose-100 p-3 text-xs text-rose-800 mb-5">
              Cette action est immédiate et irréversible. Le candidat sera retiré de la liste du jury.
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                id="btn-cancel-delete"
                onClick={() => setCandidateToDelete(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                id="btn-confirm-delete"
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Supprimer définitivement</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
