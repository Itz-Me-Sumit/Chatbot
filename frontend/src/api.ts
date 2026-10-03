export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export type StreamEvent =
  | { type: "start"; thread_id: string }
  | { type: "token"; content: string }
  | { type: "tool_start"; name: string }
  | { type: "tool_end"; name: string }
  | { type: "error"; message: string }
  | { type: "done" };

export async function streamChat(
  message: string,
  threadId: string | null,
  onEvent: (e: StreamEvent) => void,
  signal?: AbortSignal
) {
  const res = await fetch(`${API_URL}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, thread_id: threadId }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Har SSE event "\n\n" par khatam hota hai
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      let event = "message";
      let data = "";
      for (const line of part.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;
      onEvent({ type: event, ...JSON.parse(data) } as StreamEvent);
    }
  }
}


export type Conversation = {
  thread_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export async function listConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_URL}/api/conversations`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getMessages(
  threadId: string
): Promise<{ role: "user" | "assistant"; content: string }[]> {
  const res = await fetch(
    `${API_URL}/api/conversations/${encodeURIComponent(threadId)}/messages`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.messages;
}

export async function renameConversation(threadId: string, title: string) {
  const res = await fetch(
    `${API_URL}/api/conversations/${encodeURIComponent(threadId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function deleteConversation(threadId: string) {
  const res = await fetch(
    `${API_URL}/api/conversations/${encodeURIComponent(threadId)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}