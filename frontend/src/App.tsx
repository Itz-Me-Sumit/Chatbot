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
import type { Msg } from "./types";

export default function App() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [busy, setBusy] = useState(false);
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
    runRef.current++; // purani stream ke baaki updates ignore honge
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
    refreshList();
  };

  const newChat = () => {
    stopCurrent();
    setThreadId(null);
    setMessages([]);
  };

  const selectChat = async (id: string) => {
    if (id === threadId) return;
    stopCurrent();
    setThreadId(id);
    setMessages([]);
    try {
      const msgs = await getMessages(id);
      setMessages(msgs.map((m) => ({ role: m.role, content: m.content })));
    } catch {
      setMessages([{ role: "assistant", content: "", error: "Chat load nahi ho payi." }]);
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
    <div className="flex h-screen bg-white">
      <Sidebar
        conversations={conversations}
        activeId={threadId}
        onSelect={selectChat}
        onNew={newChat}
        onRename={rename}
        onDelete={remove}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <span className="font-semibold">Chatbot</span>
          <span className="text-sm text-gray-500">
            Built by <span className="font-medium text-gray-800">Sumit</span>
            {" · "}Student from IIT Madras
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
            {messages.length === 0 && (
              <p className="mt-20 text-center text-gray-400">
                Kuch bhi poocho, main yahi hu.
              </p>
            )}
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