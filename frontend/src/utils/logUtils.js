// logList: [{timestamp, clientId, serverId, type, message}, ...]

// Güvenli client numaralandırma: clientList dizi değilse boş dizi döner
export function getClientNumberedList(clientList) {
  if (!Array.isArray(clientList)) return [];
  return clientList.map((client, idx) => ({
    ...client,
    clientNum: idx + 1,
    serverId: client.serverId ? client.serverId : null
  }));
}
