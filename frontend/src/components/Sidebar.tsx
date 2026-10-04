import type { Conversation } from "../api";

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

const icon = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function Sidebar({
  conversations,
  activeId,
  open,
  onClose,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: Props) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-line bg-panel pt-[env(safe-area-inset-top)] transition-transform duration-200 md:static md:max-w-none md:translate-x-0 md:pt-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: brand + close (mobile) */}
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <span className="text-sm font-semibold tracking-wide text-text">
            Chat history
          </span>
          <button
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-muted hover:bg-panel-2 hover:text-text md:hidden"
            onClick={onClose}
          >
            <svg {...icon} width={20} height={20}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-3 pb-3">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
            onClick={onNew}
          >
            <svg {...icon}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </button>
        </div>

        <p className="px-4 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted">
          Recent
        </p>

        <nav className="flex-1 overflow-y-auto px-2 pb-3">
          {conversations.length === 0 && (
            <p className="px-2 py-3 text-sm text-muted">Abhi koi chat nahi hai.</p>
          )}
          {conversations.map((c) => {
            const active = c.thread_id === activeId;
            return (
              <div
                key={c.thread_id}
                className={`group flex items-center gap-1 rounded-lg px-2 ${
                  active ? "bg-panel-2" : "hover:bg-panel-2/60"
                }`}
              >
                <button
                  className={`min-w-0 flex-1 truncate py-2.5 text-left text-sm ${
                    active ? "text-white" : "text-text/80"
                  }`}
                  title={c.title}
                  onClick={() => onSelect(c.thread_id)}
                >
                  {c.title}
                </button>
                <button
                  aria-label="Rename chat"
                  className="rounded p-1.5 text-muted opacity-100 hover:text-text md:opacity-0 md:group-hover:opacity-100"
                  onClick={() => {
                    const t = window.prompt("Naya naam:", c.title);
                    if (t && t.trim()) onRename(c.thread_id, t.trim());
                  }}
                >
                  <svg {...icon}>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                <button
                  aria-label="Delete chat"
                  className="rounded p-1.5 text-muted opacity-100 hover:text-red-400 md:opacity-0 md:group-hover:opacity-100"
                  onClick={() => {
                    if (window.confirm("Ye chat delete kar du?"))
                      onDelete(c.thread_id);
                  }}
                >
                  <svg {...icon}>
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              </div>
            );
          })}
        </nav>

        {/* Branding card */}
        <div className="border-t border-line p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3 rounded-xl bg-panel-2 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent to-violet-500 text-sm font-bold text-white">
              S
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">Built by Sumit</p>
              <p className="truncate text-xs text-muted">Student from IIT Madras</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}