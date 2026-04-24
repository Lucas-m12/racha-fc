interface SectionHeaderProps {
  title: string;
  sub?: string;
}

export function SectionHeader({ title, sub }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {sub && <span className="lbl-serif">{sub}</span>}
    </div>
  );
}
