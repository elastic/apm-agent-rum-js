# Ensure local bin is in PATH, needed for updated docker-compose, see https://github.com/elastic/observability-robots/issues/2960
PATH="$HOME/.local/bin:$PATH" ELASTICSEARCH_PORT=9201 STACK_VERSION=8.19.6 APM_SERVER_PORT=8001 docker compose up apm-server kibana
