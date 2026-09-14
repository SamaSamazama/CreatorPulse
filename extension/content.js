(function() {
  'use strict';

  const API_BASE = 'http://localhost:3000';
  const VERCEL_URL = 'https://my-creator-pulse.vercel.app';
  let sidebarVisible = false;
  let sidebar = null;
  let overlayVisible = false;
  let overlay = null;

  function getApiBase() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? API_BASE
      : VERCEL_URL;
  }

  async function getApiKey() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['apiKey'], (result) => {
        resolve(result.apiKey || null);
      });
    });
  }

  async function fetchWithAuth(endpoint, options = {}) {
    const apiKey = await getApiKey();
    if (!apiKey) throw new Error('No API key');
    const base = getApiBase();
    const res = await fetch(`${base}${endpoint}`, {
      ...options,
      headers: {
        'X-API-Key': apiKey,
        ...options.headers,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function createSidebar() {
    sidebar = document.createElement('div');
    sidebar.id = 'creatorpulse-sidebar';
    sidebar.innerHTML = `
      <div id="cp-sidebar-header">
        <div class="cp-logo">CreatorPulse</div>
        <button id="cp-toggle-btn">−</button>
      </div>
      <div id="cp-sidebar-content">
        <div id="cp-auth-section">
          <p class="cp-status">Not connected</p>
          <button id="cp-connect-btn" class="cp-btn cp-btn-primary">Connect</button>
        </div>
        <div id="cp-dashboard" style="display:none;">
          <div class="cp-stats">
            <div class="cp-stat">
              <span class="cp-stat-label">Subscribers</span>
              <span class="cp-stat-value" id="cp-subs">0</span>
            </div>
            <div class="cp-stat">
              <span class="cp-stat-label">Views</span>
              <span class="cp-stat-value" id="cp-views">0</span>
            </div>
            <div class="cp-stat">
              <span class="cp-stat-label">Videos</span>
              <span class="cp-stat-value" id="cp-videos">0</span>
            </div>
          </div>
          <div class="cp-actions">
            <button id="cp-sync-btn" class="cp-btn cp-btn-secondary">Sync Now</button>
            <button id="cp-refresh-btn" class="cp-btn cp-btn-secondary">Refresh</button>
          </div>
          <div id="cp-video-list"></div>
          <button id="cp-overlay-btn" class="cp-btn cp-btn-primary" style="margin-top:12px;">Show on YouTube</button>
        </div>
      </div>
    `;
    document.body.appendChild(sidebar);
    attachSidebarListeners();
  }

  function createOverlay() {
    if (document.getElementById('creatorpulse-overlay')) return;
    overlay = document.createElement('div');
    overlay.id = 'creatorpulse-overlay';
    overlay.innerHTML = `
      <div id="cp-overlay-header">
        <div class="cp-logo">CreatorPulse</div>
        <button id="cp-overlay-close">×</button>
      </div>
      <div id="cp-overlay-content">
        <div id="cp-video-stats"></div>
        <div id="cp-ai-suggestions"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    attachOverlayListeners();
  }

  function attachOverlayListeners() {
    document.getElementById('cp-overlay-close')?.addEventListener('click', () => {
      overlayVisible = false;
      overlay.style.display = 'none';
    });
  }

  async function loadOverlay() {
    if (!overlay) createOverlay();
    try {
      const videoId = new URLSearchParams(window.location.search).get('v');
      if (!videoId) return;
      const data = await fetchWithAuth(`/api/public/v1/videos?videoId=${videoId}`);
      const video = data.videos?.[0];
      if (!video) return;
      overlayVisible = true;
      overlay.style.display = 'block';
      document.getElementById('cp-video-stats').innerHTML = `
        <div class="cp-stat"><span class="cp-stat-label">Views</span><span class="cp-stat-value">${(video.viewCount || 0).toLocaleString()}</span></div>
        <div class="cp-stat"><span class="cp-stat-label">Likes</span><span class="cp-stat-value">${(video.likeCount || 0).toLocaleString()}</span></div>
      `;
    } catch (e) {
      console.error('CreatorPulse overlay error:', e);
    }
  }

  function attachSidebarListeners() {
    document.getElementById('cp-toggle-btn')?.addEventListener('click', () => {
      sidebarVisible = !sidebarVisible;
      document.getElementById('cp-sidebar-content').style.display = sidebarVisible ? 'block' : 'none';
      document.getElementById('cp-toggle-btn').textContent = sidebarVisible ? '−' : '+';
    });

    document.getElementById('cp-connect-btn')?.addEventListener('click', async () => {
      const apiKey = await getApiKey();
      if (!apiKey) {
        const key = prompt('Enter your CreatorPulse API key:');
        if (key) {
          await new Promise(resolve => chrome.storage.local.set({ apiKey: key }, resolve));
          document.getElementById('cp-connect-btn').textContent = 'Load Dashboard';
          loadDashboard();
        }
      } else {
        loadDashboard();
      }
    });

    document.getElementById('cp-sync-btn')?.addEventListener('click', async () => {
      try {
        await fetchWithAuth('/api/sync', { method: 'POST' });
        await loadDashboard();
      } catch (e) {
        console.error('CreatorPulse sync error:', e);
      }
    });

    document.getElementById('cp-refresh-btn')?.addEventListener('click', () => loadDashboard());

    document.getElementById('cp-overlay-btn')?.addEventListener('click', () => {
      loadOverlay();
    });
  }

  async function loadDashboard() {
    try {
      const data = await fetchWithAuth('/api/public/v1/channel');
      const channels = data.channels || [];
      if (!channels.length) {
        document.getElementById('cp-auth-section').style.display = 'block';
        document.getElementById('cp-dashboard').style.display = 'none';
        document.querySelector('#cp-auth-section .cp-status').textContent = 'No channels connected';
        return;
      }
      document.getElementById('cp-auth-section').style.display = 'none';
      document.getElementById('cp-dashboard').style.display = 'block';
      const channel = channels[0];
      document.getElementById('cp-subs').textContent = (channel.subscriberCount || 0).toLocaleString();
      document.getElementById('cp-views').textContent = (channel.viewCount || 0).toLocaleString();
      document.getElementById('cp-videos').textContent = (channel.videoCount || 0).toLocaleString();
      const videoList = document.getElementById('cp-video-list');
      if (data.videos?.length) {
        videoList.innerHTML = '<div class="cp-video-header">Recent Videos</div>' +
          data.videos.slice(0, 5).map(v => `
            <div class="cp-video-item">
              <div class="cp-video-title" title="${v.title}">${v.title}</div>
              <div class="cp-video-views">${(v.viewCount || 0).toLocaleString()} views</div>
            </div>
          `).join('');
      } else {
        videoList.innerHTML = '';
      }
    } catch (e) {
      console.error('CreatorPulse dashboard error:', e);
      document.getElementById('cp-auth-section').style.display = 'block';
      document.getElementById('cp-dashboard').style.display = 'none';
      document.querySelector('#cp-auth-section .cp-status').textContent = 'Error loading data';
    }
  }

  function init() {
    if (document.getElementById('creatorpulse-sidebar')) return;
    createSidebar();
    getApiKey().then(token => {
      if (token) {
        document.querySelector('#cp-auth-section .cp-status').textContent = 'Connected';
        document.getElementById('cp-connect-btn').textContent = 'Load Dashboard';
        loadDashboard();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
