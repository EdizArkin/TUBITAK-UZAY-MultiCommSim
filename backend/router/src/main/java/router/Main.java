package router;

/**
 * Entry point for the RouterService.
 * 
 * Initializes the session manager, connection pool, and message router,
 * then starts the TCP listener on the configured port (default: 6003).
 * 
 * Listens for incoming client connections, manages session routing,
 * and forwards messages between clients and servers.
 */


public class Main {
    public static void main(String[] args) {
        int tcpPort = 6003;

        SessionManager sessionManager = new SessionManager();
        TCPConnectionPool connectionPool = new TCPConnectionPool(sessionManager, tcpPort);
        MessageRouter router = new MessageRouter(sessionManager, connectionPool);

        new Thread(new TCPListener(tcpPort, sessionManager, router)).start();

        System.out.println("RouterService started on port " + tcpPort);
    }
}
