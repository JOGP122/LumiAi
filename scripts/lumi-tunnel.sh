#!/bin/zsh
# Lumi quick-tunnel supervisor (localhost.run over SSH).
# Держит ssh-туннель живым; при каждом новом URL перерегистрирует Telegram webhook
# и кнопку мини-аппа через /api/telegram/setup (токен берёт сервер из .env / saved config).
# SSH выбран вместо cloudflared: использует системный DNS (mDNSResponder), переживает
# краткие просадки резолва, которые роняют cloudflared (пустой /etc/resolv.conf на macOS).
LOG_DIR="$HOME/LumiAi/logs"
mkdir -p "$LOG_DIR"
STACK_LOG="$LOG_DIR/tunnel.log"
TUN_LOG="$LOG_DIR/tunnel-ssh.log"
APP="http://localhost:3000"

register() {
  local url="$1"
  for i in {1..60}; do
    curl -sf -m 3 "$APP/api/telegram/status" >/dev/null 2>&1 && break
    sleep 2
  done
  local result
  result=$(curl -s -m 25 -X POST "$APP/api/telegram/setup" \
    -H 'Content-Type: application/json' \
    -d "{\"appUrl\":\"$url\"}")
  echo "$(date '+%F %T') setup $url -> $result" >> "$STACK_LOG"
}

while true; do
  echo "$(date '+%F %T') starting ssh tunnel" >> "$STACK_LOG"
  ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3 \
      -o ExitOnForwardFailure=yes -R 80:127.0.0.1:3000 nokey@localhost.run > "$TUN_LOG" 2>&1 &
  TPID=$!
  URL=""
  for i in {1..45}; do
    sleep 2
    URL=$(grep -oE 'https://[a-z0-9.-]+\.lhr\.life' "$TUN_LOG" | tail -1)
    [ -n "$URL" ] && break
    kill -0 $TPID 2>/dev/null || break
  done
  if [ -n "$URL" ]; then
    echo "$(date '+%F %T') tunnel url: $URL" >> "$STACK_LOG"
    register "$URL"
    while kill -0 $TPID 2>/dev/null; do sleep 20; done
    echo "$(date '+%F %T') tunnel died, restarting" >> "$STACK_LOG"
  else
    kill $TPID 2>/dev/null
    echo "$(date '+%F %T') no tunnel url, retry in 10s" >> "$STACK_LOG"
    sleep 10
  fi
done
 свежим URL в логе
      NOW=$(grep -oE 'https://[a-z0-9.-]+\.lhr\.life' "$TUN_LOG" | tail -1)
      if [ -n "$NOW" ] && [ "$NOW" != "$LAST" ]; then
        echo "$(date '+%F %T') mid-session rotation: $LAST -> $NOW" >> "$STACK_LOG"
        register "$NOW"
        LAST="$NOW"
      fi
    done
    echo "$(date '+%F %T') tunnel died, restarting" >> "$STACK_LOG"
  else
    kill $TPID 2>/dev/null
    echo "$(date '+%F %T') no tunnel url, retry in 10s" >> "$STACK_LOG"
    sleep 10
  fi
done
