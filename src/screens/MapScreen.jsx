import Icon from "../components/Icon.jsx";
import { Badge, PageHeader } from "../components/ui.jsx";

const pillars = [
  {
    tag: "tenant_id",
    title: "Tenants from day one",
    text: "Every lead, campaign, conversation and booking carries a studio ID. The switcher scopes every query, so the two studios share zero rows. Production adds Postgres row-level security behind the same scope.",
  },
  {
    tag: "checkLead()",
    title: "Eligibility is code, not a checklist",
    text: "One function runs on import and again before every send. It returns a pass or a named reason: too recent, opted out, no consent, already booked. Thresholds live in one file, so your team can change them without a migration.",
  },
  {
    tag: "handoff",
    title: "The agent gets the full thread",
    text: "The first inbound reply switches the conversation to the AI agent with the lead, campaign and booking context attached. The agent you already run stays in place; the platform supplies the handoff and the visit booking.",
  },
  {
    tag: "queue",
    title: "Guardrails sit before the API",
    text: "Consent, the STOP list, quiet hours and the daily cap are checked in the queue, not in the prompt. A blocked lead never reaches Twilio, and the reason stays visible to studio staff.",
  },
  {
    tag: "n8n + webhooks",
    title: "A clear production path",
    text: "n8n handles CRM import and scheduled sends, Postgres stores tenant data, Twilio webhooks feed replies back into the inbox, and the UI stays on Cloudflare Pages. Each part can ship and scale on its own.",
  },
];

const qaChecks = [
  "Rule tests at the edges: 89/90/91 days, 29/30/31 days, plus consent, opt-out and booking states.",
  "Tenant fixtures: the same suite runs for both studios and fails if any row crosses a studio ID.",
  "End-to-end path: import → eligibility → send → reply → handoff → booking, run on every deploy.",
];

export default function MapScreen() {
  return (
    <div className="screen">
      <PageHeader
        eyebrow="Under the hood"
        title="How this maps to your platform"
        subtitle="The demo is small on purpose. These five parts are the ones that carry into production."
        actions={
          <a className="btn btn-secondary" href="#/leads">
            Back to the rules
            <Icon name="arrow" size={15} />
          </a>
        }
      />

      <div className="map-grid">
        <section className="card pillars-card">
          <div className="card-head">
            <div>
              <h2>The platform layer</h2>
              <p>Built around the agent you already have.</p>
            </div>
            <Badge tone="success" dot>
              Working demo
            </Badge>
          </div>
          <ol className="pillar-list">
            {pillars.map((pillar, index) => (
              <li key={pillar.title}>
                <span className="pillar-number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <div className="pillar-title">
                    <h3>{pillar.title}</h3>
                    <code>{pillar.tag}</code>
                  </div>
                  <p>{pillar.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="stack">
          <section className="qa-card">
            <div className="qa-head">
              <span className="qa-icon">
                <Icon name="shield" size={19} />
              </span>
              <div>
                <p className="eyebrow">QA approach</p>
                <h2>Test the rules, not just the screens</h2>
              </div>
            </div>
            <ul>
              {qaChecks.map((check) => (
                <li key={check}>
                  <Icon name="check" size={14} />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
            <p className="qa-note">
              This static demo uses a fixed date of Nov 6, 2026, so every result is repeatable. The
              rule engine, tenant scope and state transitions are real code.
            </p>
          </section>

          <section className="card split-card">
            <div className="card-head">
              <div>
                <h2>Real vs simulated</h2>
                <p>No keys, no server, no hidden costs.</p>
              </div>
            </div>
            <div className="split-rows">
              <div>
                <Badge tone="success">Real</Badge>
                <ul>
                  <li>Eligibility engine</li>
                  <li>Tenant scoping</li>
                  <li>Campaign queue state</li>
                  <li>Conversation handoff</li>
                </ul>
              </div>
              <div>
                <Badge tone="neutral">Mocked</Badge>
                <ul>
                  <li>SMS delivery</li>
                  <li>AI generated replies</li>
                  <li>Auth and billing</li>
                  <li>Database and webhooks</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
