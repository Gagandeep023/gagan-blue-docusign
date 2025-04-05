const fetch = require('node-fetch').default;

const getManifest = async (manifestUrl) => {
  return await loadManifest(manifestUrl);
};

const loadManifest = async (manifestUrl) => {
  const response = await fetch(manifestUrl);
  const manifest = await response.json();

  if (!manifest) {
    throw new Error('Manifest is not valid!');
  }

  return manifest;
};

module.exports = { getManifest };
