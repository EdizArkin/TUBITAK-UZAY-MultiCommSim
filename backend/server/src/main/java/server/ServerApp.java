package server;


import java.io.*;
import java.net.*;
import common.Message;
import common.LogEntry;
import common.JsonUtils;

/**
 * ServerApp listens on a specified TCP port (default 6003) for incoming connections from the router.
 * For each connected client, it reads JSON-formatted messages, logs the received message,
 * and responds by sending back a server message combined with the received content.
 * 
 * The server runs continuously, accepting multiple clients sequentially.
 * Environment variables configure the listening port and the server's response message.
 */

public class ServerApp {
    public static void main(String[] args) {
        int port = Integer.parseInt(System.getenv().getOrDefault("SERVER_PORT", "6003"));
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("Server started on port " + port);
            while (true) {
                Socket clientSocket = serverSocket.accept();
                String clientAddress = clientSocket.getRemoteSocketAddress().toString();
                new Thread(() -> {
                    try (BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                         PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true)) {
                        System.out.println("Client connected: " + clientAddress + " (ClientApp Address)");
                        String msgJson = in.readLine();
                        System.out.println("RAW: " + msgJson);
                        if (msgJson != null) {
                            // Parse incoming message as Message object
                            Message clientMsg = null;
                            try {
                                clientMsg = JsonUtils.fromJson(msgJson, Message.class);
                            } catch (Exception e) {
                                System.out.println("Invalid message format: " + msgJson);
                            }
                            if (clientMsg != null) {
                                LogEntry log = new LogEntry(clientMsg.getClientId(), 1, "Client Sends", clientMsg.getMessage());
                                System.out.println(JsonUtils.toJson(log));
                                // Prepare reply as JSON
                                Message replyMsg = new Message(null, 1, null, "Reply from server: " + clientMsg.getMessage().toUpperCase(), "Server Reply");
                                out.println(JsonUtils.toJson(replyMsg));
                                LogEntry serverLog = new LogEntry(clientMsg.getClientId(), 1, "Server Reply", replyMsg.getMessage());
                                System.out.println(JsonUtils.toJson(serverLog));
                            }
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }).start();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

