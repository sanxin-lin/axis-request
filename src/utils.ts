import { minimatch } from 'minimatch';

export const inBrowser = () => typeof window !== 'undefined';
export const isFunction = (v: unknown): v is (...args: any[]) => any => typeof v === 'function';

export const download = (url: string | Blob, filename: string) => {
  if (!inBrowser()) {
    return;
  }

  const a = document.createElement('a');
  a.download = filename;
  a.style.display = 'none';
  a.href = typeof url === 'string' ? url : URL.createObjectURL(url);
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
};

export function matchPattern(pattern: string, method: string, url: string) {
  return pattern.startsWith('method:')
    ? pattern.replace('method:', '').trim() === method
    : minimatch(url ?? '', pattern);
}

export function createMatcher(include?: string[], exclude?: string[]) {
  function matcher(method: string, url: string) {
    if (!include && !exclude) {
      return true;
    }

    const isExclude = (exclude ?? []).some(pattern => matchPattern(pattern, method, url));

    if (isExclude) {
      return false;
    }

    if (!include) {
      return true;
    }

    const isInclude = (include ?? []).some(pattern => matchPattern(pattern, method, url));

    return isInclude;
  }

  return matcher;
}
