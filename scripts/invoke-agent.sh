#!/usr/bin/env bash
set -euo pipefail

# Simple helper to invoke the Dify Agent Invoke API with optional payload.
# Shows response headers (including x-request-id) and body.
#
# Usage:
#   scripts/invoke-agent.sh <AGENT_ID> [JSON_PAYLOAD_FILE]
#
# Env vars:
#   BASE_URL           Default: http://localhost:3000
#   AUTH_BEARER        Optional: Bearer token if your route requires it
#   VERBOSE            If set, curl will be verbose
#
# Note: Firewall mode (enforce/shadow/off) is configured on the server via ENV (FIREWALL_MODE),
#       not via this client script. Ensure your Next.js server was started with the desired ENV.

BASE_URL=${BASE_URL:-http://localhost:3000}
AUTH_BEARER=${AUTH_BEARER:-}
VERBOSE=${VERBOSE:-}

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <AGENT_ID> [JSON_PAYLOAD_FILE]" >&2
  exit 1
fi

AGENT_ID="$1"
PAYLOAD_FILE="${2:-}"

if [[ -n "$PAYLOAD_FILE" ]]; then
  if [[ ! -f "$PAYLOAD_FILE" ]]; then
    echo "Payload file not found: $PAYLOAD_FILE" >&2
    exit 1
  fi
  CONTENT_ARG=(--data-binary @"$PAYLOAD_FILE")
else
  # Default payload
  CONTENT_ARG=(--data '{"input":"hello"}')
fi

AUTH_HEADER=()
if [[ -n "$AUTH_BEARER" ]]; then
  AUTH_HEADER=(-H "Authorization: Bearer $AUTH_BEARER")
fi

URL="$BASE_URL/api/agents/$AGENT_ID/invoke"

if [[ -n "$VERBOSE" ]]; then
  set -x
fi

# -i to show headers, including x-request-id
# -sS silent but show errors
if [[ ${#AUTH_HEADER[@]} -gt 0 ]]; then
  curl -i -sS \
    -X POST \
    -H 'Content-Type: application/json' \
    "${AUTH_HEADER[@]}" \
    "${CONTENT_ARG[@]}" \
    "$URL"
else
  curl -i -sS \
    -X POST \
    -H 'Content-Type: application/json' \
    "${CONTENT_ARG[@]}" \
    "$URL"
fi
