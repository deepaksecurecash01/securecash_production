if (
  err.message.includes("Invalid email") ||
  err.message.includes("Unsubscribed Address") ||
  err.response?.status === 400 ||
  err.response?.status === 401 ||
  err.response?.status === 403 ||
  err.message.toLowerCase().includes("unauthorized") ||
  err.message.toLowerCase().includes("forbidden")
) {
  break;
}
