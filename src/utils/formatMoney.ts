const currencyMap: Record<string, string> = {
  RM: "MYR",
  MYR: "MYR",
  USD: "USD",
  SGD: "SGD",
};

export function formatMoney(amount: number, currency = "RM") {
  const currencyCode = currencyMap[currency] ?? currency;

  try {
    const formatted = new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);

    return currency === "RM" || currencyCode === "MYR"
      ? formatted.replace("MYR", "RM")
      : formatted;
  } catch {
    return `${currency} ${(Number.isFinite(amount) ? amount : 0).toFixed(2)}`;
  }
}
