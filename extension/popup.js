const API_BASE = 'http://localhost:3000';
const VERCEL_URL = 'https://my-creator-pulse.vercel.app';

function getApiBase() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? API_BASE
    : VERCEL_URL;
}

async function getApiKey() {
  const result = await chrome.storage.local.get(['apiKey']);
  return result.apiKey || null;
}

async function loadDashboard() {
  const apiKey = await getApiKey();
  if (!apiKey) {
    document.getElementById('status').textContent = 'No API key set';
    document.getElementById('connectBtn').textContent = 'Set API Key';
    document.getElementById('dashboard').classList.add('hidden');
    return;
  }
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/api/public/v1/channel`, {
      headers: { 'X-API-Key': apiKey },
    });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    const channels = data.channels || [];
    if (!channels.length) {
      document.getElementById('status').textContent = 'No channels connected';
      document.getElementById('dashboard').classList.add('hidden');
      return;
    }
    const channel = channels[0];
    document.getElementById('status').textContent = channel.title;
    document.getElementById('subs').textContent = (channel.subscriberCount || 0).toLocaleString();
    document.getElementById('views').textContent = (channel.viewCount || 0).toLocaleString();
    document.getElementById('videos').textContent = (channel.videoCount || 0).toLocaleString();
    document.getElementById('dashboard').classList.remove('hidden');
  } catch (e) {
    console.error('CreatorPulse popup error:', e);
    document.getElementById('status').textContent = 'Error loading data';
  }
}

document.getElementById('connectBtn').addEventListener('click', async () => {
  const apiKey = await getApiKey();
  if (!apiKey) {
    const key = prompt('Enter your CreatorPulse API key:');
    if (key) {
      await chrome.storage.local.set({ apiKey: key });
      document.getElementById('connectBtn').textContent = 'Connect';
      loadDashboard();
    }
  } else {
    loadDashboard();
  }
});

document.getElementById('syncBtn').addEventListener('click', async () => {
  const apiKey = await getApiKey();
  if (!apiKey) return;
  const base = getApiBase();
  await fetch(`${base}/api/sync`, {
    method: 'POST',
    headers: { 'X-API-Key': apiKey },
  });
  loadDashboard();
});

document.getElementById('openAppBtn').addEventListener('click', () => {
  const base = getApiBase();
  chrome.tabs.create({ url: `${base}/dashboard` });
});

loadDashboard();
