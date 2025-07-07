package server;

import java.io.*;
import java.net.*;
import com.google.gson.Gson;
import router.models.Message;

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

                    // Cevap olarak server mesajını döndür
                    msg.setMessage(serverMsg + " | Echo: " + msg.getMessage());
                    out.println(gson.toJson(msg));
                    // break; // İstersen bir mesajdan sonra kapatma, yoksa kalıcı açık kalabilir.
                }
                clientSocket.close();
                System.out.println("Client disconnected");
            }
        }
    }
}
