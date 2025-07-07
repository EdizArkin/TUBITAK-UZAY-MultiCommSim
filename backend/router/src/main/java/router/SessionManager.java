package router;

import java.net.Socket;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class SessionManager {
    private final Map<String, Socket> clientSockets = new ConcurrentHashMap<>();
    private final Map<String, Socket> serverSockets = new ConcurrentHashMap<>();

    // 🔹 Register client or server socket
    public void registerClient(String clientId, Socket socket) {
        if (clientId.startsWith("server-")) {
            serverSockets.put(clientId, socket);
            System.out.println("SessionManager: Registered SERVER -> " + clientId);
        } else {
            clientSockets.put(clientId, socket);
            System.out.println("SessionManager: Registered CLIENT -> " + clientId);
        }
    }

    public Socket getClientSocket(String clientId) {
        if (clientId.startsWith("server-")) {
            return serverSockets.get(clientId);
        }
        return clientSockets.get(clientId);
    }

    // 🔹 Aktif client ID'leri
    public Set<String> getActiveClientIds() {
        return clientSockets.keySet();
    }

    // 🔹 Aktif server ID'leri
    public Set<String> getActiveServerIds() {
        return serverSockets.keySet();
    }

    // 🔹 İsteğe bağlı: Her iki listeyi döndür
    public Map<String, List<String>> getAllActivePeers() {
        return Map.of(
            "clients", new ArrayList<>(clientSockets.keySet()),
            "servers", new ArrayList<>(serverSockets.keySet())
        );
    }
}
