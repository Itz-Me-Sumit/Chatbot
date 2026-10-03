import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Msg } from "../types";

const TOOL_LABELS: Record<string, string> = {
  web_search: "Web par search kar raha hu...",
  current_datetime: "Date aur time check kar raha hu...",
};

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
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-blue-600 px-4 py-2.5 text-white">
          {msg.content}
        </div>
      </div>
    );
  }

  const waiting = pending && !msg.content && !msg.tool && !msg.error;

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl bg-gray-100 px-4 py-2.5 text-gray-900">
        {msg.tool && (
          <p className="text-sm italic text-gray-500">
            {TOOL_LABELS[msg.tool] ?? `${msg.tool} chal raha hai...`}
          </p>
        )}
        {waiting && <p className="text-sm italic text-gray-500">Soch raha hu...</p>}
        {msg.content && (
          <div className="md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        )}
        {msg.error && <p className="mt-1 text-sm text-red-600">{msg.error}</p>}
      </div>
    </div>
  );
}