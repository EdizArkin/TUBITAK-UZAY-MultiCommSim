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
            "SERVER_MSG": server_msg,
            "SERVER_ID": server_id
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
                net_info = server_container.attrs.get("NetworkSettings", {}).get("Networks", {}).get("docker_simnet", {})
                if net_info and net_info.get("IPAddress"):
                    break
        except docker.errors.NotFound:
            pass
        time.sleep(1)
    else:
        return jsonify({"error": f"Server container {server_container_name} not ready"}), 500

    # Start client container in interactive mode and keep it alive until run-test
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
        network="docker_simnet",
        tty=True,  # keep container open
        command=["sh", "-c", "java -cp app.jar client.ClientApp && tail -f /dev/null"]
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



@app.route('/clients', methods=['GET'])
def list_clients():
    clients = []
    for container in docker_client.containers.list(all=True):
        if container.name.startswith("client-"):
            server_id = None
            try:
                import sys
                envs = container.attrs.get('Config', {}).get('Env', [])
                app.logger.warning(f"[DEBUG] {container.name} envs: {envs}")
                sys.stderr.flush()
                for env in envs:
                    if env.startswith('SERVER_HOST='):
                        server_host_value = env.split('=', 1)[1]
                        app.logger.warning(f"[DEBUG] {container.name} SERVER_HOST env: '{server_host_value}'")
                        sys.stderr.flush()
                        match = re.search(r"docker-server-(\d+)", server_host_value)
                        app.logger.warning(f"[DEBUG] {container.name} regex search: {match}")
                        sys.stderr.flush()
                        if match:
                            server_id = int(match.group(1))
            except Exception as e:
                app.logger.warning(f"[DEBUG] Exception for {container.name}: {e}")
                sys.stderr.flush()
            clients.append({
                "clientId": container.name,
                "serverId": server_id,
                "envs": envs  # DEBUG: Return envs for inspection
            })
    return jsonify(clients)



@app.route('/run-test', methods=['POST'])

def run_test():
    time.sleep(5)

    logs = {}
    containers = docker_client.containers.list(all=True)
    # Sunucuları id'ye göre sırala
    server_containers = sorted(
        [c for c in containers if c.name.startswith("docker-server-")],
        key=lambda c: int(re.match(r"docker-server-(\d+)", c.name).group(1))
    )
    # Client'ları isim sırasına göre sırala (veya istenirse başka bir kritere göre)
    client_containers = sorted(
        [c for c in containers if c.name.startswith("client-")],
        key=lambda c: c.name
    )


    # Kullanıcı dostu özetli log başlıkları ve içerikleri
    for idx, server in enumerate(server_containers, 1):
        try:
            server.reload()
            status = server.status
            log_output = server.logs(stdout=True, stderr=True).decode('utf-8', errors='replace')
            if not log_output.strip():
                log_output = f"[WARN] No logs captured from {server.name} (status: {status})"
            # Sadece önemli satırları öne çıkar
            lines = log_output.splitlines()
            pretty_lines = []
            for line in lines:
                if 'Server started' in line:
                    pretty_lines.append(f"🟢 [Started] {line}")
                elif 'Client connected' in line:
                    pretty_lines.append(f"🔗 [Connection] {line}")
                elif 'RAW:' in line:
                    pretty_lines.append(f"⬇️ [Incoming JSON] {line.replace('RAW: ', '')}")
                elif 'type":"Client Sends"' in line:
                    pretty_lines.append(f"✉️ [Client Message] {line}")
                elif 'type":"Server Reply"' in line:
                    pretty_lines.append(f"✅ [Server Reply] {line}")
                else:
                    pretty_lines.append(f"{line}")
            logs[f"🖥️ Server #{idx}"] = '\n'.join(pretty_lines)
        except Exception as e:
            logs[f"🖥️ Server #{idx}"] = f"[ERROR] Could not fetch logs: {str(e)}"

    for idx, client in enumerate(client_containers, 1):
        try:
            client.reload()
            status = client.status
            log_output = client.logs(stdout=True, stderr=True).decode('utf-8', errors='replace')
            if not log_output.strip():
                log_output = f"[WARN] No logs captured from {client.name} (status: {status})"
            lines = log_output.splitlines()
            pretty_lines = []
            for line in lines:
                if 'Connected to server at' in line:
                    pretty_lines.append(f"🔗 [Connected] {line}")
                elif 'Sending message to server:' in line:
                    pretty_lines.append(f"✉️ [Sent] {line}")
                elif 'Received from server:' in line:
                    pretty_lines.append(f"✅ [Server Reply] {line}")
                elif 'will stay alive' in line:
                    pretty_lines.append(f"⏳ [Info] {line}")
                elif 'type":"Client Sends"' in line:
                    pretty_lines.append(f"✉️ [Client Message] {line}")
                elif 'type":"Server Reply"' in line:
                    pretty_lines.append(f"✅ [Server Reply] {line}")
                else:
                    pretty_lines.append(f"{line}")
            logs[f"💻 Client #{idx}"] = '\n'.join(pretty_lines)
        except Exception as e:
            logs[f"💻 Client #{idx}"] = f"[ERROR] Could not fetch logs: {str(e)}"

    # Loglar alındıktan sonra containerları sil
    for container in containers:
        if container.name.startswith("docker-server-") or container.name.startswith("client-"):
            try:
                container.remove(force=True)
            except Exception as e:
                pass  # Silinemeyen container için hata bastırılır

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
