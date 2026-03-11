// export function calculateChange(current: number, previous: number) {
//   if (previous === 0 && current === 0) {
//     return { change: 0, trend: "neutral" };
//   }

//   if (previous === 0 && current > 0) {
//     return { change: 100, trend: "up" };
//   }

//   if (previous > 0 && current === 0) {
//     return { change: -100, trend: "down" };
//   }

//   const change = Number((((current - previous) / previous) * 100).toFixed(1));

//   return {
//     change,
//     trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
//   };
// }
export function calculateChange(current: number, previous: number) {
  if (previous === 0 && current === 0) {
    return { change: 0, trend: "neutral" };
  }

  if (previous === 0 && current > 0) {
    return { change: 100, trend: "up" };
  }

  if (previous > 0 && current === 0) {
    return { change: 0, trend: "neutral" }; // changed
  }

  const change = Number((((current - previous) / previous) * 100).toFixed(1));

  return {
    change,
    trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  };
}
