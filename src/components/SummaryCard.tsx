type SummaryCardProps = {
  label: string;
  value: string;
  tone?: "plain" | "safe" | "careful" | "recovery";
};

const toneClasses = {
  plain: "bg-[#f8fff4] text-stone-950 ring-1 ring-black/5",
  safe: "bg-[#171b18] text-[#d9f8d6]",
  careful: "bg-[#ffe7a8] text-stone-950",
  recovery: "bg-[#ffdad5] text-red-950",
};

export function SummaryCard({ label, value, tone = "plain" }: SummaryCardProps) {
  return (
    <section className={`rounded-lg p-4 shadow-[0_10px_30px_rgba(24,31,27,0.08)] ${toneClasses[tone]}`}>
      <p className="text-xs font-black uppercase tracking-normal opacity-70">{label}</p>
      <p className="mt-2 break-words text-2xl font-black tracking-normal">{value}</p>
    </section>
  );
}
