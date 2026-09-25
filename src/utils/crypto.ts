/**
 * Utilitaires cryptographiques et de protection des données sensibles
 * - Hachage SHA-256 pour authentification sans stockage en clair des identifiants
 * - Chiffrement / Déchiffrement des données stockées (Protection locale au repos)
 * - Masquage des coordonnées personnelles (Protection contre les regards indiscrets)
 */

// Empreintes cryptographiques SHA-256 des identifiants autorisés
// (Les identifiants en clair ne sont jamais stockés dans le code source)
const AUTHORIZED_EMAIL_HASH = 'a24e324c4b3885670333439f4751cee62057de2977a12f2bd4c524dac1a85a74';
const AUTHORIZED_PASS_HASH = '858f63dcb869c0f3ae7f20b550f6d7fce01155a1c7dc23e777b81140d6254945';

// Clé interne de brouillage et de chiffrement pour les données locales
const CIPHER_SALT = 'JFAT-SECURE-VOX-2026-KEY$!';

/**
 * Calcule l'empreinte SHA-256 d'une chaîne de caractères avec l'API Web Crypto
 */
export async function computeSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Vérifie les identifiants saisis par comparaison cryptographique sécurisée
 */
export async function verifyAdminCredentials(email: string, pass: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  const [inputEmailHash, inputPassHash] = await Promise.all([
    computeSHA256(cleanEmail),
    computeSHA256(cleanPass),
  ]);

  return (
    inputEmailHash === AUTHORIZED_EMAIL_HASH &&
    inputPassHash === AUTHORIZED_PASS_HASH
  );
}

/**
 * Chiffre une chaîne en un format sécurisé ENCV1 pour protéger les données au repos
 */
export function encryptString(plaintext: string): string {
  try {
    const key = CIPHER_SALT;
    let result = '';
    for (let i = 0; i < plaintext.length; i++) {
      const charCode = plaintext.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode ^ keyChar);
    }
    // Encode en base64 pour un stockage propre dans le navigateur
    const b64 = btoa(unescape(encodeURIComponent(result)));
    return `ENCV1:${b64}`;
  } catch {
    return plaintext;
  }
}

/**
 * Déchiffre une chaîne chiffrée ENCV1
 */
export function decryptString(encrypted: string): string {
  try {
    if (!encrypted.startsWith('ENCV1:')) {
      return encrypted;
    }
    const b64 = encrypted.substring(6);
    const raw = decodeURIComponent(escape(atob(b64)));
    const key = CIPHER_SALT;
    let result = '';
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode ^ keyChar);
    }
    return result;
  } catch {
    return encrypted;
  }
}

/**
 * Chiffre et sérialise un objet JavaScript pour le stockage sécurisé
 */
export function encryptData<T>(data: T): string {
  const json = JSON.stringify(data);
  return encryptString(json);
}

/**
 * Déchiffre et désérialise les données protégées
 */
export function decryptData<T>(storedValue: string | null, fallback: T): T {
  if (!storedValue) return fallback;
  try {
    const json = decryptString(storedValue);
    return JSON.parse(json) as T;
  } catch {
    // Si format brut hérité (non chiffré)
    try {
      return JSON.parse(storedValue) as T;
    } catch {
      return fallback;
    }
  }
}

/**
 * Masque un numéro de téléphone pour la confidentialité (ex: 01 97 45 23 10 -> 01 •• •• •• 10)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length < 6) return '••••••';
  const prefix = clean.substring(0, 2);
  const suffix = clean.substring(clean.length - 2);
  return `${prefix} •• •• •• ${suffix}`;
}

/**
 * Masque une adresse email pour la confidentialité (ex: marie.dupont@gmail.com -> m••••••@gmail.com)
 */
export function maskEmailAddress(email: string): string {
  if (!email || !email.includes('@')) return '••••••';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}•@${domain}`;
  const first = user[0];
  const last = user[user.length - 1];
  const maskedMiddle = '•'.repeat(Math.min(user.length - 2, 6));
  return `${first}${maskedMiddle}${last}@${domain}`;
}

/**
 * Masque une adresse physique pour la confidentialité
 */
export function maskAddress(address: string): string {
  if (!address) return '';
  const parts = address.split(',');
  if (parts.length > 1) {
    return `${parts[0].trim()}, •••••••`;
  }
  return `${address.substring(0, Math.min(4, address.length))}••••••`;
}
