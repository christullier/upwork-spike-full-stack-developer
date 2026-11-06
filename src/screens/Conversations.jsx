import { Fragment, useState } from "react";
import Icon from "../components/Icon.jsx";
import { Avatar, Badge, EmptyState, PageHeader } from "../components/ui.jsx";
import { money } from "../lib/format.js";

const statusMeta = {
  booked: { tone: "success", label: "Booked" },
  awaiting: { tone: "neutral", label: "Awaiting reply" },
  active: { tone: "info", label: "Agent active" },
};

export default function Conversations({ state, studio }) {
  const conversations = state.conversations[studio.id];
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? null);
  const active = conversations.find((thread) => thread.id === activeId) ?? conversations[0];
  const bookedCount = conversations.filter((thread) => thread.booking).length;

  return (
    <div className="screen">
      <PageHeader
        eyebrow={`${studio.plan} plan · ${studio.location}`}
        title="Conversations"
        subtitle="Every reply moves to the AI agent with the full lead and campaign context."
        actions={
          conversations.length ? (
            <div className="head-metrics">
              <span>
                <strong>{conversations.length}</strong> threads
              </span>
              <span>
                <strong>{bookedCount}</strong> booked
              </span>
            </div>
          ) : null
        }
      />

      {conversations.length ? (
        <section className="inbox">
          <div className="inbox-list">
            <div className="inbox-list-head">
              <h2>Inbox</h2>
              <Badge tone="success" dot>
                Agent on
              </Badge>
            </div>
            {conversations.map((thread) => {
              const last = thread.messages[thread.messages.length - 1];
              const meta = statusMeta[thread.status] ?? statusMeta.awaiting;
              return (
                <button
                  key={thread.id}
                  type="button"
                  className={`inbox-item ${active?.id === thread.id ? "active" : ""}`}
                  onClick={() => setActiveId(thread.id)}
                >
                  <Avatar name={thread.name} size="md" />
                  <div className="inbox-item-body">
                    <div className="inbox-item-top">
                      <strong>{thread.name}</strong>
                      <span>{thread.updated}</span>
                    </div>
                    <p>
                      {last.from === "agent"
                        ? "AI agent: "
                        : last.from === "campaign"
                          ? "Campaign: "
                          : ""}
                      {last.text}
                    </p>
                    <Badge tone={meta.tone} dot={thread.status === "booked"}>
                      {meta.label}
                    </Badge>
                  </div>
                </button>
              );
            })}
            <div className="inbox-list-foot">
              <Icon name="sparkle" size={14} />
              Handoff keeps the full thread. No copy and paste.
            </div>
          </div>

          {active ? (
            <div className="thread">
              <div className="thread-head">
                <div className="thread-person">
                  <Avatar name={active.name} size="md" />
                  <div>
                    <h2>{active.name}</h2>
                    <span>{active.phone}</span>
                  </div>
                </div>
                <div className="thread-badges">
                  <Badge tone={active.messages.some((m) => m.from === "agent") ? "info" : "neutral"}>
                    <Icon name="sparkle" size={12} />
                    {active.messages.some((m) => m.from === "agent")
                      ? "AI agent active"
                      : "Agent standing by"}
                  </Badge>
                  {active.booking ? <Badge tone="success">Visit booked</Badge> : null}
                </div>
              </div>

              <div className="thread-body">
                {active.messages.map((message, index) => {
                  const firstAgent = active.messages.findIndex((item) => item.from === "agent");
                  return (
                    <Fragment key={`${active.id}-${index}`}>
                      {message.from === "agent" && index === firstAgent ? (
                        <div className="takeover">
                          <span className="takeover-line" />
                          <span className="takeover-pill">
                            <Icon name="sparkle" size={13} />
                            AI agent took over
                          </span>
                          <span className="takeover-line" />
                        </div>
                      ) : null}
                      <div className={`message message-${message.from}`}>
                        {message.from !== "member" ? (
                          <span className="message-tag">
                            {message.from === "campaign" ? "Campaign" : "AI agent"}
                          </span>
                        ) : (
                          <span className="message-tag message-tag-member">Member</span>
                        )}
                        <div className="bubble">{message.text}</div>
                        <span className="message-time">{message.time}</span>
                      </div>
                    </Fragment>
                  );
                })}

                {active.booking ? (
                  <div className="booking-card">
                    <span className="booking-icon">
                      <Icon name="calendar" size={18} />
                    </span>
                    <div>
                      <span>Visit booked</span>
                      <strong>{active.booking.className}</strong>
                      <p>{active.booking.when}</p>
                    </div>
                    <span className="booking-value">{money(active.booking.value)}</span>
                  </div>
                ) : (
                  <div className="awaiting-card">
                    <span className="typing" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <p>
                      Waiting for {active.name.split(" ")[0]} to reply. The AI agent takes over on
                      the first message.
                    </p>
                  </div>
                )}
              </div>

              <div className="thread-composer">
                <span className="composer-note">
                  <Icon name="sparkle" size={14} />
                  Replies are generated by the existing AI agent in production.
                </span>
                <a className="btn btn-secondary btn-small" href="#/bookings">
                  View bookings
                  <Icon name="arrow" size={14} />
                </a>
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="card">
          <EmptyState
            icon="chat"
            title="No conversations yet"
            text={`${studio.name} has no campaign replies. Send the win-back campaign to open the inbox.`}
            action={
              <a className="btn btn-primary" href="#/campaign">
                <Icon name="send" size={16} />
                Open campaign
              </a>
            }
          />
        </section>
      )}
    </div>
  );
}
