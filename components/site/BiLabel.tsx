/*
 * BiLabel (§A5) — recurring bilingual micro-label: Latin line + Japanese line
 * (lang="ja", dimmer, wider tracking). Used in hero meta, footer, disciplines.
 */
export default function BiLabel({
  latin,
  ja,
  className = "",
}: {
  latin: string;
  ja: string;
  className?: string;
}) {
  return (
    <span className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[16px]/[1.4] font-normal whitespace-nowrap text-text-50">
        {latin}
      </span>
      <span
        lang="ja"
        className="font-ja text-[13px]/[1.4] font-normal tracking-[0.14em] whitespace-nowrap text-text-38"
      >
        {ja}
      </span>
    </span>
  );
}
