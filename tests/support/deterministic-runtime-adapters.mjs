export const RUNTIME_ADAPTER_METHODS = Object.freeze([
  "describe",
  "dispatch",
  "poll",
  "provideInput",
  "checkpoint",
  "restore",
  "cancel"
]);

export class DeterministicRuntimeAdapter {
  constructor(profile) {
    this.profile = structuredClone(profile);
    this.events = [];
  }

  describe() {
    return structuredClone(this.profile);
  }

  dispatch(binding, idempotencyKey) {
    assertBinding(binding);
    if (!idempotencyKey) throw new Error("dispatch requires an idempotency key");
    return this.record("dispatch", { idempotencyKey, bindingId: binding.bindingId });
  }

  poll(handle) {
    return this.record("poll", { handle });
  }

  provideInput(handle, decision) {
    if (decision?.authority !== "master-control") {
      throw new Error("input requires a Master Control decision");
    }
    return this.record("input", { handle, decision });
  }

  checkpoint(handle, digest) {
    return this.record("checkpoint", {
      handle,
      digest,
      location: "gummy-box"
    });
  }

  restore(checkpoint) {
    if (checkpoint?.location !== "gummy-box") {
      throw new Error("restore requires a Gummy Box checkpoint");
    }
    return this.record("restore", checkpoint);
  }

  cancel(handle, idempotencyKey) {
    if (!idempotencyKey) throw new Error("cancel requires an idempotency key");
    return this.record("cancel", { handle, idempotencyKey });
  }

  record(kind, detail) {
    const event = { sequence: this.events.length, kind, detail };
    this.events.push(event);
    return structuredClone(event);
  }
}

export function replayRuntimeFixture(fixture) {
  const state = {
    accepted: false,
    checkpointed: false,
    continuationApproved: false,
    consumedMicros: fixture.binding?.budget?.consumedMicros ?? 0,
    distributionPlanned: false,
    hardStopMicros: fixture.binding?.budget?.hardStopMicros ?? 0,
    providerCompleted: false,
    receiptRecorded: false,
    releaseApproved: false,
    released: false,
    restored: false,
    returnRecorded: false,
    telemetryEvents: 0
  };

  for (const step of fixture.steps) {
    switch (step.kind) {
      case "provider-telemetry":
        state.telemetryEvents += 1;
        if (step.status === "completed") state.providerCompleted = true;
        break;
      case "budget-charge": {
        const projected = state.consumedMicros + step.amountMicros;
        if (projected > state.hardStopMicros) {
          if (!step.expectDenied) throw new Error("budget exceeded without stop");
          state.checkpointed = true;
          break;
        }
        state.consumedMicros = projected;
        break;
      }
      case "checkpoint":
        state.checkpointed = true;
        break;
      case "master-control-decision":
        if (step.decision === "approve-continuation") {
          if (!state.checkpointed) throw new Error("continuation requires checkpoint");
          if (step.hardStopMicros < state.hardStopMicros) {
            throw new Error("approved ceiling cannot move backwards");
          }
          state.hardStopMicros = step.hardStopMicros;
          state.continuationApproved = true;
        }
        if (step.decision === "approve-release") state.releaseApproved = true;
        break;
      case "continue":
        if (!state.continuationApproved) {
          throw new Error("continuation requires Master Control approval");
        }
        break;
      case "gummy-return":
        if (!state.providerCompleted) throw new Error("Return requires completion");
        state.returnRecorded = true;
        break;
      case "gummy-receipt":
        if (!state.returnRecorded) throw new Error("Receipt requires Return");
        state.receiptRecorded = true;
        break;
      case "human-acceptance":
        if (!state.receiptRecorded) throw new Error("acceptance requires Receipt");
        state.accepted = true;
        break;
      case "distribution-plan":
        if (!state.accepted) throw new Error("distribution requires acceptance");
        state.distributionPlanned = true;
        break;
      case "explicit-release":
        if (!state.distributionPlanned || !state.releaseApproved) {
          throw new Error("release requires plan and explicit approval");
        }
        state.released = true;
        break;
      case "restore-from-gummy-checkpoint":
        if (!state.checkpointed) throw new Error("no Gummy checkpoint to restore");
        state.restored = true;
        break;
      case "restore-complete-state":
        if (fixture.binding?.canonicalProjectCopy?.location !== "gummy-box") {
          throw new Error("canonical Project copy is not in Gummy Box");
        }
        state.restored = true;
        break;
      default:
        break;
    }
  }

  return state;
}

function assertBinding(binding) {
  const required = [
    "bindingId",
    "actorId",
    "agentId",
    "productionId",
    "workOrderId",
    "authorityLeaseId",
    "moldId",
    "grantId",
    "returnAnchor"
  ];
  for (const key of required) {
    if (!binding?.[key]) throw new Error(`binding missing ${key}`);
  }
  if (binding.canonicalProjectCopy?.location !== "gummy-box") {
    throw new Error("binding requires a canonical Gummy Box copy");
  }
}
