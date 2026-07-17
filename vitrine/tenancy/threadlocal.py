import threading

_thread_locals = threading.local()


def set_current_client(client):
    _thread_locals.client = client


def get_current_client():
    return getattr(_thread_locals, "client", None)


def clear_current_client():
    if hasattr(_thread_locals, "client"):
        del _thread_locals.client
