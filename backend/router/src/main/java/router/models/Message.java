package router.models;

/**
 * Message is a simple data model representing a client message 
 * to be routed to a target server.
 *
 * Fields:
 * - clientId: Unique identifier of the client sending the message.
 * - targetIp: Hostname or IP address of the intended server.
 * - message: The content of the message to be delivered.
 *
 * Used for JSON serialization and communication through the router.
 */


public class Message {
    private String clientId;
    private String targetIp;
    private String message;

    // getters/setters
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getTargetIp() { return targetIp; }
    public void setTargetIp(String targetIp) { this.targetIp = targetIp; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

