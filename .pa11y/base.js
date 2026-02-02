module.exports = {
    defaults: {
        timeout: 30000,
        wait: 1000,
        standard: 'WCAG2AA',
        chromeLaunchConfig: {
            args: ['--no-sandbox']
        }
    },
    concurrency: 5,
    urls: []
};
