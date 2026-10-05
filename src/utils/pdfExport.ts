import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VoiceCandidate } from '../types';

const VOCAL_LABELS: Record<string, string> = {
  soprano: 'Soprano',
  alto: 'Alto',
  tenor: 'Ténor',
  mezzo: 'Mezzo-soprano',
  baryton: 'Baryton',
  basse: 'Basse',
  voix_off_femme: 'Voix-off (F)',
  voix_off_homme: 'Voix-off (H)',
  autre: 'Autre',
};

const LEVEL_LABELS: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  confirme: 'Confirmé',
  professionnel: 'Professionnel',
};

const extractPhone = (c: any): string => {
  const raw = c.phone ?? c.phoneNumber ?? c.telephone ?? c.contact ?? c.tel ?? '';
  const num = String(raw).trim();
  if (!num || num === 'undefined' || num === 'null') return '-';
  const code = String(c.phoneCountryCode ?? c.countryCode ?? '').trim();
  if (code && !num.startsWith('+')) {
    return `${code} ${num}`;
  }
  return num;
};

export const exportCandidatesToPDF = (
  candidates: VoiceCandidate[],
  options?: { maskSensitive?: boolean }
): void => {
  // Create PDF in Landscape orientation for comprehensive data display
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [244, 76, 0]; // #f44c00
  const darkSlate: [number, number, number] = [30, 41, 59]; // #1e293b
  const maskSensitive = options?.maskSensitive ?? false;

  // Header Background bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 297, 16, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(
    'Chantre Josias Folly & Les Adorateurs du Tabernacle',
    14,
    10.5
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Session d’audition — Soirée des Restaurés 2026', 297 - 14, 10.5, {
    align: 'right',
  });

  // Main Document Title
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LISTE OFFICIELLE DES INSCRITS AU CASTING', 14, 26);

  // Subtitle / Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const now = new Date();
  const dateFormatted = `${now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })} à ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

  doc.text(
    `Document généré le ${dateFormatted}  •  Total des inscriptions : ${candidates.length}`,
    14,
    32
  );

  // Stats Breakdown Pill Summary
  const countSoprano = candidates.filter((c) => c.vocalRange === 'soprano').length;
  const countAlto = candidates.filter((c) => c.vocalRange === 'alto').length;
  const countTenor = candidates.filter((c) => c.vocalRange === 'tenor').length;
  const countOther = candidates.length - (countSoprano + countAlto + countTenor);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 35, 269, 10, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 35, 269, 10, 2, 2, 'D');

  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Répartition vocale :   Soprano (${countSoprano})   |   Alto (${countAlto})   |   Ténor (${countTenor})   |   Autres pupitres (${countOther})`,
    18,
    41.5
  );

  // Table Data Preparation
  const tableData = candidates.map((c, index) => {
    const fullName = `${(c.lastName || '').toUpperCase()} ${c.firstName || ''}`.trim() || '-';
    const contact = maskSensitive ? '••••••••' : extractPhone(c);
    const church = c.churchCommunity || '-';
    const city = c.cityAddress || '-';
    const vocalRange = VOCAL_LABELS[c.vocalRange] || c.vocalRange || '-';
    const ageGender = `${c.age ? `${c.age} ans` : '-'} / ${
      c.gender === 'femme' ? 'F' : c.gender === 'homme' ? 'H' : '-'
    }`;
    const levelKey = String(c.experienceLevel || '').toLowerCase();
    const level = LEVEL_LABELS[levelKey] || (c.experienceLevel ? String(c.experienceLevel) : '-');

    return [
      String(index + 1),
      c.registrationNumber || '-',
      fullName,
      ageGender,
      contact,
      city,
      vocalRange,
      church,
      level,
      '', // Espace réservé pour la signature manuelle
    ];
  });

  // Generate table
  autoTable(doc, {
    startY: 48,
    head: [[
      'N°',
      'Dossier',
      'Nom & Prénoms',
      'Âge/Sexe',
      'Téléphone',
      'Commune / Ville',
      'Tessiture',
      'Église d’attache',
      'Niveau',
      'Signature',
    ]],
    body: tableData,
    theme: 'striped',
    styles: {
      fontSize: 8.5,
      cellPadding: 4,
      minCellHeight: 18, // Grand écart entre les lignes (18 mm de hauteur par ligne)
      valign: 'middle',
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [244, 76, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
      fontSize: 8.5,
      cellPadding: 3,
      minCellHeight: 10,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' }, // Case numérotation (N°) élargie à 14 mm
      1: { cellWidth: 22, fontStyle: 'bold' },
      2: { cellWidth: 35, fontStyle: 'bold' },
      3: { cellWidth: 15 },
      4: { cellWidth: 32, fontStyle: 'bold', textColor: [15, 23, 42] }, // Téléphone bien visible
      5: { cellWidth: 25 },
      6: { cellWidth: 22, fontStyle: 'bold' },
      7: { cellWidth: 30 },
      8: { cellWidth: 30 }, // Case niveau préservée et confortable
      9: { cellWidth: 44, halign: 'center' }, // Case signature très aérée
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252],
    },
    didDrawPage: (data) => {
      // Footer on every page
      const pageCount = doc.getNumberOfPages();
      const currentPage = data.pageNumber;
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Document confidentiel - Équipe de direction artistique & Jury de sélection Josias Folly',
        14,
        205
      );
      doc.text(
        `Page ${currentPage} sur ${pageCount}`,
        297 - 14,
        205,
        { align: 'right' }
      );
    },
  });

  // Save the generated PDF
  const filename = `Casting_Josias_Folly_Liste_Inscrits_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
