/**
 * Minimal Home Assistant client for the dev-instance scripts: password login
 * over the auth flow, plus a websocket call helper for the registry APIs that
 * have no REST equivalent.
 */

export const BASE = process.env.HA_URL ?? "http://localhost:8123";
export const CLIENT_ID = `${BASE}/`;
export const USERNAME = process.env.HA_USER ?? "dev";
export const PASSWORD = process.env.HA_PASSWORD ?? "dev";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function postJson(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${path} -> ${res.status} ${text}`);
  return text ? JSON.parse(text) : {};
}

export async function exchangeCode(code) {
  const res = await fetch(`${BASE}/auth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, client_id: CLIENT_ID }),
  });
  if (!res.ok) throw new Error(`token exchange -> ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

/** Signs in with the dev account and returns an access token. */
export async function getAccessToken() {
  const flow = await postJson("/auth/login_flow", {
    client_id: CLIENT_ID,
    handler: ["homeassistant", null],
    redirect_uri: CLIENT_ID,
    type: "authorize",
  });
  const result = await postJson(`/auth/login_flow/${flow.flow_id}`, {
    client_id: CLIENT_ID,
    username: USERNAME,
    password: PASSWORD,
  });
  if (result.type !== "create_entry") {
    throw new Error(`login did not complete: ${JSON.stringify(result)}`);
  }
  return exchangeCode(result.result);
}

/**
 * Opens an authenticated websocket. Returns `call(message)` which resolves with
 * the result, and `close()`.
 */
export async function connect(token) {
  const url = `${BASE.replace(/^http/, "ws")}/api/websocket`;
  const socket = new WebSocket(url);
  const pending = new Map();
  let nextId = 0;

  await new Promise((resolve, reject) => {
    socket.onerror = () => reject(new Error(`websocket failed to open: ${url}`));
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "auth_required") {
        socket.send(JSON.stringify({ type: "auth", access_token: token }));
      } else if (msg.type === "auth_ok") {
        resolve();
      } else if (msg.type === "auth_invalid") {
        reject(new Error(`websocket auth rejected: ${msg.message}`));
      } else if (msg.type === "result") {
        const entry = pending.get(msg.id);
        if (!entry) return;
        pending.delete(msg.id);
        if (msg.success) entry.resolve(msg.result);
        else entry.reject(new Error(`${entry.type}: ${msg.error?.message ?? "failed"}`));
      }
    };
  });

  return {
    call: (message) =>
      new Promise((resolve, reject) => {
        const id = ++nextId;
        pending.set(id, { resolve, reject, type: message.type });
        socket.send(JSON.stringify({ id, ...message }));
      }),
    close: () => socket.close(),
  };
}
