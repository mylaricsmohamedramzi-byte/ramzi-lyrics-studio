// Merges the static baseline content arrays with any admin-added items stored
// in `mock_{section}` (LocalStorage fallback when the Cloud table is empty).
// Admin items use a different shape, so we normalize them to the page shape.

function normalize(section: string, raw: any) {
  const title = raw.title ?? raw.title_ar ?? raw.title_en ?? '';
  const type = raw.type ?? raw.category ?? '';
  const lyrics = Array.isArray(raw.lyrics) ? raw.lyrics : [];
  const base = {
    ...raw,
    id: raw.id ?? Date.now(),
    title,
    type,
    views: raw.views ?? '0',
    lyrics,
  };
  if (section === 'videos') {
    return { ...base, videoUrls: raw.videoUrls ?? (raw.video_url ? [raw.video_url] : []), critics: raw.critics ?? [] };
  }
  return { ...base, audioUrls: raw.audioUrls ?? (raw.audio_url ? [raw.audio_url] : []) };
}

export function mergeMockItems<T = any>(section: string, base: T[]): T[] {
  try {
    const stored = JSON.parse(localStorage.getItem(`mock_${section}`) || '[]');
    if (!Array.isArray(stored) || stored.length === 0) return base;
    const baseIds = new Set(base.map((b: any) => String(b.id)));
    const extras = stored
      .filter((s: any) => !baseIds.has(String(s.id)))
      .map((s: any) => normalize(section, s));
    return [...base, ...extras] as T[];
  } catch {
    return base;
  }
}
