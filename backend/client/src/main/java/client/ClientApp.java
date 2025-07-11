package client;

import java.io.*;
import java.net.*;
/**
 * ClientApp connects to the central router using TCP,
 * sends a serialized message (JSON) to a target server,
 * and prints the response received from the router.
 *
 * Environment variables define client ID, router address, target server, and message content.
 * 
 * Used as a one-shot client: starts, sends message, receives response, then exits.
 */


public class ClientApp {
    public static void main(String[] args) {
        String serverHost = System.getenv().getOrDefault("SERVER_HOST", "localhost");
        int serverPort = Integer.parseInt(System.getenv().getOrDefault("SERVER_PORT", "6003"));
        String msg = System.getenv().getOrDefault("CLIENT_MSG", "Hello from client");

        int retries = 5;
        int delay = 2000; // 2 seconds

        while (retries-- > 0) {
            try (Socket socket = new Socket(serverHost, serverPort);
                 BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                 PrintWriter out = new PrintWriter(socket.getOutputStream(), true)) {

                System.out.println("Connected to server at " + serverHost + ":" + serverPort);
                // Send the message to the server
                System.out.println("Sending message to server: " + msg);
                out.println(msg);
                String reply = in.readLine();
                System.out.println("Received from server: " + reply);
                // Client container canlı kalsın (örn. 60 saniye)
                try {
                    System.out.println("Client will stay alive for 60 seconds...");
                    Thread.sleep(60000);
                } catch (InterruptedException ignored) {}
                return;

            } catch (IOException e) {
                System.out.println("Connection failed, retrying...");
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    break;
                }
            }
        }

        System.out.println("Failed to connect to server after retries.");
    }
}
