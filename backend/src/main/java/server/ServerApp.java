// server/ServerApp.java
package server;

import java.io.*;
import java.net.*;

public class ServerApp {
    public static void main(String[] args) {
        int port = 12345;
        System.out.println("Server starting on port " + port);

        try (ServerSocket serverSocket = new ServerSocket(port)) {
            while (true) {
                Socket clientSocket = serverSocket.accept();
                System.out.println("Client connected: " + clientSocket.getInetAddress());

                BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);

                String line;
                while ((line = in.readLine()) != null) {
                    System.out.println("Received from client: " + line);
                    out.println("Echo: " + line);

                    if (line.equalsIgnoreCase("bye")) {
                        System.out.println("Client disconnected.");
                        break;
                    }
                }

                clientSocket.close();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
