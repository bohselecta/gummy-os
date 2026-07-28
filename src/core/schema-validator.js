const schemaFiles = Object.freeze({
  'gummy.human/v0': 'human',
  'gummy.actor/v0': 'actor',
  'gummy.agent/v0': 'agent',
  'gummy.mold/v0': 'mold',
  'gummy.master-control/v0': 'master-control',
  'gummy.gummy/v0': 'gummy',
  'gummy.bowl/v0': 'bowl',
  'gummy.link/v0': 'link',
  'gummy.grab/v0': 'grab',
  'gummy.box/v0': 'gummy-box',
  'gummy.work-order/v0': 'work-order',
  'gummy.task-lease/v0': 'task-lease',
  'gummy.capability-grant/v0': 'capability-grant',
  'gummy.work-return/v0': 'work-return',
  'gummy.action-receipt/v0': 'action-receipt',
  'gummy.production/v0': 'production',
  'gummy.production-participant/v0': 'production-participant',
  'gummy.production-actor-configuration/v0': 'production-actor-configuration',
  'gummy.actor-app-descriptor/v0': 'actor-app-descriptor',
  'gummy.actor-plan/v0': 'actor-plan',
  'gummy.context-envelope/v0': 'context-envelope',
  'gummy.production-run/v0': 'production-run',
  'gummy.actor-update-proposal/v0': 'actor-update-proposal',
  'gummy.drag-intent/v0': 'drag-intent',
  'gummy.place-binding/v1': 'place-binding',
  'gummy.source-package/v1': 'source-package',
  'gummy.place-handoff/v1': 'place-handoff',
  'gummy.world-plan/v1': 'world-plan'
});

function validateNode(schema, value, path = '$') {
  const errors = [];
  const add = message => errors.push(`${path} ${message}`);
  if (schema.const !== undefined && value !== schema.const) add(`must equal ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) add(`must be one of ${schema.enum.join(', ')}`);
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  const matches = type => (
    (type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) ||
    (type === 'array' && Array.isArray(value)) ||
    (type === 'string' && typeof value === 'string') ||
    (type === 'number' && typeof value === 'number' && Number.isFinite(value)) ||
    (type === 'integer' && Number.isInteger(value)) ||
    (type === 'boolean' && typeof value === 'boolean') ||
    (type === 'null' && value === null)
  );
  if (types.length && !types.some(matches)) {
    add(`must be ${types.join(' or ')}`);
    return errors;
  }
  if (typeof value === 'string') {
    if (schema.minLength != null && value.length < schema.minLength) add(`must contain at least ${schema.minLength} characters`);
    if (schema.pattern && !(new RegExp(schema.pattern).test(value))) add(`must match ${schema.pattern}`);
    if (schema.format === 'date-time' && Number.isNaN(Date.parse(value))) add('must be a date-time');
  }
  if (typeof value === 'number' && schema.minimum != null && value < schema.minimum) add(`must be at least ${schema.minimum}`);
  if (Array.isArray(value)) {
    if (schema.minItems != null && value.length < schema.minItems) add(`must contain at least ${schema.minItems} items`);
    if (schema.uniqueItems && new Set(value.map(item => JSON.stringify(item))).size !== value.length) add('must contain unique items');
    if (schema.items) value.forEach((item, index) => errors.push(...validateNode(schema.items, item, `${path}[${index}]`)));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const required of schema.required || []) if (value[required] === undefined) errors.push(`${path}.${required} is required`);
    for (const [key, child] of Object.entries(schema.properties || {})) {
      if (value[key] !== undefined) errors.push(...validateNode(child, value[key], `${path}.${key}`));
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties || {}));
      for (const key of Object.keys(value)) if (!allowed.has(key)) errors.push(`${path}.${key} is not allowed`);
    }
  }
  return errors;
}

export class RecordValidator {
  constructor() {
    this.schemas = new Map();
  }

  async schema(schemaId) {
    if (!schemaFiles[schemaId]) return null;
    if (!this.schemas.has(schemaId)) {
      const response = await fetch(`/schemas/${schemaFiles[schemaId]}.schema.json`, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Schema unavailable: ${schemaId}`);
      this.schemas.set(schemaId, await response.json());
    }
    return this.schemas.get(schemaId);
  }

  async validate(record, store, repository, { crossRecords = true } = {}) {
    if (['meta', 'profiles', 'workspaces', 'outbox', 'leaseClaims'].includes(store)) return true;
    const schema = await this.schema(record.schema);
    if (!schema) throw new Error(`Unknown schema: ${record.schema}`);
    const errors = validateNode(schema, record);
    if (errors.length) throw new Error(`Invalid ${record.schema}: ${errors.join('; ')}`);
    if (!crossRecords) return true;
    const links = [
      ['humanAuthorityId', 'humans'], ['actorId', 'actors'], ['agentId', 'agents'],
      ['moldId', 'molds'], ['masterControlId', 'masterControls'], ['boxId', 'boxes'],
      ['taskLeaseId', 'taskLeases']
    ];
    for (const [field, targetStore] of links) {
      if (record[field] && !(await repository.get(targetStore, record[field]))) throw new Error(`Unresolved ${field}: ${record[field]}`);
    }
    return true;
  }
}
