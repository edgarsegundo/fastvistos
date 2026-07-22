#!/bin/sh
set -e

cd /app

echo "Aplicando migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting gunicorn..."
# --max-requests/--max-requests-jitter: recicla workers periodicamente pra
# evitar degradação de memória progressiva (mesma lição documentada em
# emprego/docs/README.gunicorn-docker-optimization.md).
exec gunicorn vitrine_core.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --max-requests 500 \
    --max-requests-jitter 100 \
    --log-level info
