import type { FinanceStatus } from "@/types/finance";

const statusClasses: Record<FinanceStatus, string> = {
  Safe: "bg-[#d9f8d6] text-emerald-950 ring-emerald-900/10",
  Careful: "bg-[#ffe7a8] text-amber-950 ring-amber-900/10",
  "Recovery Mode": "bg-[#ffdad5] text-red-950 ring-red-900/10",
};

export function StatusBadge({ status }: { status: FinanceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-black ring-1 ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}
