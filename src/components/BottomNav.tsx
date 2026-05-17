export type AppView = "dashboard" | "update" | "reserves" | "history" | "settings";

const navItems: { id: AppView; label: string; icon: string }[] = [
  { id: "dashboard", label: "Home", icon: "H" },
  { id: "update", label: "Update", icon: "+" },
  { id: "reserves", label: "Reserves", icon: "R" },
  { id: "history", label: "History", icon: "=" },
  { id: "settings", label: "Settings", icon: "*" },
];

export function BottomNav({
  activeView,
  onChange,
}: {
  activeView: AppView;
  onChange: (view: AppView) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 px-3 pb-4 pt-2 md:absolute">
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
        {navItems.map((item) => {
          const active = activeView === item.id;

          return (
            <button
              aria-current={active ? "page" : undefined}
              className={`flex h-14 flex-col items-center justify-center rounded-lg text-xs font-black transition ${
                active
                  ? "bg-[#171b18] text-[#d9f8d6] shadow-[0_10px_24px_rgba(23,27,24,0.18)]"
                  : "bg-white/55 text-stone-600 ring-1 ring-black/5 hover:bg-white hover:text-stone-950"
              }`}
              key={item.id}
              onClick={() => onChange(item.id)}
              type="button"
            >
              <span aria-hidden className="text-lg leading-none">
                {item.icon}
              </span>
              <span className="mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
