export default function SummaryCard({ title, value, subtitle, tone = '' }) {
  return (
    <div className={`card ${tone}`}>
      <div className="muted">{title}</div>
      <div className="big">{value}</div>
      {subtitle ? <div className="small">{subtitle}</div> : null}
    </div>
  );
}
