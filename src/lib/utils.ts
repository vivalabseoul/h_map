export function formatPrice(priceStr: string | null | undefined, region?: string): string {
  if (!priceStr) return '';
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return priceStr;

  if (region === 'korea') {
    return `₩${num.toLocaleString('ko-KR')}`;
  } else {
    return `$${num.toLocaleString('en-US')}`;
  }
}


