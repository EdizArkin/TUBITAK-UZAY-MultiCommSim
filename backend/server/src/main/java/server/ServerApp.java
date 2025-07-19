package server;

import java.io.*;
import java.net.*;
import com.google.gson.Gson;
import router.models.Message;

/**
 * ServerApp listens on a specified TCP port (default 6003) for incoming connections from the router.
 * For each connected client, it reads JSON-formatted messages, logs the received message,
 * and responds by sending back a server message combined with the received content.
 * 
 * The server runs continuously, accepting multiple clients sequentially.
 * Environment variables configure the listening port and the server's response message.
 */


public class ServerApp {
    public static void main(String[] args) throws IOException {
        int port = Integer.parseInt(System.getenv().getOrDefault("SERVER_PORT", "6003"));
        String serverMsg = System.getenv().getOrDefault("SERVER_MSG", "Hello from server!");

        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("Server started on port " + port);

            while (true) {
                Socket clientSocket = serverSocket.accept();
                System.out.println("Client connected: " + clientSocket.getRemoteSocketAddress());
                BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
                Gson gson = new Gson();

                String line;
                while ((line = in.readLine()) != null) {
                    Message msg = gson.fromJson(line, Message.class);
                    System.out.println("Received from router: " + msg.getMessage());

                    // Return server message as response
                    msg.setMessage(serverMsg + " | Echo: " + msg.getMessage());
                    out.println(gson.toJson(msg));
                    // break; // If desired, close after a message, otherwise it can remain open permanently.
                }
                clientSocket.close();
                System.out.println("Client disconnected");
            }
        }
    }
}
