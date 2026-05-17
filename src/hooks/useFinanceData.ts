"use client";

import { useMemo } from "react";
import type { BalanceEntry, Reserve, SalaryCycle } from "@/types/finance";
import { calculateFinanceStatus } from "@/utils/calculateFinanceStatus";
import { todayISO } from "@/utils/dateHelpers";
import { createId } from "@/utils/id";
import { useLocalStorage } from "./useLocalStorage";

const salaryKey = "balancepilot.salaryCycle";
const reservesKey = "balancepilot.reserves";
const balanceEntriesKey = "balancepilot.balanceEntries";

export const suggestedReserves: Reserve[] = [
  { id: "petrol", name: "Petrol", amount: 0, spent: 0, enabled: true },
  { id: "groceries", name: "Groceries", amount: 0, spent: 0, enabled: true },
  { id: "emergency-buffer", name: "Emergency Buffer", amount: 0, spent: 0, enabled: true },
  { id: "savings", name: "Savings", amount: 0, spent: 0, enabled: true },
];

const emptyBalanceEntries: BalanceEntry[] = [];

export function useFinanceData() {
  const [salaryCycle, setSalaryCycle, clearSalaryCycle, salaryReady] =
    useLocalStorage<SalaryCycle | null>(salaryKey, null, parseSalaryCycle);
  const [reserves, setReserves, clearReserves, reservesReady] = useLocalStorage<Reserve[]>(
    reservesKey,
    suggestedReserves,
    parseReserves,
  );
  const [balanceEntries, setBalanceEntries, clearBalanceEntries, entriesReady] =
    useLocalStorage<BalanceEntry[]>(balanceEntriesKey, emptyBalanceEntries, parseBalanceEntries);

  const latestBalanceEntry = balanceEntries[0] ?? null;
  const currentBalance = latestBalanceEntry?.balance ?? 0;

  const financeStatus = useMemo(() => {
    if (!salaryCycle) {
      return null;
    }

    return calculateFinanceStatus({
      currentBalance,
      reserves,
      nextSalaryDate: salaryCycle.nextSalaryDate,
    });
  }, [currentBalance, reserves, salaryCycle]);

  function completeSetup(input: SalaryCycle & { currentBalance: number }) {
    setSalaryCycle({
      salaryAmount: input.salaryAmount,
      salaryDate: input.salaryDate,
      nextSalaryDate: input.nextSalaryDate,
      currency: input.currency || "RM",
      userName: input.userName?.trim() || undefined,
    });

    setBalanceEntries([
      {
        id: createId("balance"),
        date: todayISO(),
        balance: input.currentBalance,
        note: "Starting balance after salary",
      },
    ]);
  }

  function addBalanceEntry(
    balance: number,
    note?: string,
    reserveUsage: Record<string, number> = {},
  ) {
    const usageEntries = reserves
      .map((reserve) => ({
        reserveId: reserve.id,
        reserveName: reserve.name,
        amount: Math.max(0, Number(reserveUsage[reserve.id]) || 0),
      }))
      .filter((usage) => usage.amount > 0);

    if (usageEntries.length > 0) {
      setReserves((current) =>
        current.map((reserve) => {
          const used = Math.max(0, Number(reserveUsage[reserve.id]) || 0);

          if (used === 0) {
            return reserve;
          }

          return {
            ...reserve,
            amount: Math.max(0, reserve.amount - used),
            spent: Math.max(0, reserve.spent ?? 0) + used,
          };
        }),
      );
    }

    setBalanceEntries((entries) => [
      {
        id: createId("balance"),
        date: todayISO(),
        balance,
        note: note?.trim() || undefined,
        reserveUsage: usageEntries.length > 0 ? usageEntries : undefined,
      },
      ...entries,
    ]);
  }

  function resetApp() {
    clearSalaryCycle();
    clearReserves();
    clearBalanceEntries();
  }

  return {
    salaryCycle,
    setSalaryCycle,
    reserves,
    setReserves,
    balanceEntries,
    setBalanceEntries,
    latestBalanceEntry,
    currentBalance,
    financeStatus,
    completeSetup,
    addBalanceEntry,
    resetApp,
    isReady: salaryReady && reservesReady && entriesReady,
  };
}

function parseSalaryCycle(value: unknown): SalaryCycle | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<SalaryCycle>;

  if (
    typeof candidate.salaryAmount !== "number" ||
    typeof candidate.salaryDate !== "string" ||
    typeof candidate.nextSalaryDate !== "string"
  ) {
    return null;
  }

  return {
    salaryAmount: Math.max(0, candidate.salaryAmount),
    salaryDate: candidate.salaryDate,
    nextSalaryDate: candidate.nextSalaryDate,
    currency: typeof candidate.currency === "string" ? candidate.currency : "RM",
    userName: typeof candidate.userName === "string" ? candidate.userName : undefined,
  };
}

function parseReserves(value: unknown): Reserve[] {
  if (!Array.isArray(value)) {
    return suggestedReserves;
  }

  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => item as Partial<Reserve>)
    .filter((item) => typeof item.name === "string" && typeof item.amount === "number")
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : createId("reserve"),
      name: item.name?.trim() || "Reserve",
      amount: Math.max(0, item.amount ?? 0),
      spent: Math.max(0, item.spent ?? 0),
      enabled: typeof item.enabled === "boolean" ? item.enabled : true,
    }));
}

function parseBalanceEntries(value: unknown): BalanceEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => item as Partial<BalanceEntry>)
    .filter((item) => typeof item.date === "string" && typeof item.balance === "number")
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : createId("balance"),
      date: item.date ?? todayISO(),
      balance: Math.max(0, item.balance ?? 0),
      note: typeof item.note === "string" ? item.note : undefined,
      reserveUsage: parseReserveUsage(item.reserveUsage),
    }));
}

function parseReserveUsage(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const usage = value
    .filter((item) => item && typeof item === "object")
    .map((item) => item as { reserveId?: unknown; reserveName?: unknown; amount?: unknown })
    .filter(
      (item) =>
        typeof item.reserveId === "string" &&
        typeof item.reserveName === "string" &&
        typeof item.amount === "number",
    )
    .map((item) => ({
      reserveId: item.reserveId as string,
      reserveName: item.reserveName as string,
      amount: Math.max(0, item.amount as number),
    }));

  return usage.length > 0 ? usage : undefined;
}
