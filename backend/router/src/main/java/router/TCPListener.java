package router;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.ServerSocket;
import java.net.Socket;
import router.models.Message;
import router.utils.JsonUtils;

/**
 * TCPListener is a TCP server component that listens for incoming client connections on a specified port.
 * For each connection, it creates a new thread to handle client communication.
 *
 * It receives JSON-encoded messages, registers the client with the SessionManager,
 * and forwards the message to the MessageRouter for delivery to the appropriate server.
 *
 * The response from the server is sent back to the client over the same connection.
 */


public class TCPListener implements Runnable {
    private int port;
    private SessionManager sessionManager;
    private MessageRouter router;

    public TCPListener(int port, SessionManager sessionManager, MessageRouter router) {
        this.port = port;
        this.sessionManager = sessionManager;
        this.router = router;
    }

    @Override
    public void run() {
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            while (true) {
                Socket clientSocket = serverSocket.accept();
                new Thread(() -> handleClient(clientSocket)).start();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void handleClient(Socket socket) {
        try (
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            BufferedWriter out = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()))
        ) {
            String line;
            while ((line = in.readLine()) != null) {
                Message msg = JsonUtils.fromJson(line, Message.class);

                sessionManager.registerClient(msg.getClientId(), socket);

                String response = router.routeMessage(msg);

                out.write(response + "\n");
                out.flush();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

