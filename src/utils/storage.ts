import { VoiceCandidate, CandidateFormValues } from '../types';
import { encryptData, decryptData } from './crypto';
import db from '../firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

const STORAGE_KEY = 'voice_casting_candidates_v1';
const DRAFT_KEY = 'voice_casting_draft_v1';

export const INITIAL_FORM_VALUES: CandidateFormValues = {
  lastName: '',
  firstName: '',
  gender: '',
  age: '',
  email: '',
  phoneCountryCode: '+229',
  phone: '',
  cityAddress: '',
  churchCommunity: '',
  pastorName: '',
  pastorPhone: '',
  vocalRange: '',
  choirMember: '',
  experienceLevel: '',
  yearsExperience: '',
};

// Seed demo candidates so the Jury dashboard is immediately rich & testable
const DEMO_CANDIDATES: VoiceCandidate[] = [
  {
    id: 'demo-1',
    registrationNumber: 'VOX-2026-4192',
    submittedAt: '2026-09-21T14:30:00Z',
    status: 'convoque',
    juryRating: 5,
    juryNotes: 'Excellente projection vocale et maîtrise du vibrato. Très prometteuse pour les pupitres Soprano 1.',
    lastName: 'AGBODJAN',
    firstName: 'Grâce Estelle',
    gender: 'femme',
    age: 24,
    email: 'grace.agbodjan@example.com',
    phoneCountryCode: '+229',
    phone: '0197452310',
    cityAddress: 'Cotonou, Haie Vive',
    churchCommunity: 'Église Évangélique de la Foi Vivante',
    pastorName: 'Pasteur Ézéchiel K.',
    pastorPhone: '0195123456',
    vocalRange: 'soprano',
    choirMember: 'Oui, membre active',
    experienceLevel: 'confirme',
    yearsExperience: 6,
  },
  {
    id: 'demo-2',
    registrationNumber: 'VOX-2026-7821',
    submittedAt: '2026-09-21T18:15:00Z',
    status: 'retenu',
    juryRating: 4,
    juryNotes: 'Timbre de voix chaud, parfait pour les solos et la conduite de louange.',
    lastName: 'HOUNSINOU',
    firstName: 'Marc-Aurèle',
    gender: 'homme',
    age: 28,
    email: 'marc.hounsinou@example.com',
    phoneCountryCode: '+229',
    phone: '0166184920',
    cityAddress: 'Porto-Novo, Ouando',
    churchCommunity: 'Ministère International de la Grâce',
    pastorName: 'Pasteur David Dossou',
    pastorPhone: '0196001122',
    vocalRange: 'tenor',
    choirMember: 'Oui, responsable / soliste',
    experienceLevel: 'professionnel',
    yearsExperience: 8,
  },
  {
    id: 'demo-3',
    registrationNumber: 'VOX-2026-9043',
    submittedAt: '2026-09-22T09:00:00Z',
    status: 'en_attente',
    juryRating: 0,
    juryNotes: '',
    lastName: 'TOSSOU',
    firstName: 'Bernadette',
    gender: 'femme',
    age: 22,
    email: 'bernadette.tossou@example.com',
    phoneCountryCode: '+229',
    phone: '0194203040',
    cityAddress: 'Calavi, Arconville',
    churchCommunity: 'Assemblée Chrétienne pour la Paix',
    pastorName: 'Pasteur Jean-Marie Hounkpe',
    pastorPhone: '0197887766',
    vocalRange: 'alto',
    choirMember: 'Non, mais j’ai une expérience passée',
    experienceLevel: 'intermediaire',
    yearsExperience: 3,
  },
];

export function getStoredCandidates(): VoiceCandidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, encryptData(DEMO_CANDIDATES));
      return DEMO_CANDIDATES;
    }
    const parsed = decryptData<VoiceCandidate[]>(raw, DEMO_CANDIDATES);
    return Array.isArray(parsed) ? parsed : DEMO_CANDIDATES;
  } catch {
    return DEMO_CANDIDATES;
  }
}

export async function fetchCandidatesFromServer(): Promise<VoiceCandidate[]> {
  // 1. Try Firebase Firestore first (centralized cloud database)
  try {
    const colRef = collection(db, 'candidates');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const items: VoiceCandidate[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as VoiceCandidate);
      });
      items.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
      localStorage.setItem(STORAGE_KEY, encryptData(items));
      return items;
    } else {
      // First run: seed Firestore with demo candidates so jury has test data immediately
      const currentLocal = getStoredCandidates();
      for (const c of currentLocal) {
        setDoc(doc(db, 'candidates', c.id), c, { merge: true }).catch(() => {});
      }
      return currentLocal;
    }
  } catch (err) {
    console.warn('Firestore getDocs notice:', err);
  }

  // 2. Fallback to API if Firestore encounters network issue
  try {
    const res = await fetch('/api/candidates');
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(STORAGE_KEY, encryptData(data));
          return data;
        }
      }
    }
  } catch (err) {
    console.warn('Erreur synchronisation serveur candidates:', err);
  }

  return getStoredCandidates();
}

export function subscribeToCandidatesRealtime(callback: (candidates: VoiceCandidate[]) => void): () => void {
  try {
    const colRef = collection(db, 'candidates');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: VoiceCandidate[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as VoiceCandidate);
          });
          items.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
          localStorage.setItem(STORAGE_KEY, encryptData(items));
          callback(items);
        }
      },
      (err) => {
        console.warn('Firestore onSnapshot listener notice:', err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Error setting up onSnapshot listener:', err);
    return () => {};
  }
}

export function saveCandidate(candidate: VoiceCandidate): void {
  const list = getStoredCandidates();
  const existingIdx = list.findIndex((c) => c.id === candidate.id);
  if (existingIdx >= 0) {
    list[existingIdx] = candidate;
  } else {
    list.unshift(candidate);
  }
  localStorage.setItem(STORAGE_KEY, encryptData(list));

  // 1. Sync with Firebase Firestore (permanent cloud database)
  try {
    const candidateRef = doc(db, 'candidates', candidate.id);
    setDoc(candidateRef, candidate, { merge: true }).catch((err) => {
      console.warn('Firestore setDoc notice:', err);
    });
  } catch (err) {
    console.warn('Firestore write candidate error:', err);
  }

  // 2. Sync with backend API
  fetch('/api/candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(candidate),
  }).catch((err) => console.warn('Could not post candidate to server:', err));
}

export function updateCandidateJury(
  id: string,
  updates: Partial<Pick<VoiceCandidate, 'status' | 'juryRating' | 'juryNotes'>>
): VoiceCandidate | null {
  const list = getStoredCandidates();
  const candidate = list.find((c) => c.id === id);
  if (!candidate) return null;

  Object.assign(candidate, updates);
  localStorage.setItem(STORAGE_KEY, encryptData(list));

  // 1. Sync with Firebase Firestore
  try {
    const candidateRef = doc(db, 'candidates', id);
    setDoc(candidateRef, updates, { merge: true }).catch((err) => {
      console.warn('Firestore updateDoc notice:', err);
    });
  } catch (err) {
    console.warn('Firestore update candidate error:', err);
  }

  // 2. Sync with backend API
  fetch(`/api/candidates/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }).catch((err) => console.warn('Could not patch candidate on server:', err));

  return candidate;
}

export function deleteCandidate(id: string): void {
  const list = getStoredCandidates().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, encryptData(list));

  // 1. Sync with Firebase Firestore
  try {
    const candidateRef = doc(db, 'candidates', id);
    deleteDoc(candidateRef).catch((err) => {
      console.warn('Firestore deleteDoc notice:', err);
    });
  } catch (err) {
    console.warn('Firestore delete candidate error:', err);
  }

  // 2. Sync with backend API
  fetch(`/api/candidates/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch((err) => console.warn('Could not delete candidate on server:', err));
}

export function saveDraft(values: CandidateFormValues): void {
  const payload = {
    values,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(DRAFT_KEY, encryptData(payload));
}

export function getDraft(): { values: CandidateFormValues; savedAt: string } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return decryptData<{ values: CandidateFormValues; savedAt: string } | null>(raw, null);
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

export function generateRegistrationNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `VOX-${year}-${rand}`;
}
