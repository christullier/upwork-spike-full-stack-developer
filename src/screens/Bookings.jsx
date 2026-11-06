import Icon from "../components/Icon.jsx";
import { Avatar, Badge, EmptyState, PageHeader } from "../components/ui.jsx";
import { money } from "../lib/format.js";

export default function Bookings({ state, studio }) {
  const bookings = state.bookings[studio.id];
  const pipeline = bookings.reduce((total, booking) => total + booking.value, 0);
  const agentBooked = bookings.filter((booking) => booking.source === "AI agent").length;

  return (
    <div className="screen">
      <PageHeader
        eyebrow={`${studio.plan} plan · ${studio.location}`}
        title="Bookings"
        subtitle="The end of the funnel. Visits that the agent books appear here with the source attached."
      />

      <section className="summary-grid">
        <article className="card summary-card">
          <span className="summary-icon summary-green">
            <Icon name="calendar" size={18} />
          </span>
          <div>
            <strong>{bookings.length}</strong>
            <span>Upcoming visits</span>
          </div>
        </article>
        <article className="card summary-card">
          <span className="summary-icon summary-lime">
            <Icon name="target" size={18} />
          </span>
          <div>
            <strong>{money(pipeline)}</strong>
            <span>Visit value</span>
          </div>
        </article>
        <article className="card summary-card">
          <span className="summary-icon summary-ink">
            <Icon name="sparkle" size={18} />
          </span>
          <div>
            <strong>{agentBooked}</strong>
            <span>Booked by AI agent</span>
          </div>
        </article>
      </section>

      {bookings.length ? (
        <section className="card bookings-card">
          <div className="card-head">
            <div>
              <h2>Upcoming visits</h2>
              <p>Next visits this week · demo week of Nov 9</p>
            </div>
            <Badge tone="success" dot>
              Confirmed
            </Badge>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Visit</th>
                  <th>Class</th>
                  <th>Source</th>
                  <th className="align-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td data-label="Member">
                      <div className="member-cell">
                        <Avatar name={booking.member} size="sm" />
                        <div>
                          <strong>{booking.member}</strong>
                          <span>Former member</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Visit">
                      <strong className="visit-time">{booking.when.split("·")[1]?.trim()}</strong>
                      <p className="cell-detail">{booking.when.split("·")[0]?.trim()}</p>
                    </td>
                    <td data-label="Class">{booking.className}</td>
                    <td data-label="Source">
                      <Badge tone={booking.source === "AI agent" ? "success" : "neutral"}>
                        {booking.source === "AI agent" ? (
                          <Icon name="sparkle" size={12} />
                        ) : (
                          <Icon name="users" size={12} />
                        )}
                        {booking.source}
                      </Badge>
                    </td>
                    <td data-label="Value" className="align-right value-cell">
                      {money(booking.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="booking-foot">
            <Icon name="sparkle" size={15} />
            <p>
              The Dana Whitfield visit was booked inside the conversation. The other rows are
              historical context for the demo.
            </p>
          </div>
        </section>
      ) : (
        <section className="card">
          <EmptyState
            icon="calendar"
            title="No bookings yet"
            text={`${studio.name} has no visits in the demo week. Send a campaign and let the agent work the replies.`}
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
