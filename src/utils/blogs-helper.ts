// Helper function to strip HTML tags
export const stripHtml = (html: string) => {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, "");
  return text.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (s) => {
    switch (s) {
      case "&nbsp;":
        return " ";
      case "&amp;":
        return "&";
      case "&lt;":
        return "<";
      case "&gt;":
        return ">";
      case "&quot;":
        return '"';
      case "&#39;":
        return "'";
      default:
        return s;
    }
  });
};
