// client/ClientApp.java
package client;

import java.io.*;
import java.net.*;

public class ClientApp {
    public static void main(String[] args) {
        String host = "java-message-server";  // docker container ismi
        int port = 12345;

        String[] messages = {
            "Hello server!",
            "How are you?",
            "This is a non-interactive client.",
            "bye"
        };

        try (Socket socket = new Socket(host, port);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true)) {

            System.out.println("Connected to server.");

            for (String msg : messages) {
                System.out.println("Sending: " + msg);
                out.println(msg);

                String response = in.readLine();
                System.out.println("Server replied: " + response);

                if (msg.equalsIgnoreCase("bye")) break;
                Thread.sleep(300);
            }

            System.out.println("Client stopped.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
