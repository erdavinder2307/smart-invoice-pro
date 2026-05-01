const DEFAULT_CURRENCY = 'INR';

export function resolveLocale(languageCode) {
  if (!languageCode) return 'en-IN';
  if (languageCode.startsWith('hi')) return 'hi-IN';
  if (languageCode.startsWith('ta')) return 'ta-IN';
  if (languageCode.startsWith('pa')) return 'pa-IN';
  if (languageCode.startsWith('bn')) return 'bn-IN';
  return 'en-IN';
}

export function formatCurrency(amount, languageCode = 'en', currency = DEFAULT_CURRENCY) {
  const currencyConfig =
    currency && typeof currency === 'object'
      ? currency
      : { currency };

  const safeCurrency =
    typeof currencyConfig.currency === 'string' && currencyConfig.currency.trim()
      ? currencyConfig.currency
      : DEFAULT_CURRENCY;

  return new Intl.NumberFormat(resolveLocale(languageCode), {
    style: 'currency',
    currency: safeCurrency,
    minimumFractionDigits: Number.isFinite(currencyConfig.minimumFractionDigits)
      ? currencyConfig.minimumFractionDigits
      : 2,
    maximumFractionDigits: Number.isFinite(currencyConfig.maximumFractionDigits)
      ? currencyConfig.maximumFractionDigits
      : 2,
  }).format(Number(amount || 0));
}

export function formatDate(dateValue, languageCode = 'en') {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(resolveLocale(languageCode), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatNumber(value, languageCode = 'en', options = {}) {
  return new Intl.NumberFormat(resolveLocale(languageCode), options).format(Number(value || 0));
}
