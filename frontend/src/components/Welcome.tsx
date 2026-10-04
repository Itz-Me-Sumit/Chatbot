const SUGGESTIONS = [
  "Aaj ki top tech news kya hai?",
  "Python me list aur tuple ka difference batao",
  "LangGraph kya hai? Simple me samjhao",
  "Mere liye ek weekly study plan banao",
];

export default function Welcome({
  onPick,
  disabled,
}: {
  onPick: (text: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="mt-10 flex flex-col items-center text-center md:mt-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-violet-500 text-white shadow-lg shadow-accent/30">
        <svg
          width="26"
          height="26"
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
      <h2 className="mt-5 text-2xl font-semibold">Namaste! Main kya madad karu?</h2>
      <p className="mt-2 max-w-md text-sm text-muted">
        Sawal poocho, code likhwao ya web par kuch search karwao. Main Hindi, Hinglish aur English teeno me baat kar sakta hu.
      </p>

      <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            disabled={disabled}
            onClick={() => onPick(s)}
            className="rounded-xl border border-line bg-panel p-3.5 text-left text-sm text-text/90 transition hover:border-accent/60 hover:bg-panel-2 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted">
        Built by <span className="font-medium text-text">Sumit</span>
        {" · "}Student from IIT Madras
      </p>
    </div>
  );
}