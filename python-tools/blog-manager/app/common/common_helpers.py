from dotenv import load_dotenv

def load_environment(dotenv_filename: str = ".env", debug: bool = True) -> None:
    """
    Loads environment variables from a .env file (for local development).

    ⚠️ ⚠️ ⚠️ ATTENTION !!! In production environments (e.g. systemd, Docker, or cloud hosting),
    environment variables should be configured at the OS or container level.

    Args:
        dotenv_filename (str): Name of the .env file to load. Defaults to '.env'.
        debug (bool): If True, prints the path being loaded. Defaults to True.
    """
    print(f"🔧 Loading environment variables from project root (debug mode)")

    load_dotenv()

def read_secret(secret_name):
    path = f"/run/secrets/{secret_name}"
    try:
        with open(path, "r") as file:
            return file.read().strip()
    except FileNotFoundError:
        return None