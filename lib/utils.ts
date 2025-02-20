import { AvailableTheme, availableThemes, Theme } from './variables';

export let webcrypto: Crypto;

if (typeof window === 'undefined') {
  import('crypto').then((module) => {
    webcrypto = module.webcrypto;
  });
} else {
  webcrypto = window.crypto;
}

function isAvailableTheme(theme: Theme): theme is AvailableTheme {
  return availableThemes.includes(theme as AvailableTheme);
}

export function resolveTheme(theme: Theme): Theme {
  if (!theme) return 'preferred_color_scheme';
  if (isAvailableTheme(theme)) return theme;
  return 'custom';
}

export function getThemeUrl(resolvedTheme: Theme, theme: Theme): Theme {
  return resolvedTheme === 'custom' ? theme : `/themes/${resolvedTheme}.css`;
}

export function getOriginHost(origin: string) {
  try {
    const url = new URL(origin);
    url.searchParams.delete('giscus');
    return { origin: url.toString(), originHost: url.origin };
  } catch (err) {
    return { origin: '', originHost: '' };
  }
}

export function cleanAnchor(origin: string) {
  // Make sure the anchor is not followed by / as it means the website probably
  // is an SPA that uses anchor-based routing.
  let length = origin.length;
  const split = origin.split(/#(?!\/)/);
  if (split.length > 1) {
    length -= split.pop().length + 1;
  }
  return origin.substring(0, length);
}

export function cleanSessionParam(url: string) {
  try {
    const newUrl = new URL(url);
    newUrl.searchParams.delete('giscus');
    return newUrl.toString();
  } catch (err) {
    return url;
  }
}

export function isEmpty(v: unknown) {
  return v === null || v === undefined || v === '' || Number.isNaN(v);
}

export async function clipboardCopy(text: string) {
  await navigator.clipboard.writeText(text);
}

export function parseRepoWithOwner(repoWithOwner: string) {
  const [owner, name] = repoWithOwner.split('/');
  return { owner, name };
}

export function resizeTextArea(textarea: HTMLTextAreaElement) {
  const maxHeight = 270;
  textarea.style.height = `0px`;
  const height = textarea.scrollHeight <= maxHeight ? textarea.scrollHeight : maxHeight;
  textarea.style.height = `${height}px`;
}

export async function digestMessage(message: string, algorithm: AlgorithmIdentifier = 'SHA-1') {
  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await webcrypto.subtle.digest(algorithm, msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function hasStorageAccess() {
  // If strict tracking protection is enabled in the browser,
  // accessing localStorage may be forbidden.
  if (typeof document.hasStorageAccess === 'undefined') return true;
  if (await document.hasStorageAccess()) return true;
  try {
    await document.requestStorageAccess();
  } catch (err) {
    // The request can only be made under very specific conditions.
  }
  return await document.hasStorageAccess();
}

/* eslint-disable */
export function fixChineseSpace(str: string) {
  const isChinese = (str: string) => /[\u3400-\u9FBF]/.test(str);
  const isLatin = (str: string) => /[a-zA-Z0-9@/*&%#]/.test(str);
  return Array.from(str)
    .map(
      (char, i) =>
        (i > 0 && isChinese(str[i]) && isLatin(str[i - 1]) ? " " : "") +
        char +
        (i < str.length - 1 && isChinese(str[i]) && isLatin(str[i + 1]) ? " " : "")
    )
    .join("");
}

export function fixChineseSpaceForFunction<F extends (...args: any[]) => string>(f: F): F {
  return ((...args: Parameters<F>) => {
    const result = f.apply(null, args);
    return fixChineseSpace(result);
  }) as F;
}
