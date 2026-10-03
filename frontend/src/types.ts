export type Msg = {
  role: "user" | "assistant";
  content: string;
  tool?: string | null;
  error?: string;
};