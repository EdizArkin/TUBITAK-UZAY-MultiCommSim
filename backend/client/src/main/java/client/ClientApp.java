package client;

import java.io.*;
import java.net.*;
import com.google.gson.Gson;
import router.models.Message;
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
        String routerHost = System.getenv().getOrDefault("ROUTER_HOST", "router");
        int routerPort = Integer.parseInt(System.getenv().getOrDefault("ROUTER_PORT", "6003"));
        String clientId = System.getenv().getOrDefault("CLIENT_ID", "client-" + System.currentTimeMillis());
        String targetServer = System.getenv().getOrDefault("SERVER_HOST", "java-message-server");
        String clientMsg = System.getenv().getOrDefault("CLIENT_MSG", "Hello from client!");

        Gson gson = new Gson();

        try (Socket socket = new Socket(routerHost, routerPort);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true)) {

            System.out.println("Connected to router");

            // Send message as JSON to router
            Message msg = new Message();
            msg.setClientId(clientId);
            msg.setTargetIp(targetServer);
            msg.setMessage(clientMsg);
            out.println(gson.toJson(msg));

            // Get the response from the router
            String response = in.readLine();
            System.out.println("Router replied: " + response);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
