import { useState } from "react";

export default function ChatInput({
  busy,
  onSend,
  onStop,
}: {
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text || busy) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className="flex items-end gap-2 border-t border-gray-200 bg-white p-3">
      <textarea
        className="max-h-40 flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
        rows={1}
        placeholder="Message likho... (Enter = send, Shift+Enter = nayi line)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      {busy ? (
        <button
          className="rounded-xl bg-red-600 px-4 py-2 text-white"
          onClick={onStop}
        >
          Stop
        </button>
      ) : (
        <button
          className="rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={submit}
          disabled={!value.trim()}
        >
          Send
        </button>
      )}
    </div>
  );
}