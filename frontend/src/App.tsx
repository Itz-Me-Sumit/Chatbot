import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteConversation,
  getMessages,
  listConversations,
  renameConversation,
  streamChat,
} from "./api";
import type { Conversation } from "./api";
import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";
import Sidebar from "./components/Sidebar";
import Welcome from "./components/Welcome";
import type { Msg } from "./types";

export default function App() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const runRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshList = useCallback(async () => {
    try {
      setConversations(await listConversations());
    } catch {
      /* sidebar baad me bhi refresh ho jaayega */
    }
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateLast = (fn: (m: Msg) => Msg) =>
    setMessages((prev) =>
      prev.length === 0
        ? prev
        : [...prev.slice(0, -1), fn(prev[prev.length - 1])]
    );

  const stopCurrent = () => {
    runRef.current++;
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
    refreshList();
  };

  const newChat = () => {
    stopCurrent();
    setThreadId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const selectChat = async (id: string) => {
    setSidebarOpen(false);
    if (id === threadId) return;
    stopCurrent();
    setThreadId(id);
    setMessages([]);
    try {
      const msgs = await getMessages(id);
      setMessages(msgs.map((m) => ({ role: m.role, content: m.content })));
    } catch {
      setMessages([
        { role: "assistant", content: "", error: "Chat load nahi ho payi." },
      ]);
    }
  };

  const rename = async (id: string, title: string) => {
    try {
      await renameConversation(id, title);
    } finally {
      refreshList();
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteConversation(id);
    } finally {
      if (id === threadId) newChat();
      else refreshList();
    }
  };

  const send = async (text: string) => {
    const run = ++runRef.current;
    const alive = () => runRef.current === run;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await streamChat(
        text,
        threadId,
        (e) => {
          if (!alive()) return;
          if (e.type === "start") {
            setThreadId(e.thread_id);
          } else if (e.type === "token") {
            updateLast((m) => ({
              ...m,
              content:
                m.content + (m.content === "" ? e.content.trimStart() : e.content),
            }));
          } else if (e.type === "tool_start") {
            updateLast((m) => ({ ...m, tool: e.name }));
          } else if (e.type === "tool_end") {
            updateLast((m) => ({ ...m, tool: null }));
          } else if (e.type === "error") {
            updateLast((m) => ({ ...m, tool: null, error: e.message }));
          }
        },
        ctrl.signal
      );
    } catch (err) {
      if (alive() && (err as Error).name !== "AbortError") {
        updateLast((m) => ({
          ...m,
          error: `Server se connect nahi ho paya. (${(err as Error).message})`,
        }));
      }
    } finally {
      if (alive()) {
        updateLast((m) => ({ ...m, tool: null }));
        setBusy(false);
        abortRef.current = null;
        refreshList();
      }
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-text">
      <Sidebar
        conversations={conversations}
        activeId={threadId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={selectChat}
        onNew={newChat}
        onRename={rename}
        onDelete={remove}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-line bg-panel/80 px-3 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur md:px-5">
          <button
            aria-label="Open chat history"
            className="rounded-lg p-2 text-muted hover:bg-panel-2 hover:text-text md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-accent to-violet-500 text-white">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold leading-tight">
                Chatbot
              </h1>
              <p className="truncate text-[11px] leading-tight text-muted sm:hidden">
                Built by Sumit
              </p>
            </div>
          </div>

          <div className="ml-auto hidden items-center gap-2 rounded-full border border-line bg-panel-2 px-3 py-1.5 text-xs text-muted sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>
              Built by <span className="font-medium text-text">Sumit</span>
              {" · "}Student from IIT Madras
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-5 px-3 py-5 md:px-4">
            {messages.length === 0 && <Welcome onPick={send} disabled={busy} />}
            {messages.map((m, i) => (
              <ChatMessage
                key={i}
                msg={m}
                pending={busy && i === messages.length - 1}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        </main>

        <div className="mx-auto w-full max-w-3xl">
          <ChatInput busy={busy} onSend={send} onStop={stopCurrent} />
        </div>
      </div>
    </div>
  );
}