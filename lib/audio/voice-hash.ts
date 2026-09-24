/**
 * معرّف صوتي ثابت للنص — خطوتي
 * ------------------------------------------------------------------
 * يُستخدم لتسمية الملفات الصوتية المسجّلة: نفس النص = نفس المعرّف دائماً،
 * في الملف المولَّد وفي المتصفح. بلا مكتبات، وبلا تشفير (FNV-1a 32bit).
 */
export function voiceId(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** مسار الملف المتوقّع لجملة مسجّلة */
export function voiceFilePath(text: string): string {
  return `/audio/voice/${voiceId(text)}.mp3`;
}
