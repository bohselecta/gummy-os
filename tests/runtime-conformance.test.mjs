import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import {
  DeterministicRuntimeAdapter,
  RUNTIME_ADAPTER_METHODS,
  replayRuntimeFixture
} from "./support/deterministic-runtime-adapters.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

test("provider-neutral runtime schemas compile and fixtures conform", async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);

  const schemaFiles = [
    "runtime-binding.schema.json",
    "mcp-task-binding.schema.json",
    "mcp-server-descriptor.schema.json",
    "mcp-app-surface.schema.json",
    "execution-trace.schema.json",
    "managed-runtime-binding.schema.json"
  ];
  const schemas = Object.fromEntries(
    await Promise.all(
      schemaFiles.map(async (name) => [name, await json(`schemas/${name}`)])
    )
  );
  for (const schema of Object.values(schemas)) ajv.compile(schema);

  const vertical = await json(
    "fixtures/runtime-conformance/mcp-task-vertical-proof.json"
  );
  const managed = await json(
    "fixtures/runtime-conformance/managed-runtime-recovery.json"
  );
  const server = await json(
    "fixtures/runtime-conformance/mcp-server-deterministic.json"
  );
  const surface = await json(
    "fixtures/runtime-conformance/mcp-app-surface-deterministic.json"
  );

  assert.equal(ajv.validate(schemas["runtime-binding.schema.json"], vertical.binding), true);
  assert.equal(
    ajv.validate(schemas["mcp-task-binding.schema.json"], vertical.mcpTaskBinding),
    true
  );
  assert.equal(
    ajv.validate(schemas["managed-runtime-binding.schema.json"], managed.managedRuntimeBinding),
    true
  );
  assert.equal(ajv.validate(schemas["mcp-server-descriptor.schema.json"], server), true);
  assert.equal(ajv.validate(schemas["mcp-app-surface.schema.json"], surface), true);
});

test("adapter contract is authority-bound and provider neutral", async () => {
  const fixture = await json(
    "fixtures/runtime-conformance/mcp-task-vertical-proof.json"
  );
  const adapter = new DeterministicRuntimeAdapter({
    id: "deterministic-mcp-2026-07-28",
    live: false
  });

  for (const method of RUNTIME_ADAPTER_METHODS) {
    assert.equal(typeof adapter[method], "function");
  }
  assert.throws(
    () => adapter.dispatch({}, "dispatch-1"),
    /binding missing bindingId/
  );
  assert.throws(
    () => adapter.provideInput("task:1", { authority: "provider" }),
    /Master Control/
  );
  assert.throws(
    () => adapter.restore({ location: "provider-session" }),
    /Gummy Box/
  );
  assert.equal(
    adapter.dispatch(fixture.binding, "dispatch-ranch-day").detail.bindingId,
    fixture.binding.bindingId
  );
});

test("deterministic vertical proof preserves Return, Receipt, acceptance and release", async () => {
  const fixture = await json(
    "fixtures/runtime-conformance/mcp-task-vertical-proof.json"
  );
  const state = replayRuntimeFixture(fixture);

  assert.equal(state.consumedMicros, fixture.expected.consumedMicros);
  assert.equal(state.returnRecorded, true);
  assert.equal(state.receiptRecorded, true);
  assert.equal(state.accepted, true);
  assert.equal(state.released, true);
  assert.equal(state.restored, true);
  assert.ok(state.telemetryEvents > 0);
});

test("managed-runtime loss restores from Gummy without manufacturing proof", async () => {
  const fixture = await json(
    "fixtures/runtime-conformance/managed-runtime-recovery.json"
  );
  const state = replayRuntimeFixture(fixture);

  assert.equal(fixture.managedRuntimeBinding.providerProfile.liveEnabled, false);
  assert.equal(fixture.managedRuntimeBinding.recovery.checkpointLocation, "gummy-box");
  assert.equal(state.restored, true);
  assert.equal(state.providerCompleted, true);
  assert.equal(state.returnRecorded, false);
  assert.equal(state.receiptRecorded, false);
  assert.equal(state.accepted, false);
});
