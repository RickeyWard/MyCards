#!/usr/bin/env node
/**
 * Completes Home Assistant onboarding headlessly so `npm run dev` lands on a
 * usable dashboard instead of the setup wizard.
 *
 * Idempotent: exits quietly if onboarding is already done.
 */

import {
  BASE,
  CLIENT_ID,
  PASSWORD,
  USERNAME,
  exchangeCode,
  getAccessToken,
  postJson,
  sleep,
} from "./lib/ha.mjs";

const NAME = "Dev";
const BOOT_TIMEOUT_MS = 180_000;

async function waitForApi() {
  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  let lastError = "no response";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/onboarding`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return res.json();
      // HA unregisters the onboarding views once it is done, so a 404 here
      // means there is nothing left to do -- not that it is still booting.
      if (res.status === 404) return null;
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err.message;
    }
    await sleep(2000);
  }
  throw new Error(`Home Assistant did not answer within ${BOOT_TIMEOUT_MS / 1000}s: ${lastError}`);
}

async function main() {
  const steps = await waitForApi();
  const pending = new Set((steps ?? []).filter((s) => !s.done).map((s) => s.step));

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
    token = await getAccessToken();
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
