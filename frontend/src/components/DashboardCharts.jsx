const PALETTE = [
  "#2563eb",
  "#0f766e",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#475569",
];

export function StatusDonut({ title, description, items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;

  return (
    <section className="panel dashboard-chart-card">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="donut-chart-layout">
        <div className="donut-chart" aria-label={`${title}: ${total} tickets`}>
          <svg viewBox="0 0 42 42" role="img">
            <circle className="donut-track" cx="21" cy="21" r="15.9155" />
            {total > 0 &&
              items.map((item, index) => {
                const size = (item.value / total) * 100;
                const segment = (
                  <circle
                    key={item.label}
                    cx="21"
                    cy="21"
                    r="15.9155"
                    fill="transparent"
                    stroke={PALETTE[index % PALETTE.length]}
                    strokeDasharray={`${size} ${100 - size}`}
                    strokeDashoffset={-offset}
                    className="donut-segment"
                  />
                );
                offset += size;
                return segment;
              })}
          </svg>
          <div>
            <strong>{total}</strong>
            <span>tickets</span>
          </div>
        </div>
        <ul className="chart-legend">
          {items.map((item, index) => (
            <li key={item.label}>
              <i style={{ background: PALETTE[index % PALETTE.length] }} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function DistributionBars({ title, description, items }) {
  const largestValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <section className="panel dashboard-chart-card">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="dashboard-bars">
        {items.map((item, index) => (
          <div className="dashboard-bar-row" key={item.label}>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <i>
              <em
                style={{
                  width: `${(item.value / largestValue) * 100}%`,
                  background: PALETTE[index % PALETTE.length],
                }}
              />
            </i>
          </div>
        ))}
      </div>
    </section>
  );
}
