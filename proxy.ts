import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/auth/youtube(.*)',
  '/api/public/v1/channel',
  '/api/public/v1/videos',
  '/api/health',
  '/api/sync',
  '/api/optimization/title',
  '/api/optimization/description',
  '/api/optimization/tags',
  '/api/optimization/seo-scorecard',
  '/api/settings/upload-profiles',
  '/api/settings/upload-profiles/[id]',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|__clerk|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|cpp|dat|doc|docx|exe|json|txt|tar|zip)).*)',
    '/api/(.*)',
  ],
};