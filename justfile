# Start development servers
dev: fetch-grammar build-css
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
