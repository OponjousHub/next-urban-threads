export function formatNotificationTime(date: Date | string) {
  const now = new Date();
  const value = new Date(date);

  const diff = now.getTime() - value.getTime();

  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return value.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
