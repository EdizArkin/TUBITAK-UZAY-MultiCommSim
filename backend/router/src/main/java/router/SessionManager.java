package router;

import java.net.Socket;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SessionManager {
    private final Map<String, Socket> clientSockets = new ConcurrentHashMap<>();

    public void registerClient(String clientId, Socket socket) {
        clientSockets.put(clientId, socket);
        System.out.println("SessionManager: Registered clientId=" + clientId);
    }

    public Socket getClientSocket(String clientId) {
        return clientSockets.get(clientId);
    }
}

