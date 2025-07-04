from flask import Flask, jsonify
import docker
import time
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
client = docker.from_env()

def restart_container(name):
    container = client.containers.get(name)
    container.restart()
    return container


@app.route('/run-test')
def run_test():
    try:
        server_container = restart_container("java-message-server")
        time.sleep(2)  # Server biraz başlasın
        client_container = restart_container("java-message-client")

        client_container.wait()  # Client bitene kadar bekle
        time.sleep(1)  # Loglar için kısa bekleme

        client_logs = client_container.logs().decode("utf-8").splitlines()
        server_logs = server_container.logs().decode("utf-8").splitlines()[-30:]

        return jsonify({
            "client": client_logs,
            "server": server_logs
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
