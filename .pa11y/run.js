#!/usr/bin/env node

const { execSync } = require('child_process');
const https = require('http');

const theme = process.argv[2] || 'dark';
const sitemapUrl = process.argv[3] || 'http://127.0.0.1:1111/sitemap.xml';

// Fetch sitemap and extract URLs
async function fetchSitemap(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}

async function main() {
    try {
        const sitemap = await fetchSitemap(sitemapUrl);

        // Extract URLs from sitemap
        const urlRegex = /<loc>([^<]+)<\/loc>/g;
        const urls = [];
        let match;
        while ((match = urlRegex.exec(sitemap)) !== null) {
            const url = match[1];
            const separator = url.includes('?') ? '&' : '?';
            urls.push(`${url}${separator}theme=${theme}`);
        }

        // Add the 404 page (using a URL that doesn't exist)
        const baseUrl = sitemapUrl.replace(/\/sitemap\.xml$/, '');
        urls.push(`${baseUrl}/this-page-does-not-exist/?theme=${theme}`);

        if (urls.length === 0) {
            console.error('No URLs found in sitemap');
            process.exit(1);
        }

        console.log(`Testing ${urls.length} URLs in ${theme} mode...\n`);

        // Run pa11y-ci with the transformed URLs
        const configPath = `.pa11y/base.js`;
        const urlArgs = urls.join(' ');

        execSync(`npx pa11y-ci --config ${configPath} ${urlArgs}`, {
            stdio: 'inherit'
        });
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
