export type SalaryCycle = {
  salaryAmount: number;
  salaryDate: string;
  nextSalaryDate: string;
  currency: string;
  userName?: string;
};

export type Reserve = {
  id: string;
  name: string;
  amount: number;
  spent?: number;
  enabled: boolean;
};

export type BalanceEntry = {
  id: string;
  date: string;
  balance: number;
  note?: string;
  reserveUsage?: ReserveUsage[];
};

export type FinanceStatus = "Safe" | "Careful" | "Recovery Mode";

export type ReserveUsage = {
  reserveId: string;
  reserveName: string;
  amount: number;
};
