import { google } from 'googleapis';
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`
  );
}
export function getYouTubeClient(accessToken: string) {
  const auth = createOAuth2Client();
  auth.setCredentials({ access_token: accessToken });
  return google.youtube({ version: 'v3', auth });
}
