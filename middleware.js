// middleware.js — Vercel Edge Middleware
// Server-side password protection for the TBG marketing site.
// Runs BEFORE any page is served, so site content never reaches
// an unauthorized visitor (unlike the client-side JS gate).
//
// How it works: HTTP Basic Auth. The browser shows a native
// username/password dialog. Only correct credentials get through.
//
// To change credentials: edit USERNAME and PASSWORD below.

export const config = {
  // Protect everything EXCEPT Vercel internals and static asset files
  // (images still load once the page itself is authorized).
  matcher: ['/((?!_next|_vercel|favicon.ico).*)'],
};

const USERNAME = 'tbg';
const PASSWORD = 'tbg2026';

export default function middleware(request) {
  const auth = request.headers.get('authorization');

  if (auth) {
    // Header format: "Basic base64(username:password)"
    const encoded = auth.split(' ')[1] || '';
    let decoded = '';
    try {
      decoded = atob(encoded);
    } catch (e) {
      decoded = '';
    }
    const idx = decoded.indexOf(':');
    const user = decoded.slice(0, idx);
    const pass = decoded.slice(idx + 1);

    if (user === USERNAME && pass === PASSWORD) {
      // Authorized — let the request continue to the site.
      return;
    }
  }

  // Not authorized — prompt the browser for credentials.
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="TBG — Private", charset="UTF-8"',
    },
  });
}
