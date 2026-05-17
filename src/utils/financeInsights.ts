import type { BalanceEntry, Reserve } from "@/types/finance";
import { calculateFinanceStatus } from "./calculateFinanceStatus";
import { parseLocalDate } from "./dateHelpers";

export type PerformancePoint = {
  id: string;
  date: string;
  safeDailySpend: number;
  actualDailyChange: number | null;
  isOnTrack: boolean | null;
};

export function getReserveOriginalAmount(reserve: Reserve) {
  return Math.max(0, reserve.amount) + Math.max(0, reserve.spent ?? 0);
}

export function getReserveUsedPercent(reserve: Reserve) {
  const original = getReserveOriginalAmount(reserve);

  if (original === 0) {
    return 0;
  }

  return Math.min(100, (Math.max(0, reserve.spent ?? 0) / original) * 100);
}

export function buildPerformancePoints({
  balanceEntries,
  reserves,
  nextSalaryDate,
}: {
  balanceEntries: BalanceEntry[];
  reserves: Reserve[];
  nextSalaryDate: string;
}) {
  const chronologicalEntries = [...balanceEntries].reverse();

  return chronologicalEntries.map((entry, index): PerformancePoint => {
    const entryDate = parseLocalDate(entry.date) ?? new Date();
    const status = calculateFinanceStatus({
      currentBalance: entry.balance,
      reserves,
      nextSalaryDate,
      today: entryDate,
    });

    const nextEntry = chronologicalEntries[index + 1];
    const actualDailyChange = nextEntry
      ? calculateActualDailyChange(entry, nextEntry)
      : null;

    return {
      id: entry.id,
      date: entry.date,
      safeDailySpend: status.safeDailySpend,
      actualDailyChange,
      isOnTrack:
        actualDailyChange === null
          ? null
          : actualDailyChange <= Math.max(0, status.safeDailySpend),
    };
  });
}

export function createLocalAnalysis({
  currentSafeDailySpend,
  spendableMoney,
  status,
  points,
  reserves,
}: {
  currentSafeDailySpend: number;
  spendableMoney: number;
  status: string;
  points: PerformancePoint[];
  reserves: Reserve[];
}) {
  const measuredPoints = points.filter((point) => point.isOnTrack !== null);
  const onTrackCount = measuredPoints.filter((point) => point.isOnTrack).length;
  const mostUsedReserve = [...reserves]
    .filter((reserve) => (reserve.spent ?? 0) > 0)
    .sort((a, b) => getReserveUsedPercent(b) - getReserveUsedPercent(a))[0];

  if (status === "Recovery Mode") {
    return "You are protecting more money than the current balance can support. Keep the next few days quiet and only use reserves for the purpose they were set aside for.";
  }

  if (measuredPoints.length === 0) {
    return "I need a few balance updates before I can judge the trend. For now, your safest move is to treat today's daily limit as the line to stay under.";
  }

  if (onTrackCount === measuredPoints.length && currentSafeDailySpend >= 30) {
    return "You are tracking well against the plan. Your recent balance updates are staying within the safe daily pace, so keep using the current limit as your guardrail.";
  }

  if (mostUsedReserve && getReserveUsedPercent(mostUsedReserve) >= 60) {
    return `${mostUsedReserve.name} has been used the most so far. Your main goal now is to keep everyday spending below the safe daily amount so that reserve can last until salary day.`;
  }

  if (spendableMoney < currentSafeDailySpend * 3) {
    return "There is not much flexible money left beyond the next few days. Keep non-essential spending low and protect the reserve balances you still have.";
  }

  return "The plan is still workable, but your recent updates show some pressure. Use the safe daily amount as a ceiling and check in again after the next balance update.";
}

function calculateActualDailyChange(from: BalanceEntry, to: BalanceEntry) {
  const fromDate = parseLocalDate(from.date);
  const toDate = parseLocalDate(to.date);

  if (!fromDate || !toDate) {
    return 0;
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.max(
    1,
    Math.ceil((toDate.getTime() - fromDate.getTime()) / dayMs),
  );

  return Math.max(0, (from.balance - to.balance) / days);
}
