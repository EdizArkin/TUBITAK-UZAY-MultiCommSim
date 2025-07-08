from flask import Flask, request, jsonify
import docker
import uuid
import time
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
docker_client = docker.from_env()

"""
Flask-based REST API to manage Docker-based client-server peer pairs for messaging tests.

Endpoints:
- POST /create-peer: Creates and starts paired server and client Docker containers with specified messages.
- POST /run-test: Waits briefly for messaging to complete, collects logs from all client/server containers, then removes them.

Uses Docker Python SDK to control containers within a custom Docker network ("docker_simnet").

Designed to facilitate dynamic testing of client-server messaging in isolated containerized environments.
"""


@app.route('/create-peer', methods=['POST'])
def create_peer():
    data = request.get_json()
    server_msg = data.get('serverMsg', '')
    client_msg = data.get('clientMsg', '')
    peer_id = str(uuid.uuid4())[:8]
    port = 6003

    # Clean up old containers
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

    # By default, all containers are already started to start messaging

    # Waiting time (for messaging completion)
    time.sleep(4)

    # Collect logs
    for container in containers:
        if container.name.startswith("server-") or container.name.startswith("client-"):
            try:
                lines = container.logs().decode().splitlines()
                logs[container.name] = lines[-30:] if lines else ["No logs found."]
            except Exception as e:
                logs[container.name] = [f"Error reading logs: {e}"]

    # Clean containers - 
    # if there is a container that you want to leave open among the opened server-client peers, you can change it here!
    for container in containers:
        if container.name.startswith("server-") or container.name.startswith("client-"):
            try:
                container.remove(force=True)
            except:
                pass

    return jsonify(logs)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
