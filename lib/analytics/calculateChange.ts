export function calculateChange(current: number, previous: number) {
  // Both periods have no value
  if (previous === 0 && current === 0) {
    return {
      change: 0,
      trend: "neutral",
    };
  }

  // No previous value, but there is a current value.
  // Percentage growth from zero is mathematically undefined,
  // but +100% is useful for dashboard presentation.
  if (previous === 0 && current > 0) {
    return {
      change: 100,
      trend: "up",
    };
  }

  // Previous value existed, but current value is now zero.
  // That is a complete decline.
  if (previous > 0 && current === 0) {
    return {
      change: -100,
      trend: "down",
    };
  }

  const change = Number((((current - previous) / previous) * 100).toFixed(1));

  return {
    change,
    trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  };
}
