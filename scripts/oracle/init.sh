#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [ -f "${ROOT_DIR}/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "${ROOT_DIR}/.env"
  set +a
fi

CONTAINER="${ORACLE_CONTAINER:-oracle-db}"
ORACLE_USER="${ORACLE_USER:?Set ORACLE_USER}"
ORACLE_PASSWORD="${ORACLE_PASSWORD:?Set ORACLE_PASSWORD}"
ORACLE_CONNECT_STRING="${ORACLE_CONNECT_STRING:?Set ORACLE_CONNECT_STRING}"

# Path to the directory containing all your .sql scripts
SQL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "${SQL_DIR}" ]; then
  echo "Error: Directory ${SQL_DIR} does not exist."
  exit 1
fi

echo "Running Oracle initialization scripts from ${SQL_DIR}..."

for sql_file in "${SQL_DIR}"/*.sql; do
  [ -e "${sql_file}" ] || continue
  echo "Executing: $(basename "${sql_file}")"
  docker exec -i "${CONTAINER}" \
    sqlplus -s "${ORACLE_USER}/${ORACLE_PASSWORD}@${ORACLE_CONNECT_STRING}" \
    < "${sql_file}"
done