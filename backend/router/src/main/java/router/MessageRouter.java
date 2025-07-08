package router;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import router.models.Message;
import router.utils.JsonUtils;

/**
 * MessageRouter handles routing client messages to the appropriate server
 * via TCP by reusing or creating a connection through TCPConnectionPool.
 *
 * It serializes the incoming Message object to JSON, sends it to the server,
 * and reads back the response to return to the client.
 *
 * Acts as a proxy-level communication bridge between clients and servers.
 */


public class MessageRouter {
    private final SessionManager sessionManager;
    private final TCPConnectionPool connectionPool;

    public MessageRouter(SessionManager sessionManager, TCPConnectionPool connectionPool) {
        this.sessionManager = sessionManager;
        this.connectionPool = connectionPool;
    }

    public String routeMessage(Message msg) {
        try {
            Socket serverSocket = connectionPool.getOrCreateConnection(msg.getTargetIp());
            if (serverSocket == null) return "Server not available";

            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(serverSocket.getOutputStream()));
            BufferedReader reader = new BufferedReader(new InputStreamReader(serverSocket.getInputStream()));

            writer.write(JsonUtils.toJson(msg) + "\n");
            writer.flush();

            return reader.readLine();
        } catch (IOException e) {
            e.printStackTrace();
            return "Error routing message";
        }
    }
}


