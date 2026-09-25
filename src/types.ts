export type VocalRange = 
  | 'soprano'
  | 'mezzo'
  | 'alto'
  | 'tenor'
  | 'baryton'
  | 'basse'
  | 'voix_off_femme'
  | 'voix_off_homme'
  | 'autre';

export type ExperienceLevel =
  | 'debutant'
  | 'intermediaire'
  | 'confirme'
  | 'professionnel';

export type CandidateStatus =
  | 'en_attente'
  | 'convoque'
  | 'retenu'
  | 'non_retenu';

export interface CandidateFormValues {
  // Identité
  lastName: string;
  firstName: string;
  gender: 'femme' | 'homme' | '';
  age: number | '';
  email: string;
  phoneCountryCode: string;
  phone: string;
  cityAddress: string;

  // Référence spirituelle / communauté (comme dans le formulaire d'origine)
  churchCommunity: string;
  pastorName: string;
  pastorPhone: string;

  // Profil vocal
  vocalRange: VocalRange | '';
  choirMember: string; // Faites-vous actuellement partie d’une chorale ?
  experienceLevel: ExperienceLevel | '';
  yearsExperience: number | '';
}

export interface VoiceCandidate extends CandidateFormValues {
  id: string;
  registrationNumber: string;
  submittedAt: string;
  status: CandidateStatus;
  juryRating?: number; // 1 to 5
  juryNotes?: string;
  // Legacy optional fields
  primaryStyle?: string;
  canReadMusic?: boolean | null;
  audioSample?: null;
  demoLink?: string;
  availabilities?: string[];
  motivationNotes?: string;
  termsAccepted?: boolean;
}

