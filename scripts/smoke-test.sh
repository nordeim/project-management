#!/usr/bin/env bash
# ORBITAL end-to-end API smoke test.
# Boots the production standalone server, exercises auth + CRUD + status-update
# pipeline, prints PASS/FAIL per step, cleans up, exits non-zero on any failure.
set -u
cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"

BASE="http://localhost:3000"
CJ="/tmp/orbital-smoke-cookies.txt"
PASS=0; FAIL=0

say() { printf '%s\n' "$*"; }
ok()  { PASS=$((PASS+1)); say "PASS: $*"; }
bad() { FAIL=$((FAIL+1)); say "FAIL: $*"; }

# ---- 0. clean slate: kill any server holding port 3000 ----
pkill -f "standalone/server.js" 2>/dev/null
sleep 1
rm -f "$CJ" /tmp/smoke-*.json

# ---- 1. boot server ----
bun .next/standalone/server.js > /tmp/smoke-server.log 2>&1 < /dev/null &
SRV=$!
disown $SRV 2>/dev/null || true

ready=0
for i in $(seq 1 30); do
  if curl -s --max-time 2 "$BASE/api/health" | grep -q '"ok"'; then ready=1; break; fi
  sleep 1
done
if [ "$ready" != "1" ]; then
  bad "server did not become ready"; kill $SRV 2>/dev/null; exit 1
fi
ok "server ready (health check)"

# ---- 2. login ----
code=$(curl -s -o /tmp/smoke-login.json -w "%{http_code}" --max-time 10 \
  -c "$CJ" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@orbital.app","password":"Demo1234!"}')
if [ "$code" = "200" ] && grep -q '"ok":true' /tmp/smoke-login.json; then ok "login (200)"; else bad "login -> $code $(cat /tmp/smoke-login.json)"; fi

# ---- 3. wrong password must be rejected ----
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
  -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@orbital.app","password":"WrongPassword!"}')
if [ "$code" = "401" ]; then ok "wrong password rejected (401)"; else bad "wrong password -> $code"; fi

# ---- 4. unauthenticated access must be 401 ----
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/api/stats")
if [ "$code" = "401" ]; then ok "unauthenticated stats blocked (401)"; else bad "unauth stats -> $code"; fi

# ---- 5. reads ----
for ep in stats goals tasks team activity settings; do
  code=$(curl -s -o "/tmp/smoke-$ep.json" -w "%{http_code}" --max-time 10 -b "$CJ" "$BASE/api/$ep")
  if [ "$code" = "200" ] && grep -q '"ok":true' "/tmp/smoke-$ep.json"; then ok "GET /api/$ep"; else bad "GET /api/$ep -> $code"; fi
done

GOAL_ID=$(python3 -c "import json;print(json.load(open('/tmp/smoke-goals.json'))['data'][0]['id'])")

# ---- 6. create task ----
code=$(curl -s -o /tmp/smoke-task.json -w "%{http_code}" --max-time 10 -b "$CJ" \
  -X POST "$BASE/api/tasks" -H "Content-Type: application/json" \
  -d "{\"title\":\"SMOKE verify pipeline\",\"description\":\"temp\",\"goalId\":\"$GOAL_ID\",\"status\":\"pending\",\"estimatedHours\":1}")
if [ "$code" = "201" ] && grep -q '"ok":true' /tmp/smoke-task.json; then ok "create task (201)"; else bad "create task -> $code $(cat /tmp/smoke-task.json)"; fi
TASK_ID=$(python3 -c "import json;print(json.load(open('/tmp/smoke-task.json'))['data']['id'])" 2>/dev/null)

# ---- 7. invalid status must be rejected ----
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -b "$CJ" \
  -X POST "$BASE/api/tasks" -H "Content-Type: application/json" \
  -d "{\"title\":\"bad\",\"goalId\":\"$GOAL_ID\",\"status\":\"todo\"}")
if [ "$code" = "400" ]; then ok "invalid status rejected (400)"; else bad "invalid status -> $code"; fi

if [ -n "${TASK_ID:-}" ]; then
  # ---- 8. post status update (done + note) ----
  code=$(curl -s -o /tmp/smoke-upd.json -w "%{http_code}" --max-time 10 -b "$CJ" \
    -X POST "$BASE/api/tasks/$TASK_ID/updates" -H "Content-Type: application/json" \
    -d '{"status":"done","note":"smoke test note"}')
  if [ "$code" = "201" ]; then ok "post status update (201)"; else bad "status update -> $code"; fi

  # ---- 9. verify task status flipped + update recorded ----
  curl -s --max-time 10 -b "$CJ" "$BASE/api/tasks/$TASK_ID" -o /tmp/smoke-verify.json
  if python3 -c "import json,sys; d=json.load(open('/tmp/smoke-verify.json'))['data']; sys.exit(0 if (d['status']=='done' and len(d.get('updates',[]))>=1) else 1)"; then
    ok "task status flipped + update recorded"
  else
    bad "status flip verification"
  fi

  # ---- 10. delete ----
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -b "$CJ" -X DELETE "$BASE/api/tasks/$TASK_ID")
  if [ "$code" = "200" ]; then ok "delete task (200)"; else bad "delete task -> $code"; fi
fi

# ---- 11. logout ----
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -b "$CJ" -c "$CJ" -X POST "$BASE/api/auth/logout")
if [ "$code" = "200" ]; then ok "logout (200)"; else bad "logout -> $code"; fi

# ---- 12. session cookie invalidated after logout ----
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -b "$CJ" "$BASE/api/stats")
if [ "$code" = "401" ]; then ok "post-logout stats blocked (401)"; else bad "post-logout stats -> $code"; fi

# ---- 13. page render ----
code=$(curl -s -o /tmp/smoke-page.html -w "%{http_code}" --max-time 15 "$BASE/")
if [ "$code" = "200" ] && grep -q "<!DOCTYPE html" /tmp/smoke-page.html; then ok "page renders (200)"; else bad "page render -> $code"; fi

# ---- shutdown ----
kill $SRV 2>/dev/null
say ""
say "RESULT: $PASS passed, $FAIL failed"
[ "$FAIL" = "0" ]
