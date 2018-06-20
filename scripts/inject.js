(() => {
    let injectFiles = [
        'scripts/timezonedef.js',
        'scripts/timezoneclock.js'
    ];

    for(let i in injectFiles) {
        const src = chrome.extension.getURL(injectFiles[i]);
        const script = document.createElement('script');
        script.setAttribute('src', src);
        script.setAttribute('type', 'module');
        document.body.appendChild(script);
    }
})();
