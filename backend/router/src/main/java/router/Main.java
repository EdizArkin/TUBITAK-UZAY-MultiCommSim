package router;

public class Main {
    public static void main(String[] args) {
        int tcpPort = 6003;
        SessionManager sessionManager = new SessionManager();
        TCPConnectionPool connectionPool = new TCPConnectionPool(sessionManager, tcpPort);
        MessageRouter router = new MessageRouter(sessionManager, connectionPool);

        new Thread(new TCPListener(tcpPort, sessionManager, router)).start();
    }
}
