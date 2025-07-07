package router;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;

import router.models.Message;
import router.utils.JsonUtils;

public class MessageRouter {
    private final SessionManager sessionManager;
    private final TCPConnectionPool connectionPool;

    public MessageRouter(SessionManager sm, TCPConnectionPool pool) {
        this.sessionManager = sm;
        this.connectionPool = pool;
    }

    // MessageRouter.java içinde
    public String routeMessage(Message msg) {
        try {
            Socket clientSocket = sessionManager.getClientSocket(msg.getTargetIp());
            if (clientSocket != null) {
                BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(clientSocket.getOutputStream()));
                BufferedReader reader = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                writer.write(JsonUtils.toJson(msg) + "\n");
                writer.flush();
                return reader.readLine();
            }
            
            Socket serverSocket = connectionPool.getOrCreateConnection(msg.getTargetIp());
            if (serverSocket == null) return "Connection failed";

            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(serverSocket.getOutputStream()));
            BufferedReader reader = new BufferedReader(new InputStreamReader(serverSocket.getInputStream()));

            writer.write(JsonUtils.toJson(msg) + "\n");
            writer.flush();

            return reader.readLine();
        } catch (IOException e) {
            e.printStackTrace();
            return "Error sending message";
        }
    }

}
