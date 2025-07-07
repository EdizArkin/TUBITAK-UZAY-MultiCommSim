package server;

import java.io.*;
import java.net.*;
import com.google.gson.Gson;
import router.models.Message;

public class ServerApp {
    public static void main(String[] args) throws IOException, InterruptedException {
        String activeEnv = System.getenv().getOrDefault("ACTIVE", "true");
        boolean isActive = activeEnv.equalsIgnoreCase("true");

        while (!isActive) {
            System.out.println("Server inactive. Waiting to become active...");
            Thread.sleep(3000);
            activeEnv = System.getenv().getOrDefault("ACTIVE", "true");
            isActive = activeEnv.equalsIgnoreCase("true");
        }

        int port = Integer.parseInt(System.getenv().getOrDefault("SERVER_PORT", "6003"));
        String serverMsg = System.getenv().getOrDefault("SERVER_MSG", "Hello from server!");

        ServerSocket serverSocket = new ServerSocket(port);
        System.out.println("Server started on port " + port);

        Socket clientSocket = serverSocket.accept();
        BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
        PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
        Gson gson = new Gson();

        String line;
        while ((line = in.readLine()) != null) {
            Message msg = gson.fromJson(line, Message.class);
            System.out.println("Received from router: " + msg.getMessage());
            msg.setMessage(serverMsg + " | Echo: " + msg.getMessage());
            out.println(gson.toJson(msg));
            break;
        }

        clientSocket.close();
        serverSocket.close();
    }
}
