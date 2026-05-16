export interface UrlState {
  day: number | null;
  placeId: string | null;
}

export function parseUrlState(params: URLSearchParams): UrlState {
  const dayRaw = params.get("day");
  const day = dayRaw ? Number(dayRaw) : null;
  const placeId = params.get("placeId");
  return {
    day: day && day >= 1 && day <= 7 ? day : null,
    placeId: placeId || null,
  };
}

export function serializeUrlState(state: Partial<UrlState>): string {
  const params = new URLSearchParams();
  if (state.day != null) params.set("day", String(state.day));
  if (state.placeId) params.set("placeId", state.placeId);
  const q = params.toString();
  return q ? `?${q}` : "";
}
