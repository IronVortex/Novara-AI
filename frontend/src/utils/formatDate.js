export const formatDate = (value) => {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export const truncateText = (text, limit = 42) => {
  if (!text) return "New conversation";
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}…`;
};

export const scrollToBottom = (element) => {
  if (element) {
    element.scrollTop = element.scrollHeight;
  }
};
