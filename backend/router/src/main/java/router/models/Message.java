package router.models;

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

