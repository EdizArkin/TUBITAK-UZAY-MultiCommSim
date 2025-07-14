// logList: [{timestamp, clientId, serverId, type, message}, ...]

// Güvenli client numaralandırma: clientList dizi değilse boş dizi döner
// Kalıcı ve stabil client numaralandırma: ilk eklenen client her zaman #1, sonra eklenenler #2, #3... olarak kalır
// Sıralama clientId'nin ilk göründüğü sıraya göre yapılır ve bu sıra bozulmaz
const clientIdOrder = [];
export function getClientNumberedList(clientList) {
  if (!Array.isArray(clientList)) return [];
  // Yeni clientId'leri sıraya ekle
  clientList.forEach(client => {
    if (!clientIdOrder.includes(client.clientId)) {
      clientIdOrder.push(client.clientId);
    }
  });
  // Sadece aktif client'lar için sıralı liste oluştur
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
