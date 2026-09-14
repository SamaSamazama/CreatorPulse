# CreatorPulse Browser Extension

TubeBuddy/VidIQ-style overlay for YouTube that connects to your CreatorPulse dashboard.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select this `extension` folder: `D:\my-creator-pulse\extension`

## Setup

1. Open CreatorPulse: https://my-creator-pulse.vercel.app
2. Sign in with Clerk
3. Go to **Settings → API Keys**
4. Click **Generate Key**
5. Copy the generated key
6. Go to https://www.youtube.com
7. Click the CreatorPulse extension icon
8. Paste your API key and click **Connect**

## Features

- **Sidebar overlay** on YouTube pages showing channel stats
- **Sync Now** button to refresh data
- **Recent Videos** list with view counts
- **Quick links** to all CreatorPulse features:
  - Dashboard
  - Channels
  - Research
  - AI Coach
  - Scripts
  - Title Optimizer
  - Tags
  - Description Generator
  - Thumbnails
  - Calendar
  - Bulk Editor
  - A/B Testing
  - Outliers
  - Revenue
  - Settings

## Development

Edit `content.js`, `content.css`, `popup.html`, `popup.js`, or `background.js`, then reload the extension in `chrome://extensions/`.

## API

The extension calls:
- `GET /api/public/v1/channel` - fetch channel data
- `POST /api/sync` - trigger sync

Both require `X-API-Key` header.

## Notes

- Make sure the backend is running at `https://my-creator-pulse.vercel.app` or `http://localhost:3000`
- API keys are stored in Chrome local storage
