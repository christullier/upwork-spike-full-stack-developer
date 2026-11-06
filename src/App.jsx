import { useEffect, useState } from "react";
import Icon from "./components/Icon.jsx";
import Dashboard from "./screens/Dashboard.jsx";
import Leads from "./screens/Leads.jsx";
import Campaign from "./screens/Campaign.jsx";
import Conversations from "./screens/Conversations.jsx";
import Bookings from "./screens/Bookings.jsx";
import MapScreen from "./screens/MapScreen.jsx";
import { STUDIOS } from "./data/seed.js";
import { buildImportLeads, createInitialState, loadState, saveState } from "./lib/store.js";
import { renderTemplate } from "./lib/format.js";

const NAV = [
  { path: "dashboard", label: "Dashboard", icon: "grid" },
  { path: "leads", label: "Leads", icon: "users" },
  { path: "campaign", label: "Campaign", icon: "send" },
  { path: "conversations", label: "Conversations", icon: "chat" },
  { path: "bookings", label: "Bookings", icon: "calendar" },
  { path: "map", label: "How it maps", icon: "layers" },
];

const ROUTES = NAV.map((item) => item.path);

function routeFromHash() {
  const raw = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  return ROUTES.includes(raw) ? raw : "dashboard";
}

function firstNameList(names) {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [route, setRoute] = useState(routeFromHash);
  const [toast, setToast] = useState(null);
  const [epoch, setEpoch] = useState(0);

  const studio = STUDIOS.find((item) => item.id === state.studioId) ?? STUDIOS[0];

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/dashboard");
    }
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const label = NAV.find((item) => item.path === route)?.label ?? "Dashboard";
    document.title = `Reconnect — ${label}`;
  }, [route]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  function notify(message) {
    setToast({ id: Date.now(), message });
  }

  function switchStudio(id) {
    setState((current) => ({ ...current, studioId: id }));
  }

  function importLeads(studioId) {
    let added = 0;
    setState((current) => {
      if (current.imported[studioId]) return current;
      const batch = buildImportLeads(studioId);
      added = batch.length;
      const activity = {
        id: `act-import-${Date.now()}`,
        kind: "import",
        text: `${batch.length} leads imported from the studio CRM`,
        time: "Just now",
      };
      return {
        ...current,
        leads: {
          ...current.leads,
          [studioId]: [...current.leads[studioId], ...batch],
        },
        imported: { ...current.imported, [studioId]: true },
        activity: {
          ...current.activity,
          [studioId]: [activity, ...current.activity[studioId]],
        },
      };
    });
    if (added) notify(`${added} leads imported. Eligibility checked on every row.`);
  }

  function sendCampaign(studioId, ids) {
    if (!ids.length) return;
    const studioRecord = STUDIOS.find((item) => item.id === studioId);
    setState((current) => {
      const campaign = current.campaigns[studioId];
      const leads = current.leads[studioId];
      const existingLeadIds = new Set(
        current.conversations[studioId].map((thread) => thread.leadId),
      );
      const sentTo = Array.from(new Set([...campaign.sentTo, ...ids]));
      const newThreads = ids
        .filter((id) => !existingLeadIds.has(id))
        .map((id) => {
          const lead = leads.find((row) => row.id === id);
          if (!lead) return null;
          return {
            id: `conv-${studioId}-${id}`,
            leadId: lead.id,
            name: lead.name,
            phone: lead.phone,
            status: "awaiting",
            updated: "Just now",
            messages: [
              {
                from: "campaign",
                text: renderTemplate(campaign.template, lead, studioRecord),
                time: "Just now",
              },
            ],
            booking: null,
          };
        })
        .filter(Boolean);

      const names = ids
        .map((id) => leads.find((row) => row.id === id)?.name)
        .filter(Boolean)
        .map((name) => name.split(" ")[0]);
      const activity = {
        id: `act-send-${Date.now()}`,
        kind: "sent",
        text: `Campaign sent to ${firstNameList(names)}`,
        time: "Just now",
      };

      return {
        ...current,
        campaigns: {
          ...current.campaigns,
          [studioId]: { ...campaign, sentTo, status: "active" },
        },
        conversations: {
          ...current.conversations,
          [studioId]: [...newThreads, ...current.conversations[studioId]],
        },
        activity: {
          ...current.activity,
          [studioId]: [activity, ...current.activity[studioId]],
        },
      };
    });
    notify(`Campaign sent to ${ids.length} lead${ids.length === 1 ? "" : "s"}.`);
  }

  function updateTemplate(studioId, template) {
    setState((current) => ({
      ...current,
      campaigns: {
        ...current.campaigns,
        [studioId]: { ...current.campaigns[studioId], template },
      },
    }));
  }

  function resetDemo() {
    setState(createInitialState());
    setEpoch((value) => value + 1);
    notify("Demo reset to the seeded state.");
  }

  let screen = null;
  if (route === "dashboard") {
    screen = <Dashboard state={state} studio={studio} />;
  } else if (route === "leads") {
    screen = (
      <Leads
        key={`leads-${studio.id}-${epoch}`}
        state={state}
        studio={studio}
        onImport={() => importLeads(studio.id)}
      />
    );
  } else if (route === "campaign") {
    screen = (
      <Campaign
        key={`campaign-${studio.id}-${epoch}`}
        state={state}
        studio={studio}
        onTemplateChange={(template) => updateTemplate(studio.id, template)}
        onSend={(ids) => sendCampaign(studio.id, ids)}
      />
    );
  } else if (route === "conversations") {
    screen = (
      <Conversations
        key={`conversations-${studio.id}-${epoch}`}
        state={state}
        studio={studio}
      />
    );
  } else if (route === "bookings") {
    screen = <Bookings state={state} studio={studio} />;
  } else {
    screen = <MapScreen />;
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#/dashboard" aria-label="Reconnect dashboard">
            <span className="brand-mark">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 12h4l2.5-6 4 12 2.5-6h5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="brand-copy">
              <strong>Reconnect</strong>
              <span>Studio win-back OS</span>
            </span>
          </a>

          <nav className="nav" aria-label="Main">
            {NAV.map((item) => (
              <a
                key={item.path}
                href={`#/${item.path}`}
                className={route === item.path ? "active" : ""}
                aria-current={route === item.path ? "page" : undefined}
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="topbar-right">
            <label className="studio-switch">
              <span className="studio-avatar">{studio.initials}</span>
              <span className="studio-select">
                <span>Studio</span>
                <select
                  value={studio.id}
                  onChange={(event) => switchStudio(event.target.value)}
                  aria-label="Switch studio"
                >
                  {STUDIOS.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </span>
              <Icon name="chevron" size={14} className="studio-chevron" />
            </label>
            <span className="demo-badge">
              <span className="pulse" aria-hidden="true" />
              Demo data
            </span>
            <button
              className="icon-button"
              type="button"
              onClick={resetDemo}
              title="Reset demo data"
              aria-label="Reset demo data"
            >
              <Icon name="reset" size={16} />
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="main">
        {screen}
      </main>

      <footer className="footer">
        <span>Reconnect · static demo, no login, no API keys</span>
        <span className="footer-dot" aria-hidden="true" />
        <span>Data stays in this browser. Reset from the header.</span>
      </footer>

      {toast ? (
        <div className="toast" role="status">
          <span className="toast-icon">
            <Icon name="check" size={14} />
          </span>
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
