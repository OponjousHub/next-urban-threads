function formatDate(dateString: string | null) {
  if (!dateString) return "Never";

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default formatDate;
