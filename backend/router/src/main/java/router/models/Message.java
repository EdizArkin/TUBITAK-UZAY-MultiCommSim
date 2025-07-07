package router.models;

public class Message {
    private String clientId;
    private String targetIp;
    private String message;

    public String getClientId() {
        return clientId;
    }
    public String getMessage() {
        return message;
    }
    public String getTargetIp() {
        return targetIp;
    }
    public void setClientId(String clientId) {
        this.clientId = clientId;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public void setTargetIp(String targetIp) {
        this.targetIp = targetIp;
    }
}
