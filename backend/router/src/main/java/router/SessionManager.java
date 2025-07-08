package router;

import java.net.Socket;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * SessionManager maintains active socket sessions for both clients and servers.
 * 
 * It registers and stores sockets based on their role (client or server) using thread-safe maps,
 * allowing the router to route messages appropriately between peers.
 *
 * Provides methods to retrieve active client/server IDs and their associated sockets.
 * Designed to support concurrent access in a multithreaded TCP router environment.
 */


public class SessionManager {
    private final Map<String, Socket> clientSockets = new ConcurrentHashMap<>();
    private final Map<String, Socket> serverSockets = new ConcurrentHashMap<>();

    // Register client or server socket
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

    // Active client IDs
    public Set<String> getActiveClientIds() {
        return clientSockets.keySet();
    }

    // Active server IDs
    public Set<String> getActiveServerIds() {
        return serverSockets.keySet();
    }

    // Optional: Return both lists
    public Map<String, List<String>> getAllActivePeers() {
        return Map.of(
            "clients", new ArrayList<>(clientSockets.keySet()),
            "servers", new ArrayList<>(serverSockets.keySet())
        );
    }
}
