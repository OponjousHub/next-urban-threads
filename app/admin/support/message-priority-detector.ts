export function detectSupportIntent(message: string) {
  const text = message.toLowerCase();

  let priority: "LOW" | "NORMAL" | "HIGH" = "NORMAL";
  let tag: "BUG" | "ORDER" | "REFUND" | "GENERAL" = "GENERAL";

  // 🔥 Priority detection
  if (
    text.includes("urgent") ||
    text.includes("asap") ||
    text.includes("not working") ||
    text.includes("error") ||
    text.includes("broken") ||
    text.includes("down")
  ) {
    priority = "HIGH";
  }

  if (text.includes("help") || text.includes("issue")) {
    priority = "NORMAL";
  }

  // 🏷 Tag detection
  if (text.includes("refund") || text.includes("money back")) {
    tag = "REFUND";
  } else if (text.includes("order") || text.includes("delivery")) {
    tag = "ORDER";
  } else if (
    text.includes("bug") ||
    text.includes("error") ||
    text.includes("broken")
  ) {
    tag = "BUG";
  }

  return { priority, tag };
}
