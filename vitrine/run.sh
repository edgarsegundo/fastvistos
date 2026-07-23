#!/bin/sh
set -e

cd /app

# migrate NÃO roda automaticamente aqui — fica a cargo do rebuild.sh, que
# pergunta interativamente (mesmo padrão do emprego/rebuild.sh). Rodar
# sempre aqui tornaria essa pergunta enganosa (pareceria opcional, mas não
# seria).

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
