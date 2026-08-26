import os
file_path = 'app/api/dashboard/route.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { getValidYouTubeClient, fetchChannelAnalytics, fetchRecentVideos } from '@/lib/youtube/api';",
    "import { getValidYouTubeClient } from '@/lib/youtube/client';\nimport { fetchChannelAnalytics, fetchRecentVideos } from '@/lib/youtube/api';"
)
content = content.replace(
    'import { getValidYouTubeClient, fetchChannelAnalytics, fetchRecentVideos } from "@/lib/youtube/api";',
    'import { getValidYouTubeClient } from "@/lib/youtube/client";\nimport { fetchChannelAnalytics, fetchRecentVideos } from "@/lib/youtube/api";'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("FIXED DASHBOARD IMPORT")