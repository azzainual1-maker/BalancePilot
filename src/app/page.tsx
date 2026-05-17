"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { BottomNav, type AppView } from "@/components/BottomNav";
import { DateInput } from "@/components/DateInput";
import { EmptyState } from "@/components/EmptyState";
import { MoneyInput } from "@/components/MoneyInput";
import { ReserveCard } from "@/components/ReserveCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SummaryCard } from "@/components/SummaryCard";
import { useFinanceData } from "@/hooks/useFinanceData";
import type { BalanceEntry, Reserve, SalaryCycle } from "@/types/finance";
import { calculateFinanceStatus } from "@/utils/calculateFinanceStatus";
import { formatDisplayDate, parseLocalDate, todayISO } from "@/utils/dateHelpers";
import {
  buildPerformancePoints,
  createLocalAnalysis,
  getReserveOriginalAmount,
  getReserveUsedPercent,
} from "@/utils/financeInsights";
import { formatMoney } from "@/utils/formatMoney";
import { createId } from "@/utils/id";

type FormErrors = Record<string, string>;

export default function Home() {
  const finance = useFinanceData();
  const [activeView, setActiveView] = useState<AppView>("dashboard");

  if (!finance.isReady) {
    return <main className="flex min-h-screen items-center justify-center text-sm font-semibold text-stone-600">Loading BalancePilot...</main>;
  }

  if (!finance.salaryCycle) {
    return <SetupScreen onComplete={finance.completeSetup} />;
  }

  const currency = finance.salaryCycle.currency || "RM";

  return (
    <main className="app-stage flex min-h-screen justify-center md:p-6">
      <section className="app-phone relative min-h-screen w-full max-w-xl overflow-hidden pb-28 shadow-[0_30px_80px_rgba(0,0,0,0.38)] md:min-h-[900px] md:rounded-[2rem]">
        <div className="px-4 pb-6 pt-5">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Image alt="BalancePilot" className="h-auto w-40" height={35} priority src="/balancepilot-logo.svg" width={160} />
              <h1 className="mt-1 text-3xl font-black leading-tight text-stone-950">Dashboard</h1>
            </div>
            <div className="rounded-full bg-[#171b18] px-4 py-2 text-xs font-black text-[#d9f8d6] shadow-[0_12px_30px_rgba(23,27,24,0.18)]">Local</div>
          </header>

          {activeView === "dashboard" ? <DashboardScreen finance={finance} currency={currency} /> : null}
          {activeView === "update" ? <BalanceUpdateScreen addBalanceEntry={finance.addBalanceEntry} currency={currency} latestBalance={finance.currentBalance} onDone={() => setActiveView("dashboard")} reserves={finance.reserves} /> : null}
          {activeView === "reserves" ? <ReservesScreen currency={currency} reserves={finance.reserves} setReserves={finance.setReserves} /> : null}
          {activeView === "history" ? <HistoryScreen balanceEntries={finance.balanceEntries} currency={currency} nextSalaryDate={finance.salaryCycle.nextSalaryDate} reserves={finance.reserves} /> : null}
          {activeView === "settings" ? <SettingsScreen onReset={finance.resetApp} salaryCycle={finance.salaryCycle} setSalaryCycle={finance.setSalaryCycle} /> : null}
        </div>
        <BottomNav activeView={activeView} onChange={setActiveView} />
      </section>
    </main>
  );
}

function SetupScreen({ onComplete }: { onComplete: (input: SalaryCycle & { currentBalance: number }) => void }) {
  const [salaryAmount, setSalaryAmount] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [salaryDate, setSalaryDate] = useState(todayISO());
  const [nextSalaryDate, setNextSalaryDate] = useState("");
  const [currency, setCurrency] = useState("RM");
  const [userName, setUserName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateSalaryCycle({ salaryAmount, currentBalance, salaryDate, nextSalaryDate });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onComplete({ salaryAmount: Number(salaryAmount), currentBalance: Number(currentBalance), salaryDate, nextSalaryDate, currency, userName });
  }

  return (
    <main className="app-stage flex min-h-screen justify-center md:p-6">
      <section className="app-phone min-h-screen w-full max-w-xl px-4 py-6 shadow-[0_30px_80px_rgba(0,0,0,0.38)] md:min-h-[900px] md:rounded-[2rem]">
        <div className="rounded-lg bg-[#171b18] p-5 text-[#d9f8d6] shadow-[0_18px_50px_rgba(23,27,24,0.25)]">
          <div className="rounded-lg bg-[#d9f8d6] px-3 py-2"><Image alt="BalancePilot" className="h-auto w-44" height={38} priority src="/balancepilot-logo.svg" width={176} /></div>
          <h1 className="mt-5 text-4xl font-black leading-tight">Set your safe daily spending line.</h1>
          <p className="mt-4 text-base leading-7 text-[#d9f8d6]/75">Enter your salary cycle once. After that, just update your current balance when you need a fresh read.</p>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <MoneyInput error={errors.salaryAmount} label="Salary amount" onChange={setSalaryAmount} value={salaryAmount} />
          <MoneyInput error={errors.currentBalance} label="Current bank balance after salary" onChange={setCurrentBalance} value={currentBalance} />
          <DateInput error={errors.salaryDate} label="Salary date" onChange={setSalaryDate} value={salaryDate} />
          <DateInput error={errors.nextSalaryDate} label="Next salary date" onChange={setNextSalaryDate} value={nextSalaryDate} />
          <TextInput label="Your name" onChange={setUserName} placeholder="Azzai" value={userName} />
          <label className="block"><span className="text-sm font-black text-stone-700">Currency</span><select className="mt-2 h-12 w-full rounded-lg border border-black/5 bg-[#f8fff4] px-3 text-base font-black text-stone-950 shadow-[0_10px_24px_rgba(24,31,27,0.07)] outline-none" onChange={(event) => setCurrency(event.target.value)} value={currency}><option value="RM">RM - Malaysian Ringgit</option><option value="SGD">SGD - Singapore Dollar</option><option value="USD">USD - US Dollar</option></select></label>
          <button className="mt-2 rounded-lg bg-[#171b18] px-5 py-4 text-base font-black text-[#d9f8d6] shadow-[0_14px_30px_rgba(23,27,24,0.18)]" type="submit">Start BalancePilot</button>
        </form>
      </section>
    </main>
  );
}

function DashboardScreen({ finance, currency }: { finance: ReturnType<typeof useFinanceData>; currency: string }) {
  const status = finance.financeStatus;
  if (!status || !finance.salaryCycle) return null;
  const performancePoints = buildPerformancePoints({ balanceEntries: finance.balanceEntries, reserves: finance.reserves, nextSalaryDate: finance.salaryCycle.nextSalaryDate });
  const analysis = createLocalAnalysis({ currentSafeDailySpend: status.safeDailySpend, spendableMoney: status.spendableMoney, status: status.status, points: performancePoints, reserves: finance.reserves });

  return (
    <div className="grid gap-4">
      <section className="rounded-lg bg-[#f8fff4] p-4 shadow-[0_10px_30px_rgba(24,31,27,0.08)] ring-1 ring-black/5"><p className="text-sm font-black text-stone-600">{finance.salaryCycle.userName ? `Hi ${finance.salaryCycle.userName}, here's your money cockpit.` : "Here is your money cockpit."}</p><p className="mt-1 text-xs leading-5 text-stone-500">A quick read on what is safe today, without tracking every transaction.</p></section>
      <section className="rounded-lg bg-[#171b18] p-5 text-[#d9f8d6] shadow-[0_18px_50px_rgba(23,27,24,0.22)]"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-[#d9f8d6]/65">Safe to spend today</p><p className="mt-1 text-xs font-semibold text-[#d9f8d6]/50">{formatDisplayDate(todayISO())}</p><p className="mt-3 break-words text-5xl font-black tracking-normal text-[#d9f8d6]">{formatMoney(status.safeDailySpend, currency)}</p><p className="mt-1 text-xl font-black text-[#d9f8d6]/60">/ day</p></div><StatusBadge status={status.status} /></div><p className="mt-5 rounded-lg bg-white/10 p-4 text-sm leading-6 text-[#d9f8d6]/78">{status.message}</p></section>
      <div className="grid grid-cols-2 gap-3"><SummaryCard label="Current balance" value={formatMoney(finance.currentBalance, currency)} /><SummaryCard label="Days to salary" value={String(status.daysUntilSalary)} /><SummaryCard label="Free spending money" tone={status.spendableMoney < 0 ? "recovery" : "plain"} value={formatMoney(status.spendableMoney, currency)} /><SummaryCard label="Protected reserves" value={formatMoney(status.totalProtectedReserves, currency)} /></div>
      <section className="rounded-lg bg-[#c7ccff] p-4 shadow-[0_10px_30px_rgba(24,31,27,0.08)]"><p className="text-sm font-black text-stone-700/70">Next salary</p><p className="mt-1 text-lg font-black text-stone-950">{formatDisplayDate(finance.salaryCycle.nextSalaryDate)}</p></section>
      <ReserveSnapshot reserves={finance.reserves} currency={currency} />
      <PerformanceGraph points={performancePoints} currency={currency} />
      <section className="rounded-lg bg-[#f8fff4] p-4 shadow-[0_10px_30px_rgba(24,31,27,0.08)] ring-1 ring-black/5"><p className="text-sm font-black uppercase tracking-normal text-emerald-950/70">AI-style check-in</p><p className="mt-2 text-sm leading-6 text-stone-700">{analysis}</p></section>
    </div>
  );
}

function ReserveSnapshot({ reserves, currency }: { reserves: Reserve[]; currency: string }) {
  const enabledReserves = reserves.filter((reserve) => reserve.enabled);
  if (enabledReserves.length === 0) return <EmptyState description="Protected reserves will appear here once you enable them." title="No active reserve balances" />;
  return <section className="rounded-lg bg-[#f8fff4] p-4 shadow-[0_10px_30px_rgba(24,31,27,0.08)] ring-1 ring-black/5"><p className="text-sm font-black text-stone-600">Protected reserve balances</p><h2 className="mt-1 text-lg font-black text-stone-950">Remaining and used</h2><div className="mt-4 grid gap-3">{enabledReserves.map((reserve) => { const original = getReserveOriginalAmount(reserve); const usedPercent = getReserveUsedPercent(reserve); return <article className="rounded-lg border border-black/5 bg-[#eefee9] p-3" key={reserve.id}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-stone-950">{reserve.name}</p><p className="mt-1 text-xs font-semibold text-stone-500">Used {formatMoney(reserve.spent ?? 0, currency)} of {formatMoney(original, currency)}</p></div><p className="text-right text-sm font-black text-emerald-700">{formatMoney(reserve.amount, currency)}<br /><span className="font-semibold text-stone-500">left</span></p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-[#171b18]" style={{ width: `${100 - usedPercent}%` }} /></div></article>; })}</div></section>;
}

function PerformanceGraph({ points, currency }: { points: ReturnType<typeof buildPerformancePoints>; currency: string }) {
  const visiblePoints = points.slice(-7);
  const maxValue = Math.max(30, ...visiblePoints.map((point) => Math.max(point.safeDailySpend, point.actualDailyChange ?? 0)));
  if (visiblePoints.length < 2) return <section className="rounded-lg bg-[#f8fff4] p-4 shadow-[0_10px_30px_rgba(24,31,27,0.08)] ring-1 ring-black/5"><p className="text-sm font-black text-stone-600">Safe spend performance</p><p className="mt-2 text-sm leading-6 text-stone-600">Add a few balance updates to see whether your actual pace is staying under the safe daily line.</p></section>;
  return <section className="rounded-lg bg-[#f8fff4] p-4 shadow-[0_10px_30px_rgba(24,31,27,0.08)] ring-1 ring-black/5"><p className="text-sm font-black text-stone-600">Safe spend performance</p><h2 className="mt-1 text-lg font-black text-stone-950">Last updates</h2><div className="mt-4 flex h-44 items-end gap-2 rounded-lg bg-[#eefee9] p-3">{visiblePoints.map((point) => <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1" key={point.id}><div className="flex h-32 w-full items-end justify-center gap-1"><div className="w-3 rounded-t bg-[#171b18]" style={{ height: `${Math.max(6, (Math.max(0, point.safeDailySpend) / maxValue) * 100)}%` }} /><div className={`w-3 rounded-t ${point.isOnTrack === false ? "bg-red-500" : "bg-amber-500"}`} style={{ height: `${point.actualDailyChange === null ? 0 : Math.max(6, (Math.max(0, point.actualDailyChange) / maxValue) * 100)}%` }} /></div><p className="truncate text-[10px] font-semibold text-stone-500">{formatDisplayDate(point.date).replace(" 2026", "")}</p></div>)}</div><p className="mt-3 text-xs leading-5 text-stone-500">Actual pace is estimated from balance changes between updates, so it stays lightweight.</p></section>;
}

function ReservesScreen({ reserves, setReserves, currency }: { reserves: Reserve[]; setReserves: (value: Reserve[] | ((current: Reserve[]) => Reserve[])) => void; currency: string }) {
  const enabledTotal = reserves.filter((reserve) => reserve.enabled).reduce((sum, reserve) => sum + reserve.amount, 0);
  return <section className="grid gap-4"><SummaryCard label="Total enabled reserves" value={formatMoney(enabledTotal, currency)} /><button className="h-12 rounded-lg bg-[#171b18] px-4 text-base font-black text-[#d9f8d6]" onClick={() => setReserves((current) => [{ id: createId("reserve"), name: "New reserve", amount: 0, spent: 0, enabled: true }, ...current])} type="button">Add Reserve</button>{reserves.length === 0 ? <EmptyState description="Create a reserve for money you want to protect from everyday spending." title="No reserves yet" /> : <div className="grid gap-3">{reserves.map((reserve) => <ReserveCard currency={currency} key={reserve.id} onChange={(nextReserve) => setReserves((current) => current.map((item) => item.id === nextReserve.id ? nextReserve : item))} onDelete={() => setReserves((current) => current.filter((item) => item.id !== reserve.id))} reserve={reserve} />)}</div>}</section>;
}

function BalanceUpdateScreen({ addBalanceEntry, latestBalance, currency, onDone, reserves }: { addBalanceEntry: (balance: number, note?: string, reserveUsage?: Record<string, number>) => void; latestBalance: number; currency: string; onDone: () => void; reserves: Reserve[] }) {
  const [balance, setBalance] = useState(latestBalance ? String(latestBalance) : "");
  const [note, setNote] = useState("");
  const [reserveUsage, setReserveUsage] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const numericBalance = Number(balance);
    if (!balance || !Number.isFinite(numericBalance) || numericBalance < 0) { setError("Enter a current bank balance of zero or more."); return; }
    const usageValues = Object.fromEntries(Object.entries(reserveUsage).map(([reserveId, value]) => [reserveId, Number(value) || 0]));
    if (reserves.some((reserve) => (usageValues[reserve.id] ?? 0) > reserve.amount)) { setError("Reserve usage must be less than the remaining reserve balance."); return; }
    addBalanceEntry(numericBalance, note, usageValues);
    onDone();
  }

  return <form className="grid gap-4" onSubmit={submit}><section className="rounded-lg bg-[#f8fff4] p-4 shadow-sm"><p className="text-sm font-semibold text-stone-500">Today</p><p className="mt-1 text-lg font-black text-stone-950">{formatDisplayDate(todayISO())}</p></section><MoneyInput error={error} label="Current bank balance" onChange={setBalance} value={balance} /><TextInput label="Note" onChange={setNote} placeholder="After bills, ATM check, weekend reset..." value={note} />{reserves.filter((reserve) => reserve.enabled).length > 0 ? <section className="rounded-lg bg-[#f8fff4] p-4 shadow-sm"><p className="text-sm font-semibold text-stone-500">Used from reserves today</p><div className="mt-4 grid gap-3">{reserves.filter((reserve) => reserve.enabled).map((reserve) => <MoneyInput key={reserve.id} label={`${reserve.name} (${formatMoney(reserve.amount, currency)} left)`} onChange={(value) => setReserveUsage((current) => ({ ...current, [reserve.id]: value }))} value={reserveUsage[reserve.id] ?? ""} />)}</div></section> : null}<button className="rounded-lg bg-[#171b18] px-5 py-4 text-base font-black text-[#d9f8d6]" type="submit">Save Balance</button><p className="text-sm text-stone-500">Latest saved balance: {formatMoney(latestBalance, currency)}</p></form>;
}

function HistoryScreen({ balanceEntries, reserves, nextSalaryDate, currency }: { balanceEntries: BalanceEntry[]; reserves: Reserve[]; nextSalaryDate: string; currency: string }) {
  if (balanceEntries.length === 0) return <EmptyState description="Balance updates will appear here after you save them." title="No balance history yet" />;
  return <section className="grid gap-3">{balanceEntries.map((entry) => { const status = calculateFinanceStatus({ currentBalance: entry.balance, reserves, nextSalaryDate, today: parseLocalDate(entry.date) ?? new Date() }); return <article className="rounded-lg bg-[#f8fff4] p-4 shadow-sm" key={entry.id}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-stone-500">{formatDisplayDate(entry.date)}</p><p className="mt-1 text-xl font-black text-stone-950">{formatMoney(entry.balance, currency)}</p></div><p className="text-right text-sm font-black text-emerald-700">{formatMoney(status.safeDailySpend, currency)}<br /><span className="font-semibold text-stone-500">/ day</span></p></div>{entry.note ? <p className="mt-3 text-sm text-stone-600">{entry.note}</p> : null}</article>; })}</section>;
}

function SettingsScreen({ salaryCycle, setSalaryCycle, onReset }: { salaryCycle: SalaryCycle; setSalaryCycle: (value: SalaryCycle | ((current: SalaryCycle | null) => SalaryCycle | null)) => void; onReset: () => void }) {
  const [salaryAmount, setSalaryAmount] = useState(String(salaryCycle.salaryAmount));
  const [salaryDate, setSalaryDate] = useState(salaryCycle.salaryDate);
  const [nextSalaryDate, setNextSalaryDate] = useState(salaryCycle.nextSalaryDate);
  const [currency, setCurrency] = useState(salaryCycle.currency || "RM");
  const [userName, setUserName] = useState(salaryCycle.userName || "");
  const [saved, setSaved] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setSalaryCycle({ salaryAmount: Number(salaryAmount), salaryDate, nextSalaryDate, currency, userName: userName.trim() || undefined }); setSaved(true); }
  return <section className="grid gap-4"><form className="grid gap-4" onSubmit={submit}><MoneyInput label="Salary amount" onChange={setSalaryAmount} value={salaryAmount} /><DateInput label="Salary date" onChange={setSalaryDate} value={salaryDate} /><DateInput label="Next salary date" onChange={setNextSalaryDate} value={nextSalaryDate} /><TextInput label="Your name" onChange={setUserName} value={userName} /><TextInput label="Currency" onChange={setCurrency} value={currency} /><button className="rounded-lg bg-[#171b18] px-5 py-4 text-base font-black text-[#d9f8d6]" type="submit">Save Settings</button>{saved ? <p className="text-sm font-semibold text-emerald-700">Settings saved.</p> : null}</form><button className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-black text-red-700" onClick={onReset} type="button">Reset app data</button></section>;
}

function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block"><span className="text-sm font-black text-stone-700">{label}</span><input className="mt-2 h-12 w-full rounded-lg border border-black/5 bg-[#f8fff4] px-3 text-base font-black text-stone-950 shadow-[0_10px_24px_rgba(24,31,27,0.07)] outline-none" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} value={value} /></label>;
}

function validateSalaryCycle(values: { salaryAmount: string; currentBalance?: string; salaryDate: string; nextSalaryDate: string }) {
  const errors: FormErrors = {};
  if (!isValidMoney(values.salaryAmount)) errors.salaryAmount = "Enter a salary amount of zero or more.";
  if (values.currentBalance !== undefined && !isValidMoney(values.currentBalance)) errors.currentBalance = "Enter a current bank balance of zero or more.";
  if (!parseLocalDate(values.salaryDate)) errors.salaryDate = "Choose a valid salary date.";
  if (!parseLocalDate(values.nextSalaryDate)) errors.nextSalaryDate = "Choose a valid next salary date.";
  return errors;
}

function isValidMoney(value: string) {
  const number = Number(value);
  return value.trim() !== "" && Number.isFinite(number) && number >= 0;
}
