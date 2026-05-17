type MoneyInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
};

export function MoneyInput({
  label,
  value,
  onChange,
  error,
  placeholder = "0.00",
}: MoneyInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-black text-stone-700">{label}</span>
      <div className="mt-2 flex items-center rounded-lg border border-black/5 bg-[#f8fff4] px-3 shadow-[0_10px_24px_rgba(24,31,27,0.07)] focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-stone-900/10">
        <span className="pr-2 text-sm font-black text-stone-500">RM</span>
        <input
          className="h-12 w-full bg-transparent text-base font-black text-stone-950 outline-none"
          inputMode="decimal"
          min="0"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type="number"
          value={value}
        />
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </label>
  );
}
