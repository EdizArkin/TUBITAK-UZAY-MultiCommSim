from flask import Flask, request, jsonify
import docker
import uuid
import time
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
docker_client = docker.from_env()

@app.route('/create-peer', methods=['POST'])
def create_peer():
    data = request.get_json()
    server_msg = data.get('serverMsg', '')
    client_msg = data.get('clientMsg', '')
    peer_id = str(uuid.uuid4())[:8]
    port = 6003

    # Eski containerları temizle
    for name in [f"server-{peer_id}", f"client-{peer_id}"]:
        try:
            docker_client.containers.get(name).remove(force=True)
        except:
            pass

    # Server container
    server_container = docker_client.containers.run(
        "java-message-server",
        name=f"server-{peer_id}",
        detach=True,
        environment={
            "SERVER_PORT": str(port),
            "SERVER_MSG": server_msg
        },
        network="docker_simnet",
        ports={f"{port}/tcp": None},
        remove=False,
        tty=True,
    )

    # Client container
    client_container = docker_client.containers.run(
        "java-message-client",
        name=f"client-{peer_id}",
        detach=True,
        environment={
            "CLIENT_ID": f"client-{peer_id}",
            "CLIENT_MSG": client_msg,
            "SERVER_HOST": f"server-{peer_id}",
            "SERVER_PORT": str(port),
            "ROUTER_HOST": "router",
            "ROUTER_PORT": str(port)
        },
        network="docker_simnet",
        remove=False,
        tty=True,
    )

    return jsonify({
        "message": "Peer created",
        "peerId": peer_id,
        "server": f"server-{peer_id}",
        "client": f"client-{peer_id}"
    })

@app.route('/run-test', methods=['POST'])
def run_test():
    logs = {}
    containers = docker_client.containers.list(all=True)

    # Mesajlaşmayı başlatmak için varsayılan olarak tüm container'lar zaten başlatılmış oluyor

    # Bekleme süresi (mesajlaşma tamamlanması için)
    time.sleep(4)

    # Logları topla
    for container in containers:
        if container.name.startswith("server-") or container.name.startswith("client-"):
            try:
                lines = container.logs().decode().splitlines()
                logs[container.name] = lines[-30:] if lines else ["No logs found."]
            except Exception as e:
                logs[container.name] = [f"Error reading logs: {e}"]

    # Containerları temizle
    for container in containers:
        if container.name.startswith("server-") or container.name.startswith("client-"):
            try:
                container.remove(force=True)
            except:
                pass

    return jsonify(logs)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
