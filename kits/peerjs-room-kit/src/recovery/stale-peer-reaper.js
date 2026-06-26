export function reapStalePeers(presenceTable, { ledger, closeLinks = () => {} } = {}) {
  const stalePeers = presenceTable.markStale();
  for (const peer of stalePeers) {
    closeLinks(peer);
    ledger?.append?.({
      type: 'presence.peer-stale',
      subjectId: peer.identity,
      payload: { peerId: peer.peerId, roomId: peer.roomId, expiresAt: peer.expiresAt }
    });
  }
  return stalePeers;
}
