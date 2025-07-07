package client;

import java.io.*;
import java.net.*;
import com.google.gson.Gson;
import router.models.Message;

public class ClientApp {
    public static void main(String[] args) throws InterruptedException {
        String activeEnv = System.getenv().getOrDefault("ACTIVE", "true");
        boolean isActive = activeEnv.equalsIgnoreCase("true");

        while (!isActive) {
            System.out.println("Client inactive. Waiting to become active...");
            Thread.sleep(3000);
            activeEnv = System.getenv().getOrDefault("ACTIVE", "true");
            isActive = activeEnv.equalsIgnoreCase("true");
        }

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

            Message msg = new Message();
            msg.setClientId(clientId);
            msg.setTargetIp(targetServer);
            msg.setMessage(clientMsg);
            out.println(gson.toJson(msg));

            String response = in.readLine();
            System.out.println("Router replied: " + response);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
