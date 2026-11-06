import Icon from "../components/Icon.jsx";
import { Badge, CardHeader, PageHeader } from "../components/ui.jsx";
import { checkLead } from "../lib/eligibility.js";
import { money } from "../lib/format.js";
import { DEMO_DATE_LABEL } from "../data/seed.js";

const activityIcon = {
  booking: "calendar",
  reply: "chat",
  sent: "send",
  import: "upload",
  eligible: "shield",
};

export default function Dashboard({ state, studio }) {
  const leads = state.leads[studio.id];
  const campaign = state.campaigns[studio.id];
  const conversations = state.conversations[studio.id];
  const bookings = state.bookings[studio.id];
  const activity = state.activity[studio.id];

  const eligible = leads.filter((row) => checkLead(row).eligible);
  const sent = campaign.sentTo.length;
  const replies = conversations.filter((thread) =>
    thread.messages.some((message) => message.from === "member"),
  ).length;
  const bookedFromCampaign = conversations.filter((thread) => thread.booking).length;
  const replyRate = sent ? Math.round((replies / sent) * 100) : null;
  const pipeline = bookings.reduce((total, booking) => total + booking.value, 0);
  const nextBooking = bookings[0] ?? null;

  const funnel = [
    { label: "Imported", value: leads.length, tone: "slate" },
    { label: "Eligible", value: eligible.length, tone: "green" },
    { label: "Contacted", value: sent, tone: "teal" },
    { label: "Replied", value: replies, tone: "lime" },
    { label: "Booked", value: bookedFromCampaign, tone: "ink" },
  ];
  const funnelMax = Math.max(...funnel.map((step) => step.value), 1);

  const kpis = [
    {
      label: "Imported leads",
      value: leads.length,
      icon: "users",
      note: "Former members in this workspace",
    },
    {
      label: "Eligible now",
      value: eligible.length,
      icon: "target",
      note: "Clear all four eligibility checks",
    },
    {
      label: "Messages sent",
      value: sent,
      icon: "send",
      note: sent ? "Win-back campaign delivered" : "Campaign still in draft",
    },
    {
      label: "Visits booked",
      value: bookings.length,
      icon: "calendar",
      note: `${money(pipeline)} in visit value`,
    },
  ];

  return (
    <div className="screen">
      <PageHeader
        eyebrow={`${studio.plan} plan · ${studio.location}`}
        title="Win-back overview"
        subtitle={`A live view of ${studio.name} on the fixed demo date, ${DEMO_DATE_LABEL}.`}
        actions={
          <>
            <a className="btn btn-secondary" href="#/leads">
              <Icon name="users" size={16} />
              Review leads
            </a>
            <a className="btn btn-primary" href="#/campaign">
              <Icon name="send" size={16} />
              View campaign
            </a>
          </>
        }
      />

      <section className="kpi-grid" aria-label="Key results">
        {kpis.map((kpi) => (
          <article className="card kpi-card" key={kpi.label}>
            <div className="kpi-top">
              <span className="kpi-label">{kpi.label}</span>
              <span className="kpi-icon">
                <Icon name={kpi.icon} size={17} />
              </span>
            </div>
            <strong className="kpi-value">{kpi.value}</strong>
            <p className="kpi-note">{kpi.note}</p>
          </article>
        ))}
      </section>

      <div className="dash-grid">
        <div className="stack">
          <section className="card">
            <CardHeader
              title="Win-back performance"
              hint="From imported lead to booked visit"
              action={<Badge tone="success" dot>Live</Badge>}
            />
            <div className="funnel">
              {funnel.map((step) => (
                <div className="funnel-row" key={step.label}>
                  <span className="funnel-label">{step.label}</span>
                  <div className="funnel-track">
                    <span
                      className={`funnel-bar funnel-${step.tone}`}
                      style={{ width: `${Math.max((step.value / funnelMax) * 100, step.value ? 6 : 0)}%` }}
                    />
                  </div>
                  <span className="funnel-value">{step.value}</span>
                </div>
              ))}
            </div>
            <div className="performance-note">
              <Icon name="sparkle" size={16} />
              <p>
                The AI agent converts replies into visits.{" "}
                {bookedFromCampaign
                  ? `${bookedFromCampaign} visit${bookedFromCampaign === 1 ? "" : "s"} booked from this campaign.`
                  : "No visit booked from this campaign yet."}
              </p>
            </div>
          </section>

          <section className="card">
            <CardHeader title="Recent activity" hint="Newest first" />
            <ul className="activity-list">
              {activity.map((item) => (
                <li key={item.id}>
                  <span className={`activity-icon activity-${item.kind}`}>
                    <Icon name={activityIcon[item.kind] ?? "bolt"} size={16} />
                  </span>
                  <div>
                    <p>{item.text}</p>
                    <span>{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="stack">
          <section className="card reply-card">
            <CardHeader title="Reply rate" hint="Member replies ÷ messages sent" />
            <div className="reply-body">
              <div
                className={`ring ${replyRate === null ? "ring-empty" : ""}`}
                style={{
                  background: `conic-gradient(var(--green) ${(replyRate ?? 0) * 3.6}deg, #edf1ee 0deg)`,
                }}
                role="img"
                aria-label={replyRate === null ? "No reply rate yet" : `${replyRate} percent reply rate`}
              >
                <div className="ring-inner">
                  <strong>{replyRate === null ? "—" : `${replyRate}%`}</strong>
                  <span>reply rate</span>
                </div>
              </div>
              <div className="reply-copy">
                <p>
                  {sent
                    ? `${replies} of ${sent} contacted members replied.`
                    : "Send the first campaign to start tracking replies."}
                </p>
                <span className="agent-chip">
                  <Icon name="sparkle" size={13} />
                  AI agent handles every reply
                </span>
              </div>
            </div>
          </section>

          <section className="card next-visit">
            <CardHeader
              title="Next booked visit"
              action={
                <a className="text-link" href="#/bookings">
                  All bookings
                </a>
              }
            />
            {nextBooking ? (
              <div className="visit-body">
                <span className="visit-date">
                  <strong>{nextBooking.when.split("·")[1]?.trim()}</strong>
                  <span>{nextBooking.when.split("·")[0]?.trim()}</span>
                </span>
                <div>
                  <h3>{nextBooking.member}</h3>
                  <p>{nextBooking.className}</p>
                  <Badge tone={nextBooking.source === "AI agent" ? "success" : "neutral"}>
                    {nextBooking.source === "AI agent" ? "Booked by AI agent" : "Booked at front desk"}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="muted-copy">No visits booked in this workspace yet.</p>
            )}
          </section>

          <section className="card campaign-snapshot">
            <CardHeader
              title="Campaign"
              action={
                <Badge tone={campaign.status === "draft" ? "neutral" : "success"} dot>
                  {campaign.status === "draft" ? "Draft" : "Active"}
                </Badge>
              }
            />
            <h3>{campaign.name}</h3>
            <p className="campaign-quote">“{campaign.template}”</p>
            <div className="mini-progress">
              <span style={{ width: `${eligible.length ? (sent / eligible.length) * 100 : 0}%` }} />
            </div>
            <p className="mini-progress-label">
              {sent} of {eligible.length} eligible leads contacted
            </p>
            <a className="btn btn-secondary btn-block" href="#/campaign">
              Open campaign
              <Icon name="arrow" size={15} />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
