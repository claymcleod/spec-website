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

# Run accessibility tests (requires dev server running)
a11y: a11y-dark a11y-light

# Run accessibility tests in dark mode
a11y-dark:
    @echo "Running accessibility tests (dark mode)..."
    node .pa11y/run.js dark http://127.0.0.1:1111/sitemap.xml

# Run accessibility tests in light mode
a11y-light:
    @echo "Running accessibility tests (light mode)..."
    node .pa11y/run.js light http://127.0.0.1:1111/sitemap.xml
