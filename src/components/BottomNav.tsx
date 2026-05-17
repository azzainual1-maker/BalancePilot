import type { ReactNode } from "react";

export type AppView = "dashboard" | "update" | "reserves" | "history" | "settings";

const navItems: { id: AppView; label: string; icon: (active: boolean) => ReactNode }[] = [
  { id: "dashboard", label: "Home", icon: HomeIcon },
  { id: "update", label: "Update", icon: PlusIcon },
  { id: "reserves", label: "Reserves", icon: ShieldIcon },
  { id: "history", label: "History", icon: ListIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
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
              className={`flex h-14 min-w-0 flex-col items-center justify-center rounded-lg px-1 text-[11px] font-black leading-none transition ${
                active
                  ? "bg-[#171b18] text-[#d9f8d6] shadow-[0_10px_24px_rgba(23,27,24,0.18)]"
                  : "bg-white/55 text-stone-600 ring-1 ring-black/5 hover:bg-white hover:text-stone-950"
              }`}
              key={item.id}
              onClick={() => onChange(item.id)}
              type="button"
            >
              <span aria-hidden className="flex h-5 w-5 items-center justify-center">
                {item.icon(active)}
              </span>
              <span className="mt-1 max-w-full truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function IconBase({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <svg
      className={active ? "text-[#d9f8d6]" : "text-stone-600"}
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
      width="20"
    >
      {children}
    </svg>
  );
}

function HomeIcon(active: boolean) {
  return (
    <IconBase active={active}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
      <path d="M10 20v-5h4v5" />
    </IconBase>
  );
}

function PlusIcon(active: boolean) {
  return (
    <IconBase active={active}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </IconBase>
  );
}

function ShieldIcon(active: boolean) {
  return (
    <IconBase active={active}>
      <path d="M12 3 19 6v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
      <path d="M9.5 12.2 11.4 14l3.6-4" />
    </IconBase>
  );
}

function ListIcon(active: boolean) {
  return (
    <IconBase active={active}>
      <path d="M8 6h11" />
      <path d="M8 12h11" />
      <path d="M8 18h11" />
      <path d="M4.5 6h.01" />
      <path d="M4.5 12h.01" />
      <path d="M4.5 18h.01" />
    </IconBase>
  );
}

function SettingsIcon(active: boolean) {
  return (
    <IconBase active={active}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2" />
      <path d="M12 19v2" />
      <path d="m4.9 4.9 1.4 1.4" />
      <path d="m17.7 17.7 1.4 1.4" />
      <path d="M3 12h2" />
      <path d="M19 12h2" />
      <path d="m4.9 19.1 1.4-1.4" />
      <path d="m17.7 6.3 1.4-1.4" />
    </IconBase>
  );
}
