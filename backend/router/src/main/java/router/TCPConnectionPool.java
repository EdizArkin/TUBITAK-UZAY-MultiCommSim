package router;

import java.io.IOException;
import java.net.Socket;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * TCPConnectionPool maintains reusable TCP connections to server instances,
 * enabling efficient routing of messages through a centralized socket pool.
 *
 * It checks the SessionManager for an active connection, or creates a new one if needed.
 * All connections are identified by a serverId and stored in a thread-safe map.
 *
 * This class is essential for reducing connection overhead in high-frequency communication scenarios.
 */


public class TCPConnectionPool {
    private final Map<String, Socket> serverConnections = new ConcurrentHashMap<>();
    private final SessionManager sessionManager;
    private final int serverPort;

    public TCPConnectionPool(SessionManager sessionManager, int serverPort) {
        this.sessionManager = sessionManager;
        this.serverPort = serverPort;
    }

    public Socket getOrCreateConnection(String serverId) {
        Socket existingSocket = sessionManager.getClientSocket(serverId);
        if (existingSocket != null && !existingSocket.isClosed()) {
            return existingSocket;
        }
        return serverConnections.computeIfAbsent(serverId, id -> {
            try {
                System.out.println("Creating new connection to " + id + ":" + serverPort);
                Socket socket = new Socket(id, serverPort);
                sessionManager.registerClient(id, socket);
                return socket;
            } catch (IOException e) {
                e.printStackTrace();
                return null;
            }
        });
    }
}

