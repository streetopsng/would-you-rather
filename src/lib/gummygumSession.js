const API_URL = import.meta.env.VITE_GUMMYGUM_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : 'https://paige-server.onrender.com');
const STORAGE_KEY = 'gummygum_launch_session';

export function getGummyGumSession() {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
  try {
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

async function verifyLaunchTokenOnce(ggt) {
  try {
    const res = await fetch(`${API_URL}/api/gummygum/launch/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: ggt }),
    });
    const body = await res.json();
    if (!res.ok || !body.success) {
      const fallbackUrl = body?.data?.fallbackUrl;
      // A rejected invite link goes to the hub's /join page, which explains the specific reason.
      if (typeof fallbackUrl === 'string' && fallbackUrl.startsWith('https://gummygum.app/')) {
        window.location.replace(fallbackUrl);
        return new Promise(() => {});
      }
      return null;
    }
    return body;
  } catch (err) {
    console.error('GummyGum launch verify failed', err);
    return null;
  }
}

export async function resolveGummyGumLaunch() {
  const params = new URLSearchParams(window.location.search);
  const ggt = params.get('ggt');

  if (!ggt) {
    return getGummyGumSession();
  }

  let body = await verifyLaunchTokenOnce(ggt);
  if (!body) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    body = await verifyLaunchTokenOnce(ggt);
  }

  if (!body) {
    const existing = getGummyGumSession();
    if (existing) {
      params.delete('ggt');
      const query = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : ''));
      return existing;
    }
    return null;
  }

  // The URL sessionId is the hub's hosted session; verify's data.sessionId is per-launch.
  const hostedSessionId = params.get('sessionId') || null

  const hubUrl = body.data.hubUrl || (typeof document !== 'undefined' && document.referrer ? new URL(document.referrer).origin : 'https://gummygum.app');

  const session = {
    sessionId: body.data.sessionId,
    experienceId: body.data.experienceId,
    isGuest: body.data.isGuest,
    player: body.data.player,
    reportToken: body.data.reportToken,
    roomCode: body.data.roomCode || null,
    hostedSessionId,
    isHost: Boolean(body.data.isHost),
    invitedCount: body.data.invitedCount || null,
    hubUrl,
    round: 1,
    reported: false,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

  params.delete('ggt');
  const query = params.toString();
  window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : ''));

  return session;
}

export async function reportGummyGumCancel() {
  const session = getGummyGumSession();
  if (!session || !session.reportToken) return false;

  try {
    const res = await fetch(`${API_URL}/api/gummygum/launch/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportToken: session.reportToken }),
      keepalive: true,
    });
    return res.ok;
  } catch (err) {
    console.error('GummyGum cancel report failed', err);
    return false;
  }
}

export async function reportGummyGumResult(report) {
  const session = getGummyGumSession();
  if (!session || !session.reportToken) return false;

  try {
    const res = await fetch(`${API_URL}/api/gummygum/launch/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportToken: session.reportToken, report }),
      keepalive: true,
    });
    if (!res.ok) return false;
    session.reported = true;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch (err) {
    console.error('GummyGum result report failed', err);
    return false;
  }
}

export function returnToGummyGum(hubUrl) {
  const hub = hubUrl || getGummyGumSession()?.hubUrl || 'https://gummygum.app';
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = hub;
}

const HUB_STATUS_POLL_MS = 15000;

// The hub can't write to this experience's realtime DB, so a hub-side end is only visible via the backend.
export function watchHubSessionStatus({ pin, hostedSessionId, onEnded }) {
  if (typeof window === 'undefined' || !pin || !hostedSessionId) return () => {};
  let stopped = false;
  let inFlight = false;
  let timer = null;

  const stop = () => {
    stopped = true;
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisibility);
  };

  const check = async () => {
    if (stopped || inFlight || document.hidden) return;
    inFlight = true;
    try {
      const res = await fetch(`${API_URL}/api/gummygum/sessions/by-pin/${encodeURIComponent(pin)}`);
      if (!res.ok) return;
      const body = await res.json();
      const data = body?.data;
      if (stopped || !body?.success || !data?.id) return;
      const isOurs = String(data.id) === String(hostedSessionId);
      if (!isOurs || data.status === 'Ended') {
        stop();
        onEnded(data);
      }
    } catch {
      // Network errors never end the session.
    } finally {
      inFlight = false;
    }
  };

  function onVisibility() {
    if (!document.hidden) check();
  }

  document.addEventListener('visibilitychange', onVisibility);
  timer = setInterval(check, HUB_STATUS_POLL_MS);
  check();
  return stop;
}
