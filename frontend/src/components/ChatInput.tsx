import { useEffect, useRef, useState } from "react";

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
  const ref = useRef<HTMLTextAreaElement>(null);

  // Text ke hisaab se height badhao (max 160px)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || busy) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className="px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 md:px-4">
      <div className="flex items-end gap-2 rounded-2xl border border-line bg-panel-2 p-2 transition focus-within:border-accent">
        <textarea
          ref={ref}
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-base text-text outline-none placeholder:text-muted"
          rows={1}
          placeholder="Message likho..."
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
            aria-label="Stop"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/90 text-white transition hover:bg-red-500"
            onClick={onStop}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            aria-label="Send"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            onClick={submit}
            disabled={!value.trim()}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted">
        Enter = send, Shift+Enter = nayi line. AI se galti ho sakti hai, zaroori baat check kar lena.
      </p>
    </div>
  );
}