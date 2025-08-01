function navigateToUrl(targetUrl, currentTab, isInNewTab) {
    if (isInNewTab) {
        chrome.tabs.create({ url: targetUrl });
    } else {
        chrome.tabs.update(currentTab.id, { url: targetUrl });
    }
}

function convertHostname(hostname, fromDomain, toDomain) {
    return hostname.replace(fromDomain, toDomain);
}

function toggle() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const currentTab = tabs[0];
            const currentUrl = currentTab.url;

            chrome.storage.sync.get(['isInNewTab', 'customUrl'], (data) => {
                if (chrome.runtime.lastError) {
                    console.error(
                        'Error loading settings:',
                        chrome.runtime.lastError
                    );
                    return;
                }

                const isInNewTab = data.isInNewTab || false;
                const customUrl = data.customUrl || '';

                console.log('Current URL:', currentUrl);

                try {
                    const url = new URL(currentUrl);
                    let hostname = url.hostname.toLowerCase();

                    const domainMappings = [
                        { from: 'arxiv.org', to: 'alphaxiv.org' },
                        { from: 'alphaxiv.org', to: 'arxiv.org' },
                    ];

                    const mapping = domainMappings.find((m) =>
                        hostname.endsWith(m.from)
                    );

                    if (mapping) {
                        const newHostname = convertHostname(
                            hostname,
                            mapping.from,
                            mapping.to
                        );
                        url.hostname = newHostname;
                        const newUrl = url.toString();
                        navigateToUrl(newUrl, currentTab, isInNewTab);
                        console.log(`Switched to ${mapping.to}`);
                    } else {
                        console.log('Not a matching URL');
                        if (customUrl !== '') {
                            chrome.tabs.create({ url: customUrl });
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            });
        }
    });
}

chrome.action.onClicked.addListener((tab) => {
    toggle();
});
