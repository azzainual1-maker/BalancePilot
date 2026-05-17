# BalancePilot

BalancePilot is a local-first safe-to-spend personal finance app. It is not a transaction tracker, bill tracker, expense categorizer, or accounting tool. You occasionally enter your current bank balance, protect the money you should not accidentally spend, and the app shows a calm daily spending limit until your next salary.

## What It Does

- Stores your salary cycle, protected reserves, and balance history in `localStorage`.
- Calculates total protected reserves, free spending money, days until next salary, safe daily spend, and financial status.
- Lets you deduct money from a protected reserve when you intentionally use it, such as Petrol RM50.
- Shows reserve balances, used amounts, a lightweight safe-spend performance graph, and a local AI-style progress check-in on the dashboard.
- Keeps the workflow simple: set up once, update your balance after salary or bills, and check the dashboard.
- Works without a backend, login, or internet connection after the app is installed.

## Formula

Total Protected Reserves = the sum of all enabled reserve amounts.

Spendable Money = Current Balance - Total Protected Reserves.

Days Until Salary = the number of calendar days from today until the next salary date. If that value is less than 1, BalancePilot uses 1 day.

Safe Daily Spend = Spendable Money / Days Until Salary.

Statuses:

- Recovery Mode: spendable money is below 0.
- Careful: spendable money is 0 or more, but safe daily spend is below RM 30.
- Safe: safe daily spend is RM 30 or more.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Test

```bash
npm run test
```

## Lint

```bash
npm run lint
```

## Build

```bash
npm run build
```

## How To Use

1. On salary day, enter your salary amount, current bank balance after salary, salary date, and next salary date.
2. After paying fixed bills outside the app, use Update Balance to enter your current balance after bills.
3. If you used protected money, enter the amount beside the relevant reserve during the balance update. For example, Petrol RM50 deducts RM50 from the Petrol reserve.
4. Add or adjust protected reserves such as Petrol, Groceries, Emergency Buffer, Savings, Parents Allowance, Car Maintenance, or Vacation Fund.
5. Check the dashboard for your safe daily spend, reserve balances, free spending money, days until salary, performance graph, and local AI-style analysis.

BalancePilot intentionally does not ask for fixed bills or individual transactions.
