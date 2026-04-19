export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {subtitle ? <div className="small">{subtitle}</div> : null}
    </div>
  );
}
