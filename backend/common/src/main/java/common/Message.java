package common;

/**
 * Message is a simple data model representing a client message 
 * to be routed to a target server.
 *
 * Fields:
 * - clientId: Unique identifier of the client sending the message.
 * - targetIp: Hostname or IP address of the intended server.
 * - message: The content of the message to be delivered.
 *
 */
import java.time.LocalDateTime;

public class Message {
    private String clientId;
    private Integer serverId;
    private String targetIp;
    private String message;
    private String timestamp;
    private String type;

    public Message() {}

    public Message(String clientId, Integer serverId, String targetIp, String message, String type) {
        this.clientId = clientId;
        this.serverId = serverId;
        this.targetIp = targetIp;
        this.message = message;
        this.type = type;
        this.timestamp = LocalDateTime.now().toString();
    }

    // JSON log format constructor
    public Message(String clientId, Integer serverId, String type, String message) {
        this.clientId = clientId;
        this.serverId = serverId;
        this.type = type;
        this.message = message;
        this.timestamp = LocalDateTime.now().toString();
    }

    @Override
    public String toString() {
        return "{" +
                "\"timestamp\": \"" + timestamp + "\"," +
                (clientId != null ? "\"clientId\": \"" + clientId + "\"," : "") +
                (serverId != null ? "\"serverId\": " + serverId + "," : "") +
                (type != null ? "\"type\": \"" + type + "\"," : "") +
                (message != null ? "\"message\": \"" + message.replace("\"", "\\\"") + "\"," : "") +
                (targetIp != null ? "\"targetIp\": \"" + targetIp + "\"," : "") +
                "}";
    }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public Integer getServerId() { return serverId; }
    public void setServerId(Integer serverId) { this.serverId = serverId; }

    public String getTargetIp() { return targetIp; }
    public void setTargetIp(String targetIp) { this.targetIp = targetIp; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
