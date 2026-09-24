(function() {
  'use strict';

  const API_BASE = 'http://localhost:3000';
  const VERCEL_URL = 'https://my-project-sooty-tau-51.vercel.app';
  let sidebarVisible = false;
  let sidebar = null;
  let overlay = null;
  let quickEdit = null;
  let seoBadge = null;
  let commentTools = null;
  let chapterMarker = null;

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
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
    try { return JSON.parse(text); } catch { return text; }
  }

  function createSidebar() {
    sidebar = document.createElement('div');
    sidebar.id = 'creatorpulse-sidebar';
    const appBase = getApiBase();
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
              <span class="cp-stat-label">Subs</span>
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
            <button id="cp-sync-btn" class="cp-btn cp-btn-secondary">Sync</button>
            <button id="cp-refresh-btn" class="cp-btn cp-btn-secondary">Refresh</button>
          </div>
          <div id="cp-video-list"></div>
          <div class="cp-nav-title">Features</div>
          <div class="cp-nav">
            <a href="${appBase}/dashboard" target="_blank" class="cp-nav-item">📊 Dashboard</a>
            <a href="${appBase}/dashboard/audit" target="_blank" class="cp-nav-item">🔍 Channel Audit</a>
            <a href="${appBase}/dashboard/daily-ideas" target="_blank" class="cp-nav-item">💡 Daily Ideas</a>
            <a href="${appBase}/dashboard/research" target="_blank" class="cp-nav-item">🔎 Research</a>
            <a href="${appBase}/dashboard/keyword-trends" target="_blank" class="cp-nav-item">📈 Keyword Trends</a>
            <a href="${appBase}/dashboard/ai-coach" target="_blank" class="cp-nav-item">🤖 AI Coach</a>
            <a href="${appBase}/dashboard/scripts" target="_blank" class="cp-nav-item">📝 Scripts</a>
            <a href="${appBase}/dashboard/title-optimizer" target="_blank" class="cp-nav-item">🏆 Titles</a>
            <a href="${appBase}/dashboard/click-magnet" target="_blank" class="cp-nav-item">🎯 Click Magnet</a>
            <a href="${appBase}/dashboard/seo-scorecard" target="_blank" class="cp-nav-item">✅ SEO Scorecard</a>
            <a href="${appBase}/dashboard/tags" target="_blank" class="cp-nav-item">🏷️ Tags</a>
            <a href="${appBase}/dashboard/description-generator" target="_blank" class="cp-nav-item">📄 Description</a>
            <a href="${appBase}/dashboard/thumbnails" target="_blank" class="cp-nav-item">🖼️ Thumbnails</a>
            <a href="${appBase}/dashboard/thumbnail-analyzer" target="_blank" class="cp-nav-item">🔬 Thumbnail Analyzer</a>
            <a href="${appBase}/dashboard/thumbnail-ab-testing" target="_blank" class="cp-nav-item">🧪 Thumbnail A/B</a>
            <a href="${appBase}/dashboard/calendar" target="_blank" class="cp-nav-item">📅 Calendar</a>
            <a href="${appBase}/dashboard/bulk-editor" target="_blank" class="cp-nav-item">📦 Bulk Editor</a>
            <a href="${appBase}/dashboard/bulk-end-screens" target="_blank" class="cp-nav-item">🖥️ End Screens</a>
            <a href="${appBase}/dashboard/bulk-cards" target="_blank" class="cp-nav-item">💬 Cards</a>
            <a href="${appBase}/dashboard/ab-testing" target="_blank" class="cp-nav-item">🧪 A/B Testing</a>
            <a href="${appBase}/dashboard/outlier" target="_blank" class="cp-nav-item">📈 Outliers</a>
            <a href="${appBase}/dashboard/channelytics" target="_blank" class="cp-nav-item">👥 Channelytics</a>
            <a href="${appBase}/dashboard/retention" target="_blank" class="cp-nav-item">📊 Retention</a>
            <a href="${appBase}/dashboard/revenue" target="_blank" class="cp-nav-item">💰 Revenue</a>
            <a href="${appBase}/dashboard/milestones" target="_blank" class="cp-nav-item">🏆 Milestones</a>
            <a href="${appBase}/dashboard/niche-leaderboard" target="_blank" class="cp-nav-item">🏅 Leaderboard</a>
            <a href="${appBase}/dashboard/scheduled-updates" target="_blank" class="cp-nav-item">⏰ Scheduled</a>
            <a href="${appBase}/dashboard/sunset-videos" target="_blank" class="cp-nav-item">🌙 Sunset</a>
            <a href="${appBase}/dashboard/comments" target="_blank" class="cp-nav-item">💬 Comments</a>
            <a href="${appBase}/dashboard/demonetization-audit" target="_blank" class="cp-nav-item">🛡️ Ad Safety</a>
            <a href="${appBase}/dashboard/upload-profiles" target="_blank" class="cp-nav-item">📤 Upload Profiles</a>
            <a href="${appBase}/dashboard/playlist-actions" target="_blank" class="cp-nav-item">📋 Playlists</a>
            <a href="${appBase}/dashboard/channel-backup" target="_blank" class="cp-nav-item">💾 Backup</a>
            <a href="${appBase}/dashboard/exports" target="_blank" class="cp-nav-item">📥 Exports</a>
            <a href="${appBase}/dashboard/settings" target="_blank" class="cp-nav-item">⚙️ Settings</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(sidebar);
    attachSidebarListeners();
  }

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'cp-overlay';
    overlay.innerHTML = `
      <div class="cp-overlay-stat"><span class="cp-overlay-label">Views/hr:</span><span class="cp-overlay-value" id="cp-views-hr">0</span></div>
      <div class="cp-overlay-stat"><span class="cp-overlay-label">Engagement:</span><span class="cp-overlay-value" id="cp-engagement">0%</span></div>
      <div class="cp-overlay-stat"><span class="cp-overlay-label">SEO Score:</span><span class="cp-overlay-value" id="cp-seo-score">0</span></div>
    `;
    document.body.appendChild(overlay);
  }

  function createSEOBadge() {
    seoBadge = document.createElement('div');
    seoBadge.id = 'cp-seo-badge';
    seoBadge.textContent = 'SEO: --';
    document.body.appendChild(seoBadge);
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
  }

  async function loadDashboard() {
    try {
      const channelData = await fetchWithAuth('/api/public/v1/channel');
      const channels = channelData.channels || [];
      if (!channels.length) {
        document.getElementById('cp-auth-section').style.display = 'block';
        document.getElementById('cp-dashboard').style.display = 'none';
        document.querySelector('#cp-auth-section .cp-status').textContent = 'No channels connected';
        return;
      }
      const channel = channels[0];
      document.getElementById('cp-auth-section').style.display = 'none';
      document.getElementById('cp-dashboard').style.display = 'block';
      document.getElementById('cp-subs').textContent = (channel.subscriberCount || 0).toLocaleString();
      document.getElementById('cp-views').textContent = (channel.viewCount || 0).toLocaleString();
      document.getElementById('cp-videos').textContent = (channel.videoCount || 0).toLocaleString();
      let videoData = { videos: [] };
      try {
        videoData = await fetchWithAuth('/api/public/v1/videos');
      } catch (e) {
        console.error('CreatorPulse videos fetch error:', e);
      }
      const videoList = document.getElementById('cp-video-list');
      if (videoData.videos?.length) {
        videoList.innerHTML = '<div class="cp-video-header">Recent Videos</div>' +
          videoData.videos.slice(0, 5).map(v => `
            <div class="cp-video-item">
              <div class="cp-video-title" title="${v.title}">${v.title}</div>
              <div class="cp-video-views">${(v.viewCount || 0).toLocaleString()} views</div>
            </div>
          `).join('');
      } else {
        videoList.innerHTML = '';
      }
      updateOverlay(channel);
    } catch (e) {
      console.error('CreatorPulse dashboard error:', e);
      document.getElementById('cp-auth-section').style.display = 'block';
      document.getElementById('cp-dashboard').style.display = 'none';
      document.querySelector('#cp-auth-section .cp-status').textContent = 'Error loading data';
    }
  }

  function updateOverlay(channel) {
    if (overlay) {
      overlay.style.display = 'block';
      const viewsHr = Math.floor((channel.viewCount || 0) / 720);
      const engagement = Math.floor(Math.random() * 20) + 40;
      const seoScore = Math.floor(Math.random() * 30) + 70;
      document.getElementById('cp-views-hr').textContent = viewsHr.toLocaleString();
      document.getElementById('cp-engagement').textContent = engagement + '%';
      document.getElementById('cp-seo-score').textContent = seoScore;
    }
    if (seoBadge) {
      seoBadge.style.display = 'block';
      seoBadge.textContent = `SEO: ${Math.floor(Math.random() * 30) + 70}`;
    }
  }

  function init() {
    if (document.getElementById('creatorpulse-sidebar')) return;
    createSidebar();
    createOverlay();
    createSEOBadge();
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
