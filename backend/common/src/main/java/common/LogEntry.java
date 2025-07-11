package common;

import java.time.LocalDateTime;

/**
 * LogEntry is a model for structured JSON log messages.
 * Fields:
 * - timestamp: ISO string
 * - clientId: client id (nullable)
 * - serverId: server id (nullable)
 * - type: log type (info, error, etc)
 * - message: log message
 */
public class LogEntry {
    private String timestamp;
    private String clientId;
    private Integer serverId;
    private String type;
    private String message;

    public LogEntry() {}

    public LogEntry(String clientId, Integer serverId, String type, String message) {
        this.timestamp = LocalDateTime.now().toString();
        this.clientId = clientId;
        this.serverId = serverId;
        this.type = type;
        this.message = message;
    }

    public String getTimestamp() { return timestamp; }
    public String getClientId() { return clientId; }
    public Integer getServerId() { return serverId; }
    public String getType() { return type; }
    public String getMessage() { return message; }

    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public void setServerId(Integer serverId) { this.serverId = serverId; }
    public void setType(String type) { this.type = type; }
    public void setMessage(String message) { this.message = message; }
}
