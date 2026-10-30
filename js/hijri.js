/**
 * HIJRI & GREGORIAN DATE FORMATTER
 * Powered by native JavaScript Internationalization API (Intl.DateTimeFormat)
 * with the standard Islamic Umm al-Qura calendar ('islamic-umalqura').
 */

export function getHijriDate(date = new Date()) {
  try {
    const d = (date instanceof Date) ? date : new Date(date);
    
    // Primary: Islamic Umm al-Qura
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const parts = formatter.formatToParts(d);
    let day = '', month = '', year = '';
    
    for (const p of parts) {
      if (p.type === 'day') day = p.value;
      if (p.type === 'month') month = p.value;
      if (p.type === 'year') year = p.value;
    }
    
    return {
      day: parseInt(day, 10) || 1,
      month: month || 'Hijri',
      year: year ? `${year} AH` : 'AH',
      formatted: `${day} ${month} ${year} AH`
    };
  } catch (err) {
    // Fallback: standard islamic calendar
    try {
      const fallbackFormatter = new Intl.DateTimeFormat('en-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const str = fallbackFormatter.format(date);
      return {
        day: 1,
        month: 'Hijri',
        year: 'AH',
        formatted: `${str} AH`
      };
    } catch (e) {
      return { day: 1, month: 'Hijri', year: 'AH', formatted: 'Hijri Date' };
    }
  }
}

export function formatGregorian(date = new Date(), options = {}) {
  const d = (date instanceof Date) ? date : new Date(date);
  const defaultOpts = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  return new Intl.DateTimeFormat('en-US', { ...defaultOpts, ...options }).format(d);
}

export function formatDualDate(date = new Date()) {
  const greg = formatGregorian(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const hijri = getHijriDate(date);
  return {
    gregorian: greg,
    hijri: hijri.formatted
  };
}

