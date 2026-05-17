import type { Reserve } from "@/types/finance";
import { getReserveOriginalAmount, getReserveUsedPercent } from "@/utils/financeInsights";
import { formatMoney } from "@/utils/formatMoney";

type ReserveCardProps = {
  reserve: Reserve;
  currency: string;
  onChange: (reserve: Reserve) => void;
  onDelete: () => void;
  errors?: { name?: string; amount?: string };
};

export function ReserveCard({
  reserve,
  currency,
  onChange,
  onDelete,
  errors,
}: ReserveCardProps) {
  return (
    <article
      className={`rounded-lg border bg-white p-4 shadow-sm ${
        reserve.enabled ? "border-stone-200" : "border-stone-100 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-3">
          <input
            checked={reserve.enabled}
            className="h-5 w-5 accent-emerald-700"
            onChange={(event) => onChange({ ...reserve, enabled: event.target.checked })}
            type="checkbox"
          />
          <span className="text-sm font-semibold text-stone-600">
            {reserve.enabled ? "Protected" : "Paused"}
          </span>
        </label>
        <button
          className="rounded-lg px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
          onClick={onDelete}
          type="button"
        >
          Delete
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        <label>
          <span className="text-sm font-medium text-stone-700">Name</span>
          <input
            className="mt-2 h-11 w-full rounded-lg border border-stone-200 px-3 text-base font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            onChange={(event) => onChange({ ...reserve, name: event.target.value })}
            value={reserve.name}
          />
          {errors?.name ? <p className="mt-1 text-sm text-red-600">{errors.name}</p> : null}
        </label>

        <label>
          <span className="text-sm font-medium text-stone-700">Amount</span>
          <input
            className="mt-2 h-11 w-full rounded-lg border border-stone-200 px-3 text-base font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            inputMode="decimal"
            min="0"
            onChange={(event) =>
              onChange({ ...reserve, amount: Number(event.target.value) })
            }
            type="number"
            value={String(reserve.amount)}
          />
          {errors?.amount ? (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          ) : null}
        </label>
      </div>

      <p className="mt-4 text-sm font-bold text-stone-600">
        {formatMoney(reserve.amount, currency)} remaining
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-emerald-600"
          style={{ width: `${100 - getReserveUsedPercent(reserve)}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-semibold text-stone-500">
        Used {formatMoney(reserve.spent ?? 0, currency)} of{" "}
        {formatMoney(getReserveOriginalAmount(reserve), currency)}
      </p>
    </article>
  );
}
