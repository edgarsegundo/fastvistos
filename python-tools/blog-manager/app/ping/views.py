from quart import Blueprint, jsonify

ping_bp = Blueprint("ping", __name__)

@ping_bp.route("/", methods=["GET"])
async def main():
    return jsonify("pong")
