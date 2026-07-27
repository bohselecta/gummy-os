function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function roomToBowl(room, { ownerActorId, createdAt = new Date().toISOString() }) {
  if (!room?.id || !room?.name) throw new Error('Room adapter requires room identity');
  if (!ownerActorId?.startsWith('actor:')) throw new Error('Room adapter requires an owner Actor');
  const members = (room.members || []).map(member => {
    if (!member.actorId?.startsWith('actor:')) throw new Error('Every room member must resolve to an Actor');
    return {
      actorId: member.actorId,
      moldId: member.moldId,
      role: member.role || 'participant',
      status: member.status || 'active',
      joinedAt: member.joinedAt || createdAt
    };
  });
  return deepFreeze({
    schema: 'gummy.bowl/v0',
    id: `bowl:room:${room.id}`,
    name: room.name,
    description: room.description || 'Gummy Rooms collaboration Bowl',
    ownerActorId,
    visibility: room.visibility || 'private',
    members,
    gummyIds: [...new Set(room.gummyIds || [])],
    policy: {
      whoCanInvite: room.whoCanInvite || [ownerActorId],
      whoCanPublish: room.whoCanPublish || [ownerActorId],
      agentActorsAllowed: Boolean(room.agentActorsAllowed),
      defaultGummyVisibility: room.defaultGummyVisibility || 'private',
      grabPolicy: room.grabPolicy || 'per-gummy'
    },
    createdAt,
    updatedAt: createdAt,
    extensions: {
      sourceApplicationId: 'app:gummy-rooms',
      sourceRoomId: room.id,
      queuePolicy: 'fair-round-robin',
      threadIsolation: true,
      liveMirrors: true
    }
  });
}

export function roomOperationReceiptInput({
  action,
  actorId,
  agentId,
  bowlId,
  outcome = 'completed',
  detail
}) {
  if (!actorId?.startsWith('actor:')) throw new Error('Room operation requires an Actor');
  if (agentId && !agentId.startsWith('agent:')) throw new Error('Room Agent identity must remain explicit');
  if (!bowlId?.startsWith('bowl:')) throw new Error('Room operation requires a Bowl');
  return deepFreeze({
    application: 'Gummy Rooms',
    action,
    operatorType: agentId ? 'agent' : 'human',
    operatorId: agentId || actorId,
    agentId,
    resources: [bowlId],
    outcome,
    reversible: true,
    detail,
    extensions: {
      sourceApplicationId: 'app:gummy-rooms',
      fairQueue: true,
      threadIsolation: true,
      actorId
    }
  });
}
