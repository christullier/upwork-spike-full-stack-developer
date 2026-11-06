import { useState } from "react";
import Icon from "../components/Icon.jsx";
import { Avatar, Badge, EmptyState, PageHeader } from "../components/ui.jsx";
import { checkLead, formatShortDate } from "../lib/eligibility.js";
import { delay } from "../lib/format.js";
import { ELIGIBILITY_RULES } from "../data/seed.js";

const filters = [
  { id: "all", label: "All" },
  { id: "eligible", label: "Eligible" },
  { id: "blocked", label: "Blocked" },
];

export default function Leads({ state, studio, onImport }) {
  const [filter, setFilter] = useState("all");
  const [importing, setImporting] = useState(false);

  const leads = state.leads[studio.id];
  const campaign = state.campaigns[studio.id];
  const imported = state.imported[studio.id];

  const rows = leads.map((lead) => ({
    ...lead,
    check: checkLead(lead),
    contacted: campaign.sentTo.includes(lead.id),
  }));
  const eligibleCount = rows.filter((row) => row.check.eligible).length;
  const blockedCount = rows.length - eligibleCount;
  const visible = rows.filter((row) => {
    if (filter === "eligible") return row.check.eligible;
    if (filter === "blocked") return !row.check.eligible;
    return true;
  });

  async function handleImport() {
    if (imported || importing) return;
    setImporting(true);
    await delay(650);
    onImport();
    setImporting(false);
  }

  return (
    <div className="screen">
      <PageHeader
        eyebrow={`${studio.plan} plan · ${studio.location}`}
        title="Leads"
        subtitle="Former members, screened by the same rule engine the campaign uses before every send."
        actions={
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleImport}
            disabled={imported || importing}
          >
            <Icon name={imported ? "check" : "upload"} size={16} />
            {importing ? "Checking eligibility…" : imported ? "4 leads imported" : "Import 4 leads"}
          </button>
        }
      />

      <section className="card rules-card">
        <div className="rules-copy">
          <span className="rules-icon">
            <Icon name="shield" size={18} />
          </span>
          <div>
            <h2>Eligibility engine</h2>
            <p>Each lead must pass all four checks. The reason for every block stays visible.</p>
          </div>
        </div>
        <div className="rule-chips">
          {ELIGIBILITY_RULES.map((rule) => (
            <span className="rule-chip" key={rule}>
              <Icon name="check" size={12} />
              {rule}
            </span>
          ))}
        </div>
      </section>

      <section className="card leads-card">
        <div className="table-toolbar">
          <div className="segmented" role="group" aria-label="Filter leads">
            {filters.map((item) => {
              const count =
                item.id === "all" ? rows.length : item.id === "eligible" ? eligibleCount : blockedCount;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={filter === item.id ? "active" : ""}
                  aria-pressed={filter === item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                  <span>{count}</span>
                </button>
              );
            })}
          </div>
          <p className="table-hint">
            <span className="status-dot status-dot-green" />
            {eligibleCount} clear to contact · {blockedCount} blocked
          </p>
        </div>

        {visible.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Phone</th>
                  <th>Last visit</th>
                  <th>Consent</th>
                  <th>Eligibility</th>
                  <th>Outreach</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td data-label="Member">
                      <div className="member-cell">
                        <Avatar name={row.name} size="sm" />
                        <div>
                          <strong>{row.name}</strong>
                          <span>Lead · {studio.initials}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Phone" className="mono">
                      {row.phone}
                    </td>
                    <td data-label="Last visit">{formatShortDate(row.lastVisit)}</td>
                    <td data-label="Consent">
                      <span
                        className={
                          row.consent === "yes"
                            ? "consent consent-yes"
                            : row.consent === "no"
                              ? "consent consent-no"
                              : "consent consent-missing"
                        }
                      >
                        {row.consent === "yes" ? "Opted in" : row.consent === "no" ? "Opted out" : "Missing"}
                      </span>
                    </td>
                    <td data-label="Eligibility">
                      <Badge tone={row.check.tone}>{row.check.reason}</Badge>
                      <p className="cell-detail">{row.check.detail}</p>
                    </td>
                    <td data-label="Outreach">
                      {row.contacted ? (
                        <Badge tone="success">
                          <Icon name="check" size={12} />
                          Campaign sent
                        </Badge>
                      ) : (
                        <span className="muted-copy">Not contacted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="search"
            title={`No ${filter} leads`}
            text="Change the filter to see the rest of this studio's leads."
          />
        )}
      </section>
    </div>
  );
}
