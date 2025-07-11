package server;

import java.io.*;
import java.net.*;

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
                        System.out.println("Client connected: " + clientAddress + "(ClientApp Address)");
                        String msg = in.readLine();
                        if (msg != null) {
                            System.out.println("Received from client: " + msg);
                            String reply = "Reply from server: " + msg.toUpperCase();
                            out.println(reply);
                            System.out.println("Sent to client: " + reply);
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

