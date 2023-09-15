export const removeProtocolFromURL = (url: string) => {
  // Remove "http://" or "https://" if present
  return url.replace(/^(https?:\/\/)/, '');
};
