import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

interface Candidate {
  id: string;
  registrationNumber: string;
  submittedAt: string;
  status: 'en_attente' | 'convoque' | 'retenu' | 'non_retenu';
  juryRating?: number;
  juryNotes?: string;
  lastName: string;
  firstName: string;
  gender: 'femme' | 'homme' | '';
  age: number | '';
  email: string;
  phoneCountryCode: string;
  phone: string;
  cityAddress: string;
  churchCommunity: string;
  pastorName: string;
  pastorPhone: string;
  vocalRange: string;
  choirMember: string;
  experienceLevel: string;
  yearsExperience: number | '';
}

const DEFAULT_CANDIDATES: Candidate[] = [
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

const TMP_FILE = path.join('/tmp', 'candidates.json');

function readCandidates(): Candidate[] {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_CANDIDATES;
}

function writeCandidates(data: Candidate[]): void {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

// Memory cache fallback
let memoryCandidates: Candidate[] = readCandidates();

async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(req: IncomingMessage & { query?: Record<string, string>; body?: any }, res: ServerResponse & { status?: (code: number) => any; json?: (data: any) => void }) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Parse URL & Query
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const idFromPath = url.pathname.replace(/^\/api\/candidates\/?/, '').split('/')[0];
  const id = idFromPath || url.searchParams.get('id') || req.query?.id || '';

  if (req.method === 'GET') {
    const list = readCandidates();
    res.statusCode = 200;
    res.end(JSON.stringify(list));
    return;
  }

  const payload = req.body || (await parseBody(req));

  if (req.method === 'POST') {
    const candidate = payload as Candidate;
    if (!candidate || !candidate.id) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Données de candidat invalides' }));
      return;
    }

    const list = readCandidates();
    const idx = list.findIndex((c) => c.id === candidate.id);
    if (idx >= 0) {
      list[idx] = candidate;
    } else {
      list.unshift(candidate);
    }
    writeCandidates(list);
    memoryCandidates = list;

    res.statusCode = 201;
    res.end(JSON.stringify(candidate));
    return;
  }

  if (req.method === 'PATCH') {
    if (!id) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'ID requis' }));
      return;
    }

    const list = readCandidates();
    const candidate = list.find((c) => c.id === id);
    if (!candidate) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Candidat introuvable' }));
      return;
    }

    Object.assign(candidate, payload);
    writeCandidates(list);
    memoryCandidates = list;

    res.statusCode = 200;
    res.end(JSON.stringify(candidate));
    return;
  }

  if (req.method === 'DELETE') {
    if (!id) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'ID requis' }));
      return;
    }

    let list = readCandidates();
    list = list.filter((c) => c.id !== id);
    writeCandidates(list);
    memoryCandidates = list;

    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, id }));
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}
