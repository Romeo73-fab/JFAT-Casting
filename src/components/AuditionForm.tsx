import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Church, 
  Music, 
  RotateCcw, 
  Send, 
  Check,
  Calendar,
  Clock,
  Mic2,
  Info
} from 'lucide-react';
import { 
  CandidateFormValues, 
  VoiceCandidate, 
  VocalRange, 
  ExperienceLevel 
} from '../types';
import { 
  INITIAL_FORM_VALUES, 
  saveCandidate, 
  saveDraft, 
  getDraft, 
  clearDraft, 
  generateRegistrationNumber 
} from '../utils/storage';

interface AuditionFormProps {
  onSuccess: (candidate: VoiceCandidate) => void;
}

export const AuditionForm: React.FC<AuditionFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<CandidateFormValues>(INITIAL_FORM_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveDraftMessage, setSaveDraftMessage] = useState<string | null>(null);

  // Load draft if available on mount
  useEffect(() => {
    const draft = getDraft();
    if (draft && draft.values) {
      setFormData(draft.values);
      setSaveDraftMessage(
        `Brouillon rechargé automatiquement (sauvegardé le ${new Date(draft.savedAt).toLocaleDateString('fr-FR')} à ${new Date(draft.savedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})`
      );
      const timer = setTimeout(() => setSaveDraftMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInputChange = (field: keyof CandidateFormValues, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleManualSaveDraft = () => {
    saveDraft(formData);
    const now = new Date();
    setSaveDraftMessage(
      `Brouillon enregistré à ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}. Vos informations sont conservées.`
    );
    setTimeout(() => setSaveDraftMessage(null), 4000);
  };

  const handleClearAll = () => {
    if (window.confirm('Voulez-vous réinitialiser tous les champs du formulaire ?')) {
      setFormData(INITIAL_FORM_VALUES);
      clearDraft();
      setErrors({});
      setSaveDraftMessage('Formulaire réinitialisé.');
      setTimeout(() => setSaveDraftMessage(null), 3000);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Identité
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom de famille est obligatoire.';
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est obligatoire.';
    if (!formData.gender) newErrors.gender = 'Le genre vocal est obligatoire.';
    
    if (formData.age === '' || formData.age === undefined) {
      newErrors.age = "L'âge est obligatoire.";
    } else if (Number(formData.age) < 20) {
      newErrors.age = "L'âge minimum requis pour s'inscrire est de 20 ans.";
    } else if (Number(formData.age) > 85) {
      newErrors.age = "Veuillez saisir un âge valide (inférieur à 85 ans).";
    }

    if (!formData.cityAddress.trim()) {
      newErrors.cityAddress = "L'adresse de résidence est obligatoire.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'adresse e-mail est obligatoire.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Format d'adresse e-mail invalide.";
    }

    // Téléphone du candidat (10 chiffres obligatoires)
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Le numéro de téléphone est obligatoire.';
    } else if (cleanPhone.length !== 10) {
      newErrors.phone = 'Le numéro de téléphone doit comporter exactement 10 chiffres.';
    }

    // 2. Famille spirituelle & pasteur (Tous obligatoires)
    if (!formData.churchCommunity.trim()) {
      newErrors.churchCommunity = "Veuillez indiquer votre famille spirituelle ou église d'appartenance.";
    }

    if (!formData.pastorName.trim()) {
      newErrors.pastorName = "Le nom et prénom de votre pasteur sont obligatoires.";
    }

    // Téléphone du pasteur (10 chiffres obligatoires)
    const cleanPastorPhone = formData.pastorPhone.replace(/\D/g, '');
    if (!cleanPastorPhone) {
      newErrors.pastorPhone = 'Le numéro de téléphone de votre pasteur est obligatoire.';
    } else if (cleanPastorPhone.length !== 10) {
      newErrors.pastorPhone = 'Le numéro de téléphone du pasteur doit comporter exactement 10 chiffres.';
    }

    // 3. Profil vocal (Tous obligatoires)
    if (!formData.vocalRange) {
      newErrors.vocalRange = 'Veuillez sélectionner votre tessiture vocale.';
    }

    if (!formData.choirMember.trim()) {
      newErrors.choirMember = "Veuillez indiquer si vous faites actuellement partie d'une chorale.";
    }

    if (formData.yearsExperience === '' || formData.yearsExperience === undefined) {
      newErrors.yearsExperience = "Veuillez indiquer le nombre d'années d'expérience (saisir 0 si débutant).";
    }

    if (!formData.experienceLevel) {
      newErrors.experienceLevel = "Veuillez sélectionner votre niveau estimé.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(`field-${firstErrorField}`) || document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const candidate: VoiceCandidate = {
        ...formData,
        id: `cand-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        registrationNumber: generateRegistrationNumber(),
        submittedAt: new Date().toISOString(),
        status: 'en_attente',
        juryRating: 0,
      };

      saveCandidate(candidate);
      clearDraft();
      setIsSubmitting(false);
      onSuccess(candidate);
    }, 500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 relative z-10">
      
      {/* Form Header Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-sm p-6 sm:p-8 shadow-sm mb-6 text-center">
        <div className="flex flex-col items-center justify-center text-center border-b border-slate-100 pb-5">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100 mb-2">
            Session d'audition Soirée des Restaurés 2026
          </span>
          <h1 className="font-breathing text-3xl sm:text-4xl md:text-5xl text-slate-900 text-center py-1 tracking-normal font-normal">
            Formulaire officiel d'inscription
          </h1>
        </div>

        {/* ========================================================
            ANNONCE OFFICIELLE D'AUDITION
            ======================================================== */}
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50/70 p-5 sm:p-6 text-slate-800 shadow-2xs space-y-4 text-center">
          <p className="text-base sm:text-lg font-bold text-indigo-900 leading-snug text-center max-w-2xl mx-auto">
            Tu maîtrises déjà le chant et tu souhaites mettre ta voix au service de Dieu ?
          </p>

          <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              Dans le cadre de notre prochain programme, nous recherchons <strong className="font-semibold text-slate-900">des voix</strong> pour interpréter quelques morceaux en <strong className="font-semibold text-indigo-900">Mass Choir</strong> avec les <strong className="font-semibold text-slate-900">Adorateurs du Tabernacle</strong>.
            </p>
            <p>
              Une audition est prévue afin d’évaluer les aptitudes vocales et déterminer les profils qui correspondront le mieux aux morceaux.
            </p>
          </div>

          {/* Date & Heure Highlights */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200/90 px-3.5 py-2 shadow-2xs text-xs sm:text-sm">
              <span className="text-base" role="img" aria-label="calendrier">📅</span>
              <span className="font-bold text-slate-900">Samedi 03 Octobre 2026</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200/90 px-3.5 py-2 shadow-2xs text-xs sm:text-sm">
              <span className="text-base" role="img" aria-label="horloge">⏰</span>
              <span className="text-slate-700">Heure : <strong className="font-bold text-indigo-700">10H</strong></span>
            </div>
          </div>

          {/* Note de précision (NB) */}
          <div className="rounded-xl bg-amber-50/90 border border-amber-200/90 p-3 sm:p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-bold text-amber-900">NB :</strong> Cette audition est destinée aux personnes nées de nouveau et ayant déjà une bonne maîtrise vocale. La ponctualité et la disponibilité pour les répétitions sont indispensables.
            </p>
          </div>
        </div>

        {/* Notice : tous les champs sont obligatoires */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <p className="font-semibold text-rose-600">
            Tous les champs sont obligatoires (<span className="font-bold">*</span>).
          </p>
        </div>

        {/* Toast / draft notification message */}
        {saveDraftMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 animate-fadeIn">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{saveDraftMessage}</span>
          </div>
        )}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* ========================================================
            SECTION 1: IDENTITÉ & COORDONNÉES DU CANDIDAT
            ======================================================== */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <User className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              1. Identité et Coordonnées
            </h2>
          </div>

          <div className="space-y-4">
            
            {/* Nom et Prénom */}
            <div id="field-lastName" className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Nom et prénom <span className="text-rose-600">*</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    id="input-candidate-lastname"
                    placeholder="Nom de famille"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                      errors.lastName
                        ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                  <span className="mt-1 block text-[11px] text-slate-400">Nom de famille</span>
                  {errors.lastName && <p className="text-[11px] text-rose-600 mt-0.5">{errors.lastName}</p>}
                </div>

                <div id="field-firstName">
                  <input
                    type="text"
                    id="input-candidate-firstname"
                    placeholder="Prénom(s)"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                      errors.firstName
                        ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                  <span className="mt-1 block text-[11px] text-slate-400">Prénom</span>
                  {errors.firstName && <p className="text-[11px] text-rose-600 mt-0.5">{errors.firstName}</p>}
                </div>
              </div>
            </div>

            {/* Genre & Âge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              {/* Genre (Obligatoire) */}
              <div id="field-gender">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Genre vocal <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'femme')}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                      formData.gender === 'femme'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-2 ring-indigo-200'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Femme (Voix féminine)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'homme')}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                      formData.gender === 'homme'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-2 ring-indigo-200'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Homme (Voix masculine)
                  </button>
                </div>
                {errors.gender && <p className="text-[11px] text-rose-600 mt-1">{errors.gender}</p>}
              </div>

              {/* Âge (Obligatoire) */}
              <div id="field-age">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Âge <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  id="input-candidate-age"
                  min="20"
                  max="99"
                  placeholder="ex: 22"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value ? Number(e.target.value) : '')}
                  className={`w-full sm:w-36 rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.age
                      ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                />
                <span className="mt-1 block text-[11px] text-slate-500 font-medium">Âge minimum requis : 20 ans</span>
                {errors.age && <p className="text-[11px] text-rose-600 mt-0.5">{errors.age}</p>}
              </div>

            </div>

            {/* Adresse / Ville de résidence (Obligatoire) */}
            <div id="field-cityAddress" className="pt-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse de résidence <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  id="input-candidate-city"
                  placeholder="Où habitez vous ?"
                  value={formData.cityAddress}
                  onChange={(e) => handleInputChange('cityAddress', e.target.value)}
                  className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.cityAddress
                      ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                />
              </div>
              <span className="mt-1 block text-[11px] text-slate-400">Où habitez vous ? (Ville / Quartier)</span>
              {errors.cityAddress && <p className="text-[11px] text-rose-600 mt-0.5">{errors.cityAddress}</p>}
            </div>

            {/* Email & Téléphone (Tous deux obligatoires) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              {/* E-mail */}
              <div id="field-email">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    id="input-candidate-email"
                    placeholder="ex: myname@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                      errors.email
                        ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                <span className="mt-1 block text-[11px] text-slate-400">exemple@exemple.com</span>
                {errors.email && <p className="text-[11px] text-rose-600 mt-0.5">{errors.email}</p>}
              </div>

              {/* Numéro de téléphone */}
              <div id="field-phone">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Numéro de téléphone (10 chiffres) <span className="text-rose-600">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    id="select-phone-country"
                    value={formData.phoneCountryCode}
                    onChange={(e) => handleInputChange('phoneCountryCode', e.target.value)}
                    className="w-24 rounded-xl border border-slate-300 bg-white px-2.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="+229">🇧🇯 +229</option>
                    <option value="+225">🇨🇮 +225</option>
                    <option value="+228">🇹🇬 +228</option>
                    <option value="+221">🇸🇳 +221</option>
                    <option value="+237">🇨🇲 +237</option>
                    <option value="+243">🇨🇩 +243</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>

                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      id="input-candidate-phone"
                      placeholder="0100000000"
                      maxLength={14}
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                      }`}
                    />
                  </div>
                </div>
                <span className="mt-1 block text-[11px] text-slate-400">Format : 10 chiffres (ex: 0196000000)</span>
                {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

            </div>

          </div>
        </div>

        {/* ========================================================
            SECTION 2: RÉFÉRENCE SPIRITUELLE & PASTEUR
            ======================================================== */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Church className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                2. Famille Spirituelle et Pasteur
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Église / Famille spirituelle */}
            <div id="field-churchCommunity">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Église de provenance <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                id="input-church-community"
                placeholder="Vous êtes de quelle famille spirituelle ( votre église ) ?"
                value={formData.churchCommunity}
                onChange={(e) => handleInputChange('churchCommunity', e.target.value)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                  errors.churchCommunity
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              <span className="mt-1 block text-[11px] text-slate-400">
                Vous êtes de quelle famille spirituelle ( votre église ) ?
              </span>
              {errors.churchCommunity && <p className="text-[11px] text-rose-600 mt-0.5">{errors.churchCommunity}</p>}
            </div>

            {/* Nom et prénom du pasteur + Numéro du pasteur (Obligatoires) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div id="field-pastorName">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom et prénom de votre pasteur <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  id="input-pastor-name"
                  placeholder="Nom et prénom de votre pasteur"
                  value={formData.pastorName}
                  onChange={(e) => handleInputChange('pastorName', e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.pastorName
                      ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                />
                <span className="mt-1 block text-[11px] text-slate-400">
                  Nom et prénom de votre pasteur
                </span>
                {errors.pastorName && <p className="text-[11px] text-rose-600 mt-0.5">{errors.pastorName}</p>}
              </div>

              <div id="field-pastorPhone">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Numéro de téléphone de votre pasteur (10 chiffres) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  id="input-pastor-phone"
                  placeholder="0100000000"
                  maxLength={14}
                  value={formData.pastorPhone}
                  onChange={(e) => handleInputChange('pastorPhone', e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.pastorPhone
                      ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                />
                <span className="mt-1 block text-[11px] text-slate-400">
                  Numéro du pasteur à 10 chiffres (ex: 0195000000)
                </span>
                {errors.pastorPhone && <p className="text-[11px] text-rose-600 mt-0.5">{errors.pastorPhone}</p>}
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================
            SECTION 3: PROFIL VOCAL DU CANDIDAT (Casting de Voix)
            ======================================================== */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Music className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                3. Profil Vocal
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            
            {/* Tessiture vocale */}
            <div id="field-vocalRange">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Tessiture vocale principale <span className="text-rose-600">*</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'soprano', label: 'Soprano', sub: 'Voix aiguë femme' },
                  { id: 'mezzo', label: 'Mezzo-Soprano', sub: 'Voix médium femme' },
                  { id: 'alto', label: 'Alto / Contralto', sub: 'Voix grave femme' },
                  { id: 'tenor', label: 'Ténor', sub: 'Voix aiguë homme' },
                  { id: 'baryton', label: 'Baryton', sub: 'Voix médium homme' },
                  { id: 'basse', label: 'Basse', sub: 'Voix grave homme' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleInputChange('vocalRange', item.id as VocalRange)}
                    className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      formData.vocalRange === item.id
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-900">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
              {errors.vocalRange && <p className="text-[11px] text-rose-600 mt-1">{errors.vocalRange}</p>}
            </div>

            {/* Faites-vous actuellement partie d'une chorale ? & Années d'expérience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* Faites-vous actuellement partie d’une chorale ? */}
              <div id="field-choirMember">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faites-vous actuellement partie d’une chorale ? <span className="text-rose-600">*</span>
                </label>
                <select
                  id="select-choir-member"
                  value={formData.choirMember}
                  onChange={(e) => handleInputChange('choirMember', e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 ${
                    errors.choirMember
                      ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                >
                  <option value="">-- Sélectionnez une réponse --</option>
                  <option value="Oui, membre actif">Oui, membre actif</option>
                  <option value="Oui, responsable de pupitre / chef de chœur">Oui, responsable de pupitre / chef de chœur</option>
                  <option value="Oui, soliste">Oui, soliste</option>
                  <option value="Non, mais j'en ai déjà fait partie">Non, mais j'en ai déjà fait partie</option>
                  <option value="Non, jamais">Non, jamais</option>
                  <option value="Autre">Autre</option>
                </select>
                {errors.choirMember && <p className="text-[11px] text-rose-600 mt-0.5">{errors.choirMember}</p>}
              </div>

              {/* Années d'expérience et niveau estimé (Tous deux obligatoires) */}
              <div id="field-yearsExperience">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Années d'expérience &amp; Niveau <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      id="input-years-experience"
                      min="0"
                      max="50"
                      placeholder=""
                      value={formData.yearsExperience}
                      onChange={(e) => handleInputChange('yearsExperience', e.target.value === '' ? '' : Number(e.target.value))}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 ${
                        errors.yearsExperience
                          ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                      }`}
                    />
                    <span className="mt-1 block text-[10px] text-slate-400">Années (ex: 0, 1, 3)</span>
                  </div>

                  <div id="field-experienceLevel">
                    <select
                      id="select-experience-level"
                      value={formData.experienceLevel}
                      onChange={(e) => handleInputChange('experienceLevel', e.target.value as ExperienceLevel)}
                      className={`w-full rounded-xl border bg-white px-2.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 ${
                        errors.experienceLevel
                          ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                      }`}
                    >
                      <option value="">Niveau estimé *</option>
                      <option value="debutant">Débutant</option>
                      <option value="intermediaire">Intermédiaire</option>
                      <option value="confirme">Confirmé</option>
                      <option value="professionnel">Professionnel</option>
                    </select>
                    <span className="mt-1 block text-[10px] text-slate-400">Niveau</span>
                  </div>
                </div>
                {errors.yearsExperience && <p className="text-[11px] text-rose-600 mt-1">{errors.yearsExperience}</p>}
                {errors.experienceLevel && <p className="text-[11px] text-rose-600 mt-1">{errors.experienceLevel}</p>}
              </div>

            </div>

          </div>
        </div>

        {/* ========================================================
            SUBMIT & ACTION BUTTONS
            (Enregistrer / Submission / Effacer toutes les réponses)
            ======================================================== */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-sm p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Effacer toutes les réponses */}
          <button
            type="button"
            id="btn-clear-responses"
            onClick={handleClearAll}
            className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1.5 transition-colors order-3 sm:order-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Effacer toutes les réponses
          </button>

          {/* Action buttons (Submission) */}
          <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2 justify-end">
            
            {/* "Submission" / Soumettre ma candidature */}
            <button
              type="submit"
              id="btn-submit-candidature"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Validation en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submission
                </>
              )}
            </button>

          </div>

        </div>

      </form>
    </div>
  );
};
