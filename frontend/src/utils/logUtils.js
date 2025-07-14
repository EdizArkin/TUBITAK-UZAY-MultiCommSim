// logList: [{timestamp, clientId, serverId, type, message}, ...]

// Secure client numbering: If clientList is not an array, an empty array is returned.
// Permanent and stable client numbering: The first added client is always #1, followed by #2, #3, etc.
// Sorting is done according to the order in which the clientId first appears, and this order is not broken.
const clientIdOrder = [];
export function getClientNumberedList(clientList) {
  if (!Array.isArray(clientList)) return [];
  clientList.forEach(client => {
    if (!clientIdOrder.includes(client.clientId)) {
      clientIdOrder.push(client.clientId);
    }
  });
  const activeIds = clientList.map(c => c.clientId);
  const orderedIds = clientIdOrder.filter(id => activeIds.includes(id));
  return orderedIds.map((id, idx) => {
    const client = clientList.find(c => c.clientId === id);
    return {
      ...client,
      clientNum: idx + 1,
      serverId: client && client.serverId ? client.serverId : null
    };
  });
}
