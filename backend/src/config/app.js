function stripTrailingSlash(value) {
  return value.replace(/\/$/, '');
}

function getApiBaseUrl() {
  const configured = process.env.API_BASE_URL;

  if (configured) {
    return stripTrailingSlash(configured);
  }

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

function getClientOrigin() {
  const configured = process.env.CLIENT_ORIGIN;

  if (configured) {
    return stripTrailingSlash(configured);
  }

  return 'http://localhost:3000';
}

module.exports = {
  getApiBaseUrl,
  getClientOrigin,
};
