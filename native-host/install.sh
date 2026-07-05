#!/bin/bash
# Skill Bridge Native Messaging Host Installer for macOS / Linux

echo "============================================="
echo " Skill Bridge Native Host Installer (macOS/Linux) "
echo "============================================="
echo ""

read -p "Enter your Skill Bridge Extension ID: " EXTENSION_ID
EXTENSION_ID=$(echo "$EXTENSION_ID" | tr -d '[:space:]')

if [ -z "$EXTENSION_ID" ]; then
    echo "Error: Extension ID cannot be empty!"
    exit 1
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SH_PATH="$DIR/run.sh"
MANIFEST_PATH="$DIR/com.skillbridge.sync.json"

# Check for platform-specific standalone binary
TARGET_BIN=""
if [ "$(uname)" == "Darwin" ]; then
    TARGET_BIN="$DIR/bin/skill-bridge-sync-macos"
else
    TARGET_BIN="$DIR/bin/skill-bridge-sync-linux"
fi

HOST_PATH="$SH_PATH"
if [ -f "$TARGET_BIN" ]; then
    HOST_PATH="$TARGET_BIN"
    chmod +x "$HOST_PATH"
    echo "Detected compiled standalone binary. Registering binary directly (Node-free mode)."
else
    chmod +x "$SH_PATH"
    echo "No compiled binary found. Falling back to development wrapper (Node.js mode)."
fi

# Generate native manifest
cat <<EOF > "$MANIFEST_PATH"
{
  "name": "com.skillbridge.sync",
  "description": "Skill Bridge Native Sync Companion",
  "path": "$HOST_PATH",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://$EXTENSION_ID/"
  ]
}
EOF

echo "Generated native host manifest at: $MANIFEST_PATH"

# Determine browser config folders
if [ "$(uname)" == "Darwin" ]; then
    # macOS paths
    CHROME_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
    EDGE_DIR="$HOME/Library/Application Support/Microsoft Edge/NativeMessagingHosts"
else
    # Linux paths
    CHROME_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
    EDGE_DIR="$HOME/.config/microsoft-edge/NativeMessagingHosts"
fi

mkdir -p "$CHROME_DIR"
cp "$MANIFEST_PATH" "$CHROME_DIR/com.skillbridge.sync.json"
echo "Registered native host in Google Chrome."

if [ -d "$(dirname "$EDGE_DIR")" ] || [ "$(uname)" == "Darwin" ]; then
    mkdir -p "$EDGE_DIR"
    cp "$MANIFEST_PATH" "$EDGE_DIR/com.skillbridge.sync.json"
    echo "Registered native host in Microsoft Edge."
fi

echo ""
echo "Installation completed successfully! Please reload the extension in your browser."
