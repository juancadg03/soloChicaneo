const STORAGE_KEY = "solo_chicaneo_solicitudes";

const safeParse = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getSolicitudes = () => {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
};

export const saveSolicitudes = (solicitudes) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));
};

export const addSolicitud = (payload) => {
  const next = [
    {
      id: crypto.randomUUID(),
      estado: "pendiente",
      creadaEn: new Date().toISOString(),
      ...payload,
    },
    ...getSolicitudes(),
  ];
  saveSolicitudes(next);
  return next[0];
};
