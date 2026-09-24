(function() {
  'use strict';

  const API_BASE = 'http://localhost:3000';
  const VERCEL_URL = 'https://my-project-sooty-tau-51.vercel.app';

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

  function createQuickEditToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'cp-quick-edit-toolbar';
    toolbar.innerHTML = `
      <div class="cp-toolbar-header">
        <span class="cp-toolbar-title">CreatorPulse</span>
        <button id="cp-toolbar-toggle" class="cp-toolbar-toggle">−</button>
      </div>
      <div class="cp-toolbar-content" id="cp-toolbar-content">
        <div class="cp-toolbar-section">
          <div class="cp-toolbar-section-title">Quick Actions</div>
          <button class="cp-toolbar-btn" id="cp-optimize-title">✨ Optimize Title</button>
          <button class="cp-toolbar-btn" id="cp-generate-description">📝 Generate Description</button>
          <button class="cp-toolbar-btn" id="cp-suggest-tags">🏷️ Suggest Tags</button>
          <button class="cp-toolbar-btn" id="cp-analyze-thumbnail">🔬 Analyze Thumbnail</button>
        </div>
        <div class="cp-toolbar-section">
          <div class="cp-toolbar-section-title">SEO Score</div>
          <div class="cp-seo-score" id="cp-seo-score">--</div>
          <div class="cp-seo-bar"><div class="cp-seo-fill" id="cp-seo-fill"></div></div>
        </div>
        <div class="cp-toolbar-section">
          <div class="cp-toolbar-section-title">Upload Profiles</div>
          <select id="cp-upload-profile" class="cp-toolbar-select">
            <option value="">Select profile...</option>
          </select>
          <button class="cp-toolbar-btn" id="cp-apply-profile">Apply Profile</button>
        </div>
        <div class="cp-toolbar-section">
          <div class="cp-toolbar-section-title">Bulk Operations</div>
          <button class="cp-toolbar-btn" id="cp-bulk-end-screens">🖥️ End Screens</button>
          <button class="cp-toolbar-btn" id="cp-bulk-cards">💬 Cards</button>
        </div>
      </div>
    `;
    document.body.appendChild(toolbar);
    attachToolbarListeners();
  }

  function createCommentTools() {
    const tools = document.createElement('div');
    tools.id = 'cp-comment-tools';
    tools.innerHTML = `
      <div class="cp-comment-header">
        <span class="cp-comment-title">CreatorPulse Comments</span>
        <button id="cp-comment-toggle" class="cp-comment-toggle">×</button>
      </div>
      <div class="cp-comment-content" id="cp-comment-content">
        <div class="cp-comment-section">
          <div class="cp-comment-section-title">Quick Responses</div>
          <div id="cp-templates-list"></div>
          <button class="cp-comment-btn" id="cp-add-template">+ Add Template</button>
        </div>
        <div class="cp-comment-section">
          <div class="cp-comment-section-title">Formatting</div>
          <button class="cp-format-btn" data-format="bold"><b>B</b></button>
          <button class="cp-format-btn" data-format="italic"><i>I</i></button>
          <button class="cp-format-btn" data-format="strikethrough"><s>S</s></button>
          <button class="cp-format-btn" data-format="emoji">😀</button>
        </div>
      </div>
    `;
    document.body.appendChild(tools);
    attachCommentListeners();
  }

  function createChapterMarker() {
    const marker = document.createElement('div');
    marker.id = 'cp-chapter-marker';
    marker.innerHTML = `
      <div class="cp-chapter-title">Chapters</div>
      <div class="cp-chapter-list" id="cp-chapter-list"></div>
      <button class="cp-chapter-btn" id="cp-add-chapter">+ Add Chapter</button>
    `;
    document.body.appendChild(marker);
    attachChapterListeners();
  }

  function attachToolbarListeners() {
    document.getElementById('cp-toolbar-toggle')?.addEventListener('click', () => {
      const content = document.getElementById('cp-toolbar-content');
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('cp-optimize-title')?.addEventListener('click', async () => {
      const titleInput = document.querySelector('#textbox[aria-label="Title"]') || document.querySelector('input[name="title"]');
      if (!titleInput) return alert('Title input not found');
      const currentTitle = titleInput.value;
      try {
        const data = await fetchWithAuth('/api/optimization/title', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: currentTitle, topic: currentTitle }) });
        if (data.titles?.length) {
          titleInput.value = data.titles[0];
          titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } catch (e) {
        console.error('CreatorPulse optimize title error:', e);
      }
    });

    document.getElementById('cp-generate-description')?.addEventListener('click', async () => {
      const descInput = document.querySelector('#textbox[aria-label="Description"]') || document.querySelector('textarea[name="description"]');
      if (!descInput) return alert('Description input not found');
      const currentDesc = descInput.value;
      try {
        const data = await fetchWithAuth('/api/optimization/description', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: document.querySelector('#textbox[aria-label="Title"]')?.value || '', description: currentDesc, tone: 'professional' }) });
        if (data.description) {
          descInput.value = data.description;
          descInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } catch (e) {
        console.error('CreatorPulse generate description error:', e);
      }
    });

    document.getElementById('cp-suggest-tags')?.addEventListener('click', async () => {
      const title = document.querySelector('#textbox[aria-label="Title"]')?.value || '';
      try {
        const data = await fetchWithAuth('/api/optimization/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description: '', topic: title }) });
        if (data.tags?.length) {
          alert('Suggested tags: ' + data.tags.join(', '));
        }
      } catch (e) {
        console.error('CreatorPulse suggest tags error:', e);
      }
    });

    document.getElementById('cp-analyze-thumbnail')?.addEventListener('click', async () => {
      const title = document.querySelector('#textbox[aria-label="Title"]')?.value || '';
      const thumbnailUrl = document.querySelector('img#thumbnail-icon, ytcp-video-thumbnail img, yt-thumbnail img, .ytcp-thumbnail img, img.ytcp-thumbnail')?.src || '';
      if (!thumbnailUrl) {
        alert('Thumbnail not found');
        return;
      }
      try {
        const data = await fetchWithAuth('/api/optimization/thumbnail-analyzer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId: null, thumbnailUrl, score: null }) });
        if (data.analysis) {
          alert('Thumbnail Score: ' + data.analysis.score + '/100\nSuggestions: ' + (data.analysis.suggestions || []).join('\n'));
        }
      } catch (e) {
        console.error('CreatorPulse analyze thumbnail error:', e);
      }
    });

    document.getElementById('cp-apply-profile')?.addEventListener('click', async () => {
      const profileId = document.getElementById('cp-upload-profile')?.value;
      if (!profileId) return;
      try {
        const data = await fetchWithAuth(`/api/settings/upload-profiles/${profileId}`);
        const profile = data.profile;
        if (profile) {
          const titleInput = document.querySelector('#textbox[aria-label="Title"]');
          const descInput = document.querySelector('#textbox[aria-label="Description"]');
          if (titleInput && profile.title) { titleInput.value = profile.title; titleInput.dispatchEvent(new Event('input', { bubbles: true })); }
          if (descInput && profile.description) { descInput.value = profile.description; descInput.dispatchEvent(new Event('input', { bubbles: true })); }
        }
      } catch (e) {
        console.error('CreatorPulse apply profile error:', e);
      }
    });

    document.getElementById('cp-bulk-end-screens')?.addEventListener('click', () => {
      alert('End screen template manager coming soon! Use the dashboard to create templates.');
    });

    document.getElementById('cp-bulk-cards')?.addEventListener('click', () => {
      alert('Card template manager coming soon! Use the dashboard to create templates.');
    });
  }

  function attachCommentListeners() {
    document.getElementById('cp-comment-toggle')?.addEventListener('click', () => {
      const content = document.getElementById('cp-comment-content');
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });

    document.querySelectorAll('.cp-format-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const format = btn.dataset.format;
        const commentBox = document.querySelector('#contenteditable-root[aria-label="Comment"]') || document.querySelector('textarea[aria-label="Comment"]');
        if (!commentBox) return;
        if (format === 'emoji') {
          const emojis = ['👍', '❤️', '🔥', '👏', '🎉', '💯'];
          commentBox.value += emojis[Math.floor(Math.random() * emojis.length)];
        } else {
          const prefix = format === 'bold' ? '**' : format === 'italic' ? '_' : '~~';
          const suffix = format === 'bold' ? '**' : format === 'italic' ? '_' : '~~';
          const start = commentBox.selectionStart;
          const end = commentBox.selectionEnd;
          const text = commentBox.value;
          commentBox.value = text.slice(0, start) + prefix + text.slice(start, end) + suffix + text.slice(end);
        }
        commentBox.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
  }

  function attachChapterListeners() {
    document.getElementById('cp-add-chapter')?.addEventListener('click', () => {
      const timestamp = prompt('Enter timestamp (MM:SS or HH:MM:SS):');
      const title = prompt('Enter chapter title:');
      if (timestamp && title) {
        const chapterList = document.getElementById('cp-chapter-list');
        const chapter = document.createElement('div');
        chapter.className = 'cp-chapter-item';
        chapter.innerHTML = `<span class="cp-chapter-time">${timestamp}</span><span class="cp-chapter-title">${title}</span>`;
        chapterList.appendChild(chapter);
      }
    });
  }

  async function loadUploadProfiles() {
    try {
      const data = await fetchWithAuth('/api/settings/upload-profiles');
      const profiles = data.profiles || [];
      const select = document.getElementById('cp-upload-profile');
      if (select) {
        select.innerHTML = '<option value="">Select profile...</option>' +
          profiles.map((p: any) => `<option value="${p.id}">${p.name}</option>`).join('');
      }
    } catch (e) {
      console.error('CreatorPulse load profiles error:', e);
    }
  }

  async function analyzeSEO() {
    try {
      const title = document.querySelector('#textbox[aria-label="Title"]')?.value || '';
      const desc = document.querySelector('#textbox[aria-label="Description"]')?.value || '';
      const data = await fetchWithAuth('/api/optimization/seo-scorecard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description: desc, tags: [] }) });
      const scoreEl = document.getElementById('cp-seo-score');
      const fillEl = document.getElementById('cp-seo-fill');
      if (scoreEl && fillEl) {
        scoreEl.textContent = data.score + '/100';
        fillEl.style.width = data.score + '%';
        fillEl.className = 'cp-seo-fill ' + (data.score >= 80 ? 'cp-seo-good' : data.score >= 60 ? 'cp-seo-ok' : 'cp-seo-bad');
      }
    } catch (e) {
      console.error('CreatorPulse SEO analysis error:', e);
    }
  }

  function initStudio() {
    if (document.getElementById('cp-quick-edit-toolbar')) return;
    createQuickEditToolbar();
    createCommentTools();
    createChapterMarker();
    loadUploadProfiles();
    setTimeout(analyzeSEO, 2000);

    const observer = new MutationObserver(() => {
      analyzeSEO();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudio);
  } else {
    initStudio();
  }
})();
