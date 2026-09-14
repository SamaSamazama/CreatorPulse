# CreatorPulse Browser Extension

TubeBuddy/VidIQ-style overlay for YouTube that connects to your CreatorPulse dashboard.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select this `extension` folder: `D:\my-creator-pulse\extension`

## Setup

1. Open CreatorPulse: http://localhost:3000
2. Go to **Settings → API Keys**
3. Generate an API key
4. Go to https://www.youtube.com
5. Click the CreatorPulse extension icon
6. Paste your API key and click Connect

## Features

- **Sidebar overlay** on YouTube pages showing channel stats
- **Sync Now** button to refresh data
- **Recent Videos** list with view counts
- **Multi-channel support** via the web dashboard

## Development

Edit `content.js`, `content.css`, `popup.html`, `popup.js`, or `background.js`, then reload the extension in `chrome://extensions/`.

## API

The extension calls:
- `GET /api/public/v1/channel` - fetch channel data
- `POST /api/sync` - trigger sync

Both require `X-API-Key` header.

## Notes

- Make sure the backend is running at `http://localhost:3000` or the Vercel URL
- For Vercel, update the `VERCEL_URL` constant in `content.js` and `popup.js`
- API keys are stored in Chrome local storage
