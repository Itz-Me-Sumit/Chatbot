import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Msg } from "../types";

const TOOL_LABELS: Record<string, string> = {
  web_search: "Web par search kar raha hu...",
  current_datetime: "Date aur time check kar raha hu...",
};

function Avatar() {
  return (
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent to-violet-500 text-white">
      <svg
        width="15"
        height="15"
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
  );
}

export default function ChatMessage({
  msg,
  pending,
}: {
  msg: Msg;
  pending: boolean;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[15px] leading-relaxed text-white md:max-w-[80%]">
          {msg.content}
        </div>
      </div>
    );
  }

  const waiting = pending && !msg.content && !msg.tool && !msg.error;

  return (
    <div className="flex items-start gap-2.5">
      <Avatar />
      <div className="min-w-0 max-w-[88%] rounded-2xl rounded-tl-md border border-line bg-panel px-4 py-3 text-[15px] text-text md:max-w-[80%]">
        {msg.tool && (
          <div className={`flex items-center gap-2 text-sm text-muted ${msg.content ? "mb-2" : ""}`}>
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            {TOOL_LABELS[msg.tool] ?? `${msg.tool} chal raha hai...`}
          </div>
        )}

        {waiting && (
          <div className="flex items-center gap-1 py-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted" />
            <span
              className="h-2 w-2 animate-bounce rounded-full bg-muted"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-2 w-2 animate-bounce rounded-full bg-muted"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        )}

        {msg.content && (
          <div className="md break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        )}

        {msg.error && (
          <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {msg.error}
          </p>
        )}
      </div>
    </div>
  );
}