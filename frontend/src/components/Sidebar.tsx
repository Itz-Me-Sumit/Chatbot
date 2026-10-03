import type { Conversation } from "../api";

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-gray-50 md:flex">
      <div className="p-3">
        <button
          className="w-full rounded-xl bg-blue-600 px-3 py-2 text-white"
          onClick={onNew}
        >
          + New chat
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 && (
          <p className="px-2 text-sm text-gray-400">Abhi koi chat nahi hai.</p>
        )}
        {conversations.map((c) => (
          <div
            key={c.thread_id}
            className={`group flex items-center gap-2 rounded-lg px-2 py-2 ${
              c.thread_id === activeId ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            <button
              className="flex-1 truncate text-left text-sm"
              title={c.title}
              onClick={() => onSelect(c.thread_id)}
            >
              {c.title}
            </button>
            <button
              className="hidden text-xs text-gray-500 hover:text-gray-900 group-hover:block"
              onClick={() => {
                const t = window.prompt("Naya naam:", c.title);
                if (t && t.trim()) onRename(c.thread_id, t.trim());
              }}
            >
              Rename
            </button>
            <button
              className="hidden text-xs text-red-500 hover:text-red-700 group-hover:block"
              onClick={() => {
                if (window.confirm("Ye chat delete kar du?")) onDelete(c.thread_id);
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}