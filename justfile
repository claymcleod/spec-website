# Start development servers with CSS watching
dev: fetch-grammar
    #!/usr/bin/env bash
    set -e

    # Build CSS initially
    npx tailwindcss -i ./static/css/input.css -o ./static/css/style.css

    # Watch templates and content, rebuild CSS on changes
    (
        while true; do
            find templates content -type f -newer static/css/style.css 2>/dev/null | grep -q . && {
                echo "Detected template/content change, rebuilding CSS..."
                npx tailwindcss -i ./static/css/input.css -o ./static/css/style.css
            }
            sleep 0.5
        done
    ) &
    WATCH_PID=$!

    trap "kill $WATCH_PID 2>/dev/null" EXIT
    zola serve

fetch-grammar:
    mkdir -p syntaxes
    curl -sL https://raw.githubusercontent.com/stjude-rust-labs/sprocket-vscode/main/syntaxes/wdl.tmGrammar.json -o syntaxes/wdl.json

# Build production CSS
build-css:
    npm run build:css

# Build everything for production
build base_url="": fetch-grammar build-css
    zola build {{ if base_url != "" { "--base-url " + base_url } else { "" } }}

# Clean generated files
clean:
    rm -f static/css/style.css
    rm -rf public/
    rm -rf syntaxes/
