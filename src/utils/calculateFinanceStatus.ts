import type { FinanceStatus, Reserve } from "@/types/finance";
import { daysUntilDate } from "./dateHelpers";

type CalculateFinanceStatusInput = {
  currentBalance: number;
  reserves: Reserve[];
  nextSalaryDate: string;
  today?: Date;
};

type CalculateFinanceStatusResult = {
  totalProtectedReserves: number;
  spendableMoney: number;
  daysUntilSalary: number;
  safeDailySpend: number;
  status: FinanceStatus;
  message: string;
};

const messages: Record<FinanceStatus, string> = {
  Safe: "You're on track. This is your safe daily spending limit.",
  Careful: "Money is a bit tight. Keep spending low until next salary.",
  "Recovery Mode":
    "Your protected reserves are higher than your current balance. Avoid non-essential spending.",
};

export function calculateFinanceStatus({
  currentBalance,
  reserves,
  nextSalaryDate,
  today = new Date(),
}: CalculateFinanceStatusInput): CalculateFinanceStatusResult {
  const totalProtectedReserves = reserves
    .filter((reserve) => reserve.enabled)
    .reduce((sum, reserve) => sum + sanitizeMoney(reserve.amount), 0);

  const spendableMoney = sanitizeMoney(currentBalance) - totalProtectedReserves;
  const rawDaysUntilSalary = daysUntilDate(nextSalaryDate, today);
  const daysUntilSalary = Math.max(rawDaysUntilSalary, 1);
  const safeDailySpend = spendableMoney / daysUntilSalary;
  const status = getStatus(spendableMoney, safeDailySpend);

  return {
    totalProtectedReserves,
    spendableMoney,
    daysUntilSalary,
    safeDailySpend,
    status,
    message: messages[status],
  };
}

function sanitizeMoney(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function getStatus(spendableMoney: number, safeDailySpend: number): FinanceStatus {
  if (spendableMoney < 0) {
    return "Recovery Mode";
  }

  if (safeDailySpend < 30) {
    return "Careful";
  }

  return "Safe";
}
