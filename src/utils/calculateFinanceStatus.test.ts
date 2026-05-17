import { describe, expect, it } from "vitest";
import { calculateFinanceStatus } from "./calculateFinanceStatus";
import type { Reserve } from "@/types/finance";

const today = new Date(2026, 4, 17);

function reserve(overrides: Partial<Reserve>): Reserve {
  return {
    id: "reserve-1",
    name: "Savings",
    amount: 0,
    enabled: true,
    ...overrides,
  };
}

describe("calculateFinanceStatus", () => {
  it("returns Safe when safe daily spend is at least RM 30", () => {
    const result = calculateFinanceStatus({
      currentBalance: 1000,
      reserves: [reserve({ amount: 100 })],
      nextSalaryDate: "2026-05-27",
      today,
    });

    expect(result.status).toBe("Safe");
    expect(result.safeDailySpend).toBe(90);
  });

  it("returns Careful when spendable money is non-negative but daily spend is under RM 30", () => {
    const result = calculateFinanceStatus({
      currentBalance: 250,
      reserves: [reserve({ amount: 100 })],
      nextSalaryDate: "2026-05-27",
      today,
    });

    expect(result.status).toBe("Careful");
    expect(result.safeDailySpend).toBe(15);
  });

  it("returns Recovery Mode when protected reserves exceed current balance", () => {
    const result = calculateFinanceStatus({
      currentBalance: 300,
      reserves: [reserve({ amount: 500 })],
      nextSalaryDate: "2026-05-27",
      today,
    });

    expect(result.status).toBe("Recovery Mode");
  });

  it("ignores disabled reserves", () => {
    const result = calculateFinanceStatus({
      currentBalance: 1000,
      reserves: [
        reserve({ amount: 100, enabled: true }),
        reserve({ id: "reserve-2", amount: 700, enabled: false }),
      ],
      nextSalaryDate: "2026-05-27",
      today,
    });

    expect(result.totalProtectedReserves).toBe(100);
    expect(result.spendableMoney).toBe(900);
  });

  it("uses one day when days until salary is less than one", () => {
    const result = calculateFinanceStatus({
      currentBalance: 120,
      reserves: [],
      nextSalaryDate: "2026-05-16",
      today,
    });

    expect(result.daysUntilSalary).toBe(1);
    expect(result.safeDailySpend).toBe(120);
  });

  it("handles negative spendable money correctly", () => {
    const result = calculateFinanceStatus({
      currentBalance: 100,
      reserves: [reserve({ amount: 250 })],
      nextSalaryDate: "2026-05-22",
      today,
    });

    expect(result.spendableMoney).toBe(-150);
    expect(result.safeDailySpend).toBe(-30);
    expect(result.status).toBe("Recovery Mode");
  });
});
