function getApiBaseUrl() {
  const configured = process.env.API_BASE_URL;

  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

module.exports = {
  getApiBaseUrl,
};
