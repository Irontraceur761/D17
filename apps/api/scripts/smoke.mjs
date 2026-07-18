import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { connect } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = 18787;
const stateFile = path.join(root, "data/smoke-state.json");
const launch = "0xE0831c88D450556a54806F214a3cc57CD85E9010";
const locker = "0x1740E1aae68B3f88f815962FCA6EDEBB4B6BFf77";
const otherLaunch = "0x72113a9FcAa4adD7E3E8B8379C6BAA5037DD9eF1";
const txHash = `0x${"ab".repeat(32)}`;
const otherTxHash = `0x${"cd".repeat(32)}`;
await mkdir(path.dirname(stateFile), { recursive: true });
await writeFile(stateFile, `${JSON.stringify({
  schema: "d17-reference-api-state-v1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  chainId: 1,
  startBlock: 1,
  latestBlock: 1,
  indexedToBlock: 1,
  blocks: {},
  addressKinds: { [launch]: ["launch"], [locker]: ["locker"] },
  launches: {
    [launch]: { launch, launchId: "", rounds: [] },
    [otherLaunch]: { launch: otherLaunch, launchId: "", rounds: [] }
  },
  lockers: {
    [locker]: {
      locker,
      balanceSnapshots: {
        [launch]: {
          lockedWeth: "100",
          withdrawableWeth: "25",
          accountedWeth: "100",
          position: {
            known: true,
            liquiditySettled: false,
            token: null,
            liquidityVault: null,
            rulesHash: `0x${"11".repeat(32)}`,
            claimedSaleTokens: "0",
            wethSentToVault: "0",
            treasuryWeth: "0",
            withdrawableTokens: "7",
            residualWeth: "25",
            finalSaleTokensClaimed: false
          },
          source: "smoke-fixture",
          refreshedAt: new Date().toISOString(),
          indexedToBlock: 1
        }
      }
    }
  },
  launchLockers: { [launch]: [locker], [otherLaunch]: [locker] },
  metadataEvents: {},
  events: [
    {
      id: `${txHash}:0`, chainId: 1, sourceKind: "launch", address: launch,
      eventName: "RoundCommitted", args: { locker, round: "0", amount: "100" },
      txHash, blockNumber: 1, logIndex: 0, timestamp: 1, topics: [], dataHex: "0x"
    },
    {
      id: `${txHash}:1`, chainId: 1, sourceKind: "locker", address: locker,
      eventName: "RoundCommitted", args: { launch, round: "0", amount: "100" },
      txHash, blockNumber: 1, logIndex: 1, timestamp: 1, topics: [], dataHex: "0x"
    },
    {
      id: `${otherTxHash}:0`, chainId: 1, sourceKind: "locker", address: locker,
      eventName: "RoundCommitted", args: { launch: otherLaunch, round: "0", amount: "900" },
      txHash: otherTxHash, blockNumber: 1, logIndex: 2, timestamp: 1, topics: [], dataHex: "0x"
    }
  ]
}, null, 2)}\n`);
const child = spawn(process.execPath, ["src/server.mjs"], {
  cwd: root,
  env: {
    ...process.env,
    LOAD_DOTENV: "0",
    INDEX_DISABLED: "1",
    CHAIN_ID: "1",
    PORT: String(port),
    HOST: "127.0.0.1",
    STATE_FILE: stateFile,
    FACTORY_DEPLOYMENT_FILE: "./deployments/mainnet.json",
    MAINNET_HOSTED_DEPLOY_ENABLED: "0",
    CORS_ALLOWED_ORIGINS: "http://allowed.example",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let stderr = "";
child.stderr.on("data", (chunk) => {
  stderr += chunk.toString();
});

try {
  const health = await waitForJson(`http://127.0.0.1:${port}/api/health`);
  assert(health.ok, "health ok");
  assert(health.data?.status === "ok", "health readiness is explicit");
  assert(health.data?.storage?.mode === "json-file", "JSON storage reported");
  assert(health.data?.storage?.writable === true, "JSON storage is writable");
  assert(health.data?.diagnostics === undefined, "internal storage path is hidden by default");

  const rejectedMethod = await fetch(`http://127.0.0.1:${port}/api/health`, { method: "POST" });
  assert(rejectedMethod.status === 405, "non-GET method rejected");
  const rejectedOrigin = await fetch(`http://127.0.0.1:${port}/api/health`, {
    headers: { origin: "http://not-allowed.example" },
  });
  assert(rejectedOrigin.status === 403, "disallowed HTTP origin rejected");

  const snapshot = await wsSnapshot(`ws://127.0.0.1:${port}/api/ws`, "http://allowed.example");
  assert(snapshot?.meta?.chainId === 1, "WebSocket snapshot chain id");
  const invalidCloseCode = await wsCloseCode(`ws://127.0.0.1:${port}/api/ws?launch=not-an-address`, "http://allowed.example");
  assert(invalidCloseCode === 1008, "malformed WebSocket launch rejected safely");
  const afterInvalidWs = await waitForJson(`http://127.0.0.1:${port}/api/health`);
  assert(afterInvalidWs.ok, "server survives malformed WebSocket query");
  const malformedUpgradeResponse = await malformedUpgrade(port);
  assert(malformedUpgradeResponse.includes("400 Bad Request"), "malformed WebSocket request URL rejected");
  const afterMalformedUpgrade = await waitForJson(`http://127.0.0.1:${port}/api/health`);
  assert(afterMalformedUpgrade.ok, "server survives malformed WebSocket request URL");

  const schema = await waitForJson(`http://127.0.0.1:${port}/api/deployer/schema`);
  assert(schema.ok, "schema ok");
  assert(schema.data?.chainId === 1, "mainnet chain id");
  assert(schema.data?.contractVersion === "D17_CURRENT", "current contract family");
  assert(schema.data?.contracts?.d17Factory === "0x4103c658141447DFc3a70aE2D5C7a5Ad8d970844", "factory manifest");
  assert(schema.data?.mainnetHostedDeployEnabled === false, "mainnet hosted deploy fail-closed");
  assert(Array.isArray(schema.data?.knownContractGaps) && schema.data.knownContractGaps.length === 0, "no known contract gaps");

  const activity = await waitForJson(`http://127.0.0.1:${port}/api/launches/${launch}/activity`);
  assert(activity.ok, "activity ok");
  assert(activity.data?.items?.length === 1, "mirrored locker activity hidden");
  assert(activity.data.items[0].sourceKind === "launch", "launch event is canonical activity");
  assert(activity.data.items.every((item) => item.txHash !== otherTxHash), "shared locker event stays scoped to its explicit launch");
  const invalidLocker = await fetch(`http://127.0.0.1:${port}/api/launches/${launch}/activity?locker=invalid`);
  assert(invalidLocker.status === 400, "malformed locker filter rejected as a client error");
  const lockers = await waitForJson(`http://127.0.0.1:${port}/api/launches/${launch}/lockers`);
  assert(lockers.data?.[0]?.position?.known === true, "locker API exposes exact per-launch position");
  assert(lockers.data?.[0]?.position?.residualWeth === "25", "locker API exposes per-launch residual WETH");

  const stateMismatch = await expectStartupFailure({
    CHAIN_ID: "11155111",
    STATE_FILE: stateFile,
    FACTORY_DEPLOYMENT_FILE: "./deployments/sepolia.json",
  });
  assert(stateMismatch.includes("State file chain mismatch"), "state chain mismatch fails closed");

  const manifestMismatch = await expectStartupFailure({
    CHAIN_ID: "1",
    STATE_FILE: stateFile,
    FACTORY_DEPLOYMENT_FILE: "./deployments/sepolia.json",
  });
  assert(manifestMismatch.includes("Deployment manifest chain mismatch"), "manifest chain mismatch fails closed");

  const invalidChunk = await expectStartupFailure({
    CHAIN_ID: "1",
    STATE_FILE: stateFile,
    FACTORY_DEPLOYMENT_FILE: "./deployments/mainnet.json",
    LOG_CHUNK_SIZE: "0",
  });
  assert(invalidChunk.includes("LOG_CHUNK_SIZE must be an integer"), "invalid numeric indexing config fails closed");
  console.log("D17 API smoke: PASS");
} finally {
  if (child.exitCode === null) {
    child.kill("SIGTERM");
    await new Promise((resolve) => child.once("exit", resolve));
  }
  await rm(stateFile, { force: true });
}

async function waitForJson(url) {
  let lastError;
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not become ready: ${lastError?.message || stderr}`);
}

function assert(value, label) {
  if (!value) throw new Error(`Smoke assertion failed: ${label}`);
}

function wsSnapshot(url, origin) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, { origin });
    const timer = setTimeout(() => reject(new Error("WebSocket snapshot timed out")), 2_000);
    socket.once("message", (data) => {
      clearTimeout(timer);
      const message = JSON.parse(data.toString());
      socket.close();
      resolve(message);
    });
    socket.once("error", reject);
  });
}

function wsCloseCode(url, origin) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, { origin });
    const timer = setTimeout(() => reject(new Error("WebSocket close timed out")), 2_000);
    socket.once("close", (code) => {
      clearTimeout(timer);
      resolve(code);
    });
    socket.once("error", () => {});
  });
}

function malformedUpgrade(port) {
  return new Promise((resolve, reject) => {
    const socket = connect({ host: "127.0.0.1", port });
    let response = "";
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("Malformed upgrade response timed out"));
    }, 2_000);
    socket.setEncoding("utf8");
    socket.on("connect", () => {
      socket.write([
        "GET /api/ws HTTP/1.1",
        "Host: [",
        "Connection: Upgrade",
        "Upgrade: websocket",
        "Sec-WebSocket-Version: 13",
        "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==",
        "Origin: http://allowed.example",
        "",
        "",
      ].join("\r\n"));
    });
    socket.on("data", (chunk) => { response += chunk; });
    socket.on("end", () => {
      clearTimeout(timer);
      resolve(response);
    });
    socket.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

function expectStartupFailure(overrides) {
  return new Promise((resolve, reject) => {
    const candidate = spawn(process.execPath, ["src/server.mjs"], {
      cwd: root,
      env: {
        ...process.env,
        LOAD_DOTENV: "0",
        INDEX_DISABLED: "1",
        HOST: "127.0.0.1",
        PORT: String(port + 1),
        ...overrides,
      },
      stdio: ["ignore", "ignore", "pipe"],
    });
    let output = "";
    candidate.stderr.on("data", (chunk) => { output += chunk.toString(); });
    const timer = setTimeout(() => {
      candidate.kill("SIGTERM");
      reject(new Error("Expected startup failure timed out"));
    }, 2_000);
    candidate.once("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) reject(new Error("Expected startup failure exited successfully"));
      else resolve(output);
    });
  });
}
