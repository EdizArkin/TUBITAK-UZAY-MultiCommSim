package client;


import java.io.*;
import java.net.*;
import common.Message;
import common.JsonUtils;
import common.LogEntry;


public class ClientApp {
    public static void main(String[] args) {
        String serverHost = System.getenv().getOrDefault("SERVER_HOST", "localhost");
        int serverPort = Integer.parseInt(System.getenv().getOrDefault("SERVER_PORT", "6003"));
        String clientId = System.getenv().getOrDefault("CLIENT_ID", "client-unknown");
        String msg = System.getenv().getOrDefault("CLIENT_MSG", "Hello from client");

        int retries = 5;
        int delay = 1500; // 1,5 seconds

        while (retries-- > 0) {
            try (Socket socket = new Socket(serverHost, serverPort);
                 BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                 PrintWriter out = new PrintWriter(socket.getOutputStream(), true)) {

                System.out.println("Connected to server at " + serverHost + ":" + serverPort);
                // Send the message as JSON
                Message messageObj = new Message(clientId, null, null, msg, "Client Sends");
                String jsonMsg = JsonUtils.toJson(messageObj);
                System.out.println("Sending message to server: " + jsonMsg);
                out.println(jsonMsg);
                out.flush();
                LogEntry log = new LogEntry(clientId, null, "Client Sends", msg);
                System.out.println(JsonUtils.toJson(log));
                String replyJson = in.readLine();
                System.out.println("Received from server: " + replyJson);
                if (replyJson != null) {
                    try {
                        Message replyMsg = JsonUtils.fromJson(replyJson, Message.class);
                        LogEntry serverLog = new LogEntry(clientId, replyMsg.getServerId(), replyMsg.getType(), replyMsg.getMessage());
                        System.out.println(JsonUtils.toJson(serverLog));
                    } catch (Exception e) {
                        System.out.println("Invalid reply format: " + replyJson);
                    }
                }
                // Client container canlı kalsın (örn. 60 saniye)
                //aşşağıdaki çıkartılabilir
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
