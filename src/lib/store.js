import {
  IMPORT_BATCH,
  STUDIOS,
  seedActivity,
  seedBookings,
  seedCampaigns,
  seedConversations,
  seedLeads,
} from "../data/seed.js";

export const STORAGE_KEY = "reconnect-demo-v1";

const clone = (value) => JSON.parse(JSON.stringify(value));

export function createInitialState() {
  return {
    studioId: "gcs",
    leads: clone(seedLeads),
    campaigns: clone(seedCampaigns),
    conversations: clone(seedConversations),
    bookings: clone(seedBookings),
    activity: clone(seedActivity),
    imported: { gcs: false, bay: false },
  };
}

export function loadState() {
  const fallback = createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const data = parsed?.state;
    if (!data || !data.leads || !data.campaigns || !data.conversations) {
      return fallback;
    }
    const studioId = STUDIOS.some((studio) => studio.id === data.studioId)
      ? data.studioId
      : "gcs";
    return {
      ...fallback,
      ...data,
      studioId,
      imported: { ...fallback.imported, ...(data.imported ?? {}) },
    };
  } catch {
    return fallback;
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state }));
  } catch {
    // The demo still works when storage is blocked.
  }
}

export function buildImportLeads(studioId) {
  const areaCode = studioId === "bay" ? "(850)" : "(251)";
  return IMPORT_BATCH.map((row, index) => ({
    ...row,
    id: `${studioId}-import-${index + 1}`,
    phone: row.phone.replace("(251)", areaCode),
  }));
}
