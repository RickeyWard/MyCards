#!/usr/bin/env node
/**
 * Completes Home Assistant onboarding headlessly so `npm run dev` lands on a
 * usable dashboard instead of the setup wizard.
 *
 * Idempotent: exits quietly if onboarding is already done.
 */

const BASE = process.env.HA_URL ?? "http://localhost:8123";
const CLIENT_ID = `${BASE}/`;
const USERNAME = process.env.HA_USER ?? "dev";
const PASSWORD = process.env.HA_PASSWORD ?? "dev";
const NAME = "Dev";
const BOOT_TIMEOUT_MS = 180_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForApi() {
  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  let lastError = "no response";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/onboarding`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return res.json();
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err.message;
    }
    await sleep(2000);
  }
  throw new Error(`Home Assistant did not answer within ${BOOT_TIMEOUT_MS / 1000}s: ${lastError}`);
}

async function postJson(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`POST ${path} -> ${res.status} ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function exchangeCode(code) {
  const res = await fetch(`${BASE}/auth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: CLIENT_ID,
    }),
  });
  if (!res.ok) throw new Error(`token exchange -> ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function login() {
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

async function main() {
  const steps = await waitForApi();
  const pending = new Set(steps.filter((s) => !s.done).map((s) => s.step));

  if (pending.size === 0) {
    console.log(`Onboarding already complete. Sign in at ${BASE} as ${USERNAME} / ${PASSWORD}`);
    return;
  }

  let token;

  if (pending.has("user")) {
    const { auth_code } = await postJson("/api/onboarding/users", {
      client_id: CLIENT_ID,
      name: NAME,
      username: USERNAME,
      password: PASSWORD,
      language: "en",
    });
    token = await exchangeCode(auth_code);
    console.log(`Created owner account ${USERNAME} / ${PASSWORD}`);
  }

  if (!token) {
    // A partly onboarded instance already has the account; sign in to finish.
    token = await login();
  }

  // Remaining steps just need to be marked done; the values come from
  // configuration.yaml, which HA already loaded.
  for (const step of ["core_config", "analytics"]) {
    if (!pending.has(step)) continue;
    try {
      await postJson(`/api/onboarding/${step}`, {}, token);
      console.log(`Completed onboarding step: ${step}`);
    } catch (err) {
      console.warn(`Skipped onboarding step ${step}: ${err.message}`);
    }
  }

  if (pending.has("integration")) {
    await postJson(
      "/api/onboarding/integration",
      { client_id: CLIENT_ID, redirect_uri: CLIENT_ID },
      token,
    );
    console.log("Completed onboarding step: integration");
  }

  console.log(`\nHome Assistant ready at ${BASE} (auto-login as ${USERNAME}).`);
}

main().catch((err) => {
  console.error(`Onboarding failed: ${err.message}`);
  process.exit(1);
});
