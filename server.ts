import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'candidates.json');

function initData(): Candidate[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    // Write default seed
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_CANDIDATES, null, 2), 'utf-8');
    return DEFAULT_CANDIDATES;
  } catch (err) {
    console.error('Error initializing candidates data:', err);
    return DEFAULT_CANDIDATES;
  }
}

function persistData(candidates: Candidate[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(candidates, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting candidates data:', err);
  }
}

async function start() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  let candidates: Candidate[] = initData();

  // API Endpoints
  app.get('/api/candidates', (_req, res) => {
    res.json(candidates);
  });

  app.post('/api/candidates', (req, res) => {
    const candidate = req.body as Candidate;
    if (!candidate || !candidate.id) {
      res.status(400).json({ error: 'Données de candidat invalides' });
      return;
    }
    const idx = candidates.findIndex((c) => c.id === candidate.id);
    if (idx >= 0) {
      candidates[idx] = candidate;
    } else {
      candidates.unshift(candidate);
    }
    persistData(candidates);
    res.status(201).json(candidate);
  });

  app.patch('/api/candidates/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) {
      res.status(404).json({ error: 'Candidat introuvable' });
      return;
    }
    Object.assign(candidate, updates);
    persistData(candidates);
    res.json(candidate);
  });

  app.delete('/api/candidates/:id', (req, res) => {
    const { id } = req.params;
    candidates = candidates.filter((c) => c.id !== id);
    persistData(candidates);
    res.json({ success: true, id });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(__dirname, 'dist');

  app.use(express.static(path.resolve(__dirname, 'public'), {
    maxAge: '1d',
  }));

  if (isProduction && fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server ready at http://0.0.0.0:${PORT}`);
  });
}

start();
