import { useEffect, useRef, useState } from "react";
import Icon from "../components/Icon.jsx";
import { Avatar, Badge, EmptyState, PageHeader } from "../components/ui.jsx";
import { checkLead } from "../lib/eligibility.js";
import { delay, renderTemplate } from "../lib/format.js";

export default function Campaign({ state, studio, onTemplateChange, onSend }) {
  const leads = state.leads[studio.id];
  const campaign = state.campaigns[studio.id];
  const [draft, setDraft] = useState(campaign.template);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({});
  const runRef = useRef(0);

  useEffect(() => {
    runRef.current += 1;
    setProgress({});
    setSending(false);
  }, [studio.id]);

  useEffect(() => {
    setDraft(campaign.template);
  }, [campaign.template]);

  useEffect(() => {
    return () => {
      runRef.current += 1;
    };
  }, []);

  const eligible = leads.filter((lead) => checkLead(lead).eligible);
  const ready = eligible.filter((lead) => !campaign.sentTo.includes(lead.id));
  const previewLead = ready[0] ?? eligible[0] ?? leads[0];
  const previewText = renderTemplate(draft, previewLead, studio);
  const segments = Math.max(1, Math.ceil(draft.length / 160));
  const delivered = eligible.filter(
    (lead) => campaign.sentTo.includes(lead.id) || progress[lead.id] === "sent",
  ).length;
  const sentPercent = eligible.length ? Math.round((delivered / eligible.length) * 100) : 0;

  const queue = [...eligible].sort(
    (a, b) =>
      Number(campaign.sentTo.includes(a.id)) - Number(campaign.sentTo.includes(b.id)),
  );

  function updateTemplate(value) {
    setDraft(value);
    onTemplateChange(value);
  }

  function addTag(tag) {
    const spacer = draft && !draft.endsWith(" ") ? " " : "";
    updateTemplate(`${draft}${spacer}${tag}`);
  }

  async function handleSend() {
    if (sending || !ready.length) return;
    const run = runRef.current + 1;
    runRef.current = run;
    setSending(true);
    const queued = Object.fromEntries(ready.map((lead) => [lead.id, "queued"]));
    setProgress(queued);
    for (const lead of ready) {
      if (run !== runRef.current) return;
      setProgress((current) => ({ ...current, [lead.id]: "sending" }));
      await delay(700);
      if (run !== runRef.current) return;
      setProgress((current) => ({ ...current, [lead.id]: "sent" }));
      await delay(180);
    }
    if (run !== runRef.current) return;
    onSend(ready.map((lead) => lead.id));
    setSending(false);
  }

  function leadState(lead) {
    if (progress[lead.id] === "sending") return { tone: "info", label: "Sending" };
    if (progress[lead.id] === "queued") return { tone: "neutral", label: "Queued" };
    if (progress[lead.id] === "sent" || campaign.sentTo.includes(lead.id))
      return { tone: "success", label: "Sent" };
    return { tone: "warn", label: "Ready" };
  }

  return (
    <div className="screen">
      <PageHeader
        eyebrow={`${studio.plan} plan · ${studio.location}`}
        title="Campaign"
        subtitle="Build the message, check the audience, then send inside the allowed window."
        actions={
          <Badge tone={campaign.status === "draft" ? "neutral" : "success"} dot>
            {campaign.status === "draft" ? "Draft" : "Active"}
          </Badge>
        }
      />

      <section className="audience-strip" aria-label="Campaign audience">
        <div className="audience-item">
          <span className="audience-icon audience-green">
            <Icon name="target" size={17} />
          </span>
          <div>
            <strong>{eligible.length}</strong>
            <span>Eligible audience</span>
          </div>
        </div>
        <div className="audience-item">
          <span className="audience-icon audience-slate">
            <Icon name="send" size={17} />
          </span>
          <div>
            <strong>{campaign.sentTo.length}</strong>
            <span>Already contacted</span>
          </div>
        </div>
        <div className="audience-item">
          <span className="audience-icon audience-lime">
            <Icon name="bolt" size={17} />
          </span>
          <div>
            <strong>{ready.length}</strong>
            <span>Ready to send</span>
          </div>
        </div>
      </section>

      <div className="campaign-grid">
        <div className="stack">
          <section className="card">
            <div className="campaign-title-row">
              <div>
                <p className="eyebrow">Win-back campaign</p>
                <h2>{campaign.name}</h2>
              </div>
              <Badge tone="neutral">
                <Icon name="clock" size={12} />
                {campaign.window}
              </Badge>
            </div>

            <label className="field-label" htmlFor="campaign-message">
              Message
              <span>
                {draft.length} characters · {segments} SMS segment{segments === 1 ? "" : "s"}
              </span>
            </label>
            <textarea
              id="campaign-message"
              className="message-editor"
              value={draft}
              rows={5}
              onChange={(event) => updateTemplate(event.target.value)}
              spellCheck="false"
            />
            <div className="merge-tags">
              <span>Merge tags</span>
              <button type="button" onClick={() => addTag("{{first_name}}")}>
                {"{{first_name}}"}
              </button>
              <button type="button" onClick={() => addTag("{{studio}}")}>
                {"{{studio}}"}
              </button>
            </div>

            <div className="guardrails">
              <div className="guardrail">
                <Icon name="shield" size={16} />
                <div>
                  <strong>Consent and STOP enforced</strong>
                  <span>Opted-out members are removed before the queue.</span>
                </div>
              </div>
              <div className="guardrail">
                <Icon name="clock" size={16} />
                <div>
                  <strong>Quiet hours</strong>
                  <span>Only sends between {campaign.window} local time.</span>
                </div>
              </div>
              <div className="guardrail">
                <Icon name="send" size={16} />
                <div>
                  <strong>{campaign.dailyLimit} messages per day</strong>
                  <span>Per-studio limit protects the sender reputation.</span>
                </div>
              </div>
            </div>
          </section>

          <section className="card send-card">
            <div className="card-head">
              <div>
                <h2>Send queue</h2>
                <p>Simulated locally. No message leaves this browser.</p>
              </div>
              <Badge tone="success">
                {delivered}/{eligible.length} sent
              </Badge>
            </div>

            <div className="queue-progress" aria-hidden="true">
              <span style={{ width: `${sentPercent}%` }} />
            </div>

            {queue.length ? (
              <>
                <ul className="queue-list">
                  {queue.map((lead) => {
                    const status = leadState(lead);
                    return (
                      <li key={lead.id}>
                        <Avatar name={lead.name} size="sm" />
                        <div className="queue-name">
                          <strong>{lead.name}</strong>
                          <span>{lead.phone}</span>
                        </div>
                        <Badge tone={status.tone} dot={status.label === "Sending"}>
                          {status.label}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
                <button
                  className="btn btn-primary btn-block"
                  type="button"
                  onClick={handleSend}
                  disabled={!ready.length || sending}
                >
                  <Icon name={sending ? "clock" : ready.length ? "send" : "check"} size={16} />
                  {sending
                    ? "Sending…"
                    : ready.length
                      ? `Send to ${ready.length} lead${ready.length === 1 ? "" : "s"}`
                      : "All eligible leads contacted"}
                </button>
                <p className="send-footnote">
                  The API call, Twilio delivery and AI handoff are mocked for this demo. The state
                  change, tenant scope and eligibility check are real.
                </p>
              </>
            ) : (
              <EmptyState
                icon="target"
                title="No eligible leads in this studio"
                text="Import a batch of former members or change the campaign rules to build an audience."
                action={
                  <a className="btn btn-secondary" href="#/leads">
                    Go to leads
                  </a>
                }
              />
            )}
          </section>
        </div>

        <div className="stack">
          <section className="card phone-card">
            <div className="card-head">
              <div>
                <h2>Live preview</h2>
                <p>
                  For {previewLead ? previewLead.name.split(" ")[0] : "the first lead"} at{" "}
                  {studio.name}
                </p>
              </div>
              <Badge tone="neutral">SMS</Badge>
            </div>

            <div className="phone" aria-label="SMS message preview">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-status">
                  <span>9:41</span>
                  <span className="phone-signal">
                    <i />
                    <i />
                    <i />
                    <b />
                  </span>
                </div>
                <div className="phone-contact">
                  <Avatar name={studio.name} size="sm" tone="ink" />
                  <div>
                    <strong>{studio.name}</strong>
                    <span>SMS · Campaign</span>
                  </div>
                </div>
                <div className="phone-thread">
                  <span className="phone-day">Today</span>
                  <div className="phone-bubble">{previewText || "Write a message to see the preview."}</div>
                  <span className="phone-delivery">Delivered · {segments} segment{segments === 1 ? "" : "s"}</span>
                  <div className="phone-quick">
                    <span>YES</span>
                    <span>Not now</span>
                  </div>
                </div>
                <div className="phone-input">
                  <span>Text message</span>
                  <b>↑</b>
                </div>
              </div>
            </div>
            <p className="preview-note">
              <Icon name="lock" size={13} />
              Merge tags render per lead. First name and studio stay in sync.
            </p>
          </section>

          <section className="card">
            <div className="card-head">
              <div>
                <h2>Audience rules</h2>
                <p>The campaign uses the same checks as the Leads screen.</p>
              </div>
            </div>
            <ul className="rule-list">
              <li>
                <Icon name="check" size={14} />
                Consent on file
              </li>
              <li>
                <Icon name="check" size={14} />
                Last visit 90+ days ago
              </li>
              <li>
                <Icon name="check" size={14} />
                No contact in 30 days
              </li>
              <li>
                <Icon name="check" size={14} />
                No visit already booked
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
