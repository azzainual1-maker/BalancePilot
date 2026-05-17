type DateInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function DateInput({ label, value, onChange, error }: DateInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-black text-stone-700">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-lg border border-black/5 bg-[#f8fff4] px-3 text-base font-black text-stone-950 shadow-[0_10px_24px_rgba(24,31,27,0.07)] outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </label>
  );
}
