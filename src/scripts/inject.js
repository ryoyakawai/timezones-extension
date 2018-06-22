(() => {
    let injectFiles = [
        { type: 'moule', path: 'scripts/chromeutils.js' },
        { type: 'moule', path: 'scripts/timezonedef.js' },
        { type: 'module', path: 'scripts/timezoneclock.js' }
    ];

    for(let i in injectFiles) {
        const src = chrome.extension.getURL(injectFiles[i].path);
        const script = document.createElement('script');
        script.setAttribute('src', src);
        script.setAttribute('type', injectFiles[i].type);
        document.body.appendChild(script);
    }
})();
