import { DEMO_TODAY } from "../data/seed.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysSince(isoDate, todayISO = DEMO_TODAY) {
  if (!isoDate) return null;
  const [y, m, d] = isoDate.split("-").map(Number);
  const [ty, tm, td] = todayISO.split("-").map(Number);
  const then = Date.UTC(y, m - 1, d);
  const today = Date.UTC(ty, tm - 1, td);
  return Math.floor((today - then) / DAY_MS);
}

export function checkLead(lead, todayISO = DEMO_TODAY) {
  if (lead.consent === "no") {
    return {
      eligible: false,
      reason: "Opted out",
      detail: "Opt-out on file. This lead is excluded from every campaign.",
      tone: "muted",
    };
  }

  if (lead.consent !== "yes") {
    return {
      eligible: false,
      reason: "No consent",
      detail: "No written SMS consent on file. The lead cannot be contacted.",
      tone: "danger",
    };
  }

  if (lead.booking) {
    const daysUntil = -(daysSince(lead.booking, todayISO) ?? 0);
    if (daysUntil >= 0) {
      return {
        eligible: false,
        reason: "Already booked",
        detail: `A visit is booked for ${formatShortDate(lead.booking)}. The agent pauses outreach.`,
        tone: "info",
      };
    }
  }

  const visitDays = daysSince(lead.lastVisit, todayISO) ?? 0;
  if (visitDays < 90) {
    return {
      eligible: false,
      reason: "Too recent",
      detail: `Last visit ${visitDays} days ago. The 90-day window is not closed.`,
      tone: "warn",
    };
  }

  const contactDays = daysSince(lead.lastContact, todayISO);
  if (contactDays !== null && contactDays < 30) {
    return {
      eligible: false,
      reason: "Contacted recently",
      detail: `Last contact ${contactDays} days ago. The 30-day quiet period is active.`,
      tone: "warn",
    };
  }

  return {
    eligible: true,
    reason: "Eligible",
    detail: `Last visit ${visitDays} days ago. All four checks pass.`,
    tone: "success",
  };
}

export function formatShortDate(isoDate) {
  if (!isoDate) return "—";
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
