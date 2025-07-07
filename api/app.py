from flask import Flask, jsonify, request
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
    print(f"DEBUG /create-peer received data: {data}")
    server_msg = data.get('serverMsg', '')
    client_msg = data.get('clientMsg', '')
    peer_id = str(uuid.uuid4())[:8]
    port = 6003

    # Aynı isimde eski container varsa kaldır
    for cname in [f"server-{peer_id}", f"client-{peer_id}"]:
        try:
            old = docker_client.containers.get(cname)
            old.remove(force=True)
        except Exception:
            pass

    # Server konteyneri - PASİF modda (ACTIVE=false)
    server_container = docker_client.containers.run(
        image="java-message-server",
        name=f"server-{peer_id}",
        detach=True,
        environment={
            "SERVER_PORT": str(port),
            "SERVER_MSG": server_msg,
        },
        network="docker_simnet",
        ports={f"{port}/tcp": None},
        remove=False,
        tty=True,
    )

    # Client konteyneri - PASİF modda (ACTIVE=false)
    client_container = docker_client.containers.run(
        image="java-message-client",
        name=f"client-{peer_id}",
        detach=True,
        environment={
            "SERVER_PORT": str(port),
            "SERVER_HOST": f"server-{peer_id}",
            "CLIENT_MSG": client_msg,
            "ROUTER_HOST": "router",
            "ROUTER_PORT": "6003",
            "CLIENT_ID": f"client-{peer_id}",
        },
        network="docker_simnet",
        remove=False,
        tty=True,
    )

    result = {
        "message": "Peer created (containers running in passive mode)",
        "peerId": peer_id,
        "port": port,
        "server": f"server-{peer_id}",
        "client": f"client-{peer_id}"
    }
    print(f"DEBUG /create-peer response: {result}")
    return jsonify(result)


@app.route('/run-test', methods=['POST'])
def run_test():
    logs = {}

    containers = docker_client.containers.list(all=True)
    # Aktifleşme için exec komutları gönder
    for container in containers:
        if container.name.startswith("server-") or container.name.startswith("client-"):
            try:
                print(f"Activating messaging in container {container.name}")
                # Örnek olarak: container içinde bir script varsa çalıştır
                # Burada kendi Java uygulamana uygun komutu yazmalısın
                exec_id = docker_client.api.exec_create(container.id, cmd="sh -c 'export ACTIVE=true && ./startMessaging.sh'")
                docker_client.api.exec_start(exec_id)
            except Exception as e:
                print(f"Error activating messaging in {container.name}: {e}")

    # Mesajlaşma başladıktan sonra logları topla
    time.sleep(5)  # Mesajlaşma için kısa bekleme (gerektiği kadar ayarla)

    for container in containers:
        if container.name.startswith("server-") or container.name.startswith("client-"):
            try:
                log_lines = container.logs().decode("utf-8").splitlines()
                if not isinstance(log_lines, list):
                    log_lines = [str(log_lines)]
                logs[container.name] = log_lines[-30:] if log_lines else ["No logs yet."]
            except Exception as e:
                logs[container.name] = [f"Log read error: {str(e)}"]

    # Test bitince konteynerları sil
    for container in containers:
        if container.name.startswith("server-") or container.name.startswith("client-"):
            try:
                container.remove(force=True)
            except Exception:
                pass

    print("DEBUG: Logs from /run-test:", logs)
    return jsonify(logs)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
