/**
 * Utility to generate direct WhatsApp inbox links for candidates and contacts
 */
export function getWhatsAppUrl(
  countryCode: string = '+229',
  phoneNumber: string = '',
  message: string = ''
): string {
  // Extract digits from country code (e.g. +229 -> 229)
  const cleanCode = countryCode.replace(/\D/g, '') || '229';
  
  // Extract digits from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  if (!cleanPhone) {
    return '#';
  }

  const fullNumber = `${cleanCode}${cleanPhone}`;
  const encodedMsg = message ? `?text=${encodeURIComponent(message)}` : '';

  return `https://wa.me/${fullNumber}${encodedMsg}`;
}
