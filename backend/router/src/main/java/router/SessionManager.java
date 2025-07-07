package router;

import java.net.Socket;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SessionManager {
    private final Map<String, Socket> clientSockets = new ConcurrentHashMap<>();
    private final Map<String, Socket> serverSockets = new ConcurrentHashMap<>();

    // clientId veya serverId ile socket eşleştirilir
    public void registerClient(String clientId, Socket socket) {
        if (clientId.startsWith("server-")) {
            System.out.println("SessionManager: Registered serverId=" + clientId + " socket=" + socket);
            serverSockets.put(clientId, socket);
        } else {
            System.out.println("SessionManager: Registered clientId=" + clientId + " socket=" + socket);
            clientSockets.put(clientId, socket);
        }
    }

    public Socket getClientSocket(String clientId) {
        Socket s;
        if (clientId.startsWith("server-")) {
            s = serverSockets.get(clientId);
        } else {
            s = clientSockets.get(clientId);
        }
        System.out.println("SessionManager: getClientSocket for clientId=" + clientId + " returns " + s);
        return s;
    }

    public void debugPrintAllClients() {
        System.out.println("SessionManager: All registered clients:");
        clientSockets.forEach((k, v) -> System.out.println("  clientId=" + k + " socket=" + v));
        System.out.println("SessionManager: All registered servers:");
        serverSockets.forEach((k, v) -> System.out.println("  serverId=" + k + " socket=" + v));
    }
}
