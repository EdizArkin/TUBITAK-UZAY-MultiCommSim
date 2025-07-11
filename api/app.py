from flask import Flask, request, jsonify
import docker
import uuid
import re
import time
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
docker_client = docker.from_env()

def ensure_simnet_network():
    """Ensure the custom Docker network 'docker_simnet' exists."""
    try:
        docker_client.networks.get("docker_simnet")
    except docker.errors.NotFound:
        docker_client.networks.create("docker_simnet", driver="bridge")

@app.route('/create-server', methods=['POST'])
def create_server():
    ensure_simnet_network()
    data = request.get_json()
    server_msg = data.get('serverMsg', '')
    server_id = get_next_server_id()  # örn: 1, 2, 3...

    container = docker_client.containers.run(
        "java-message-server",
        name=f"docker-server-{server_id}",
        detach=True,
        environment={
            "SERVER_PORT": "6003",
            "SERVER_MSG": server_msg
        },
        network="docker_simnet"
    )

    return jsonify({
        "message": "Server created",
        "serverId": server_id
    })



@app.route('/create-client', methods=['POST'])
def create_client():
    ensure_simnet_network()
    time.sleep(2)
    data = request.get_json()
    client_msg = data.get('clientMsg', '')
    server_id = data.get('serverId')

    client_id = f"client-{uuid.uuid4().hex[:8]}"
    server_container_name = f"docker-server-{server_id}"

    # Wait for the server container to be running and have an IP
    server_container = None
    for _ in range(10):
        try:
            server_container = docker_client.containers.get(server_container_name)
            if server_container.status != "running":
                server_container.reload()
            if server_container.status == "running":
                # Check if it has an IP in docker_simnet
                net_info = server_container.attrs.get("NetworkSettings", {}).get("Networks", {}).get("docker_simnet", {})
                if net_info and net_info.get("IPAddress"):
                    break
        except docker.errors.NotFound:
            pass
        time.sleep(1)
    else:
        return jsonify({"error": f"Server container {server_container_name} not ready"}), 500

    container = docker_client.containers.run(
        "java-message-client",
        name=client_id,
        detach=True,
        environment={
            "CLIENT_ID": client_id,
            "CLIENT_MSG": client_msg,
            "SERVER_HOST": server_container_name,
            "SERVER_PORT": "6003"
        },
        network="docker_simnet"
    )

    return jsonify({
        "message": "Client created",
        "clientId": client_id,
        "serverId": server_id
    })



@app.route('/servers', methods=['GET'])
def list_servers():
    servers = []
    for container in docker_client.containers.list(all=True):
        match = re.match(r"docker-server-(\d+)", container.name)
        if match:
            servers.append({
                "id": int(match.group(1)),
                "name": container.name
            })
    return jsonify(servers)



@app.route('/run-test', methods=['POST'])
def run_test():
    time.sleep(5)

    logs = {}
    for container in docker_client.containers.list(all=True):
        if container.name.startswith("server-") or container.name.startswith("client-"):
            log_output = container.logs().decode('utf-8')
            logs[container.name] = log_output

    for container in docker_client.containers.list(all=True):
        if container.name.startswith("server-") or container.name.startswith("client-"):
            container.remove(force=True)

    return jsonify(logs)


def get_next_server_id():
    existing_ids = []
    for container in docker_client.containers.list(all=True):
        match = re.match(r"docker-server-(\d+)", container.name)  # düzeltilmiş regex
        if match:
            existing_ids.append(int(match.group(1)))
    return max(existing_ids + [0]) + 1



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
