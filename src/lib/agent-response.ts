import { translations, type Locale } from "./i18n";

// Keyword bundles map (by index) to translations[locale].agent.canned[index].
// Keep aligned with `agent.canned` order in i18n.
export const AGENT_KEYWORDS = [
  ["order", "progress", "status", "订单", "进度", "狀態", "進度", "訂單"],
  ["wallet", "balance", "diamond", "shell", "钱包", "余额", "錢包", "餘額"],
  ["withdraw", "payout", "cash", "提现", "提現"],
  ["recommend", "creator", "find", "推荐", "創作者", "推薦", "创作者"],
  ["kyc", "verify", "identity", "认证", "身份", "認證"],
];

export type AgentReply = { a: string; link: { label: string; href: string } | null };

export function getAgentReply(prompt: string, locale: Locale): AgentReply {
  const lower = prompt.toLowerCase();
  const idx = AGENT_KEYWORDS.findIndex((kws) => kws.some((kw) => lower.includes(kw.toLowerCase())));
  const t = translations[locale];
  if (idx === -1) return { a: t.agent.fallback, link: null };
  return t.agent.canned[idx];
}
