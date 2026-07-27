export const PRODUCT_STATE_COPY = Object.freeze({
  ready: Object.freeze({
    title: 'Ready to review',
    detail: 'The configuration is complete. No work has started.'
  }),
  unavailable: Object.freeze({
    title: 'Runtime not connected',
    detail: 'You can finish the configuration and inspect the package now. Connect the named runtime before Make Production can execute this node.'
  }),
  blocked: Object.freeze({
    title: 'Approval required',
    detail: 'This Asset or capability is outside the current permission. Review it in Master Control.'
  }),
  denied: Object.freeze({
    title: 'Not authorized',
    detail: 'Nothing ran. The denied action and reason were recorded in a Receipt.'
  }),
  failed: Object.freeze({
    title: 'The attempt failed',
    detail: 'Your sources and previous accepted results are unchanged. Review the evidence, then retry or revise.'
  }),
  cancelled: Object.freeze({
    title: 'Cancelled',
    detail: 'The owned Job was asked to stop. Partial outputs are not accepted automatically.'
  }),
  recovery: Object.freeze({
    title: 'Provider outcome needs recovery',
    detail: 'The request may have reached the provider, so Gummy OS will inspect the existing Job instead of submitting a duplicate.'
  }),
  awaitingAcceptance: Object.freeze({
    title: 'Results are ready',
    detail: 'Compare the eligible outputs and choose what this Production should accept.'
  }),
  accepted: Object.freeze({
    title: 'Accepted',
    detail: 'The selected result now has the role shown below. Other candidates remain inspectable and unchanged.'
  })
});

export function stateCopy(state) {
  return PRODUCT_STATE_COPY[state] || PRODUCT_STATE_COPY.failed;
}
