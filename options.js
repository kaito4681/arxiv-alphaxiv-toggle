document.addEventListener('DOMContentLoaded', async () => {
    let originalText = '';
    let isSaved = false;

    chrome.storage.sync.get(['isInNewTab', 'customUrl'], (data) => {
        if (chrome.runtime.lastError) {
            console.error('Error loading settings:', chrome.runtime.lastError);
            return;
        }

        const newTabCheckbox = document.getElementById('newTabCheckbox');
        const customUrlInput = document.getElementById('customUrl');

        if (newTabCheckbox) {
            newTabCheckbox.checked = data.isInNewTab || false;
        }
        if (customUrlInput) {
            customUrlInput.value = data.customUrl || '';
        }
    });

    function resetSavedState() {
        if (isSaved) {
            const saveButton = document.getElementById('saveButton');
            if (saveButton) {
                saveButton.textContent = originalText;
                saveButton.style.background = '';
                isSaved = false;
            }
        }
    }

    const newTabCheckbox = document.getElementById('newTabCheckbox');
    const customUrlInput = document.getElementById('customUrl');

    if (newTabCheckbox) {
        newTabCheckbox.addEventListener('change', resetSavedState);
    }
    if (customUrlInput) {
        customUrlInput.addEventListener('input', resetSavedState);
    }

    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        originalText = saveButton.textContent;

        saveButton.addEventListener('click', () => {
            const newTabCheckbox = document.getElementById('newTabCheckbox');
            const customUrlInput = document.getElementById('customUrl');

            if (!newTabCheckbox || !customUrlInput) {
                console.error('Required elements not found');
                return;
            }

            const isInNewTab = newTabCheckbox.checked;
            const customUrl = customUrlInput.value;

            chrome.storage.sync.set({ isInNewTab, customUrl }, () => {
                if (chrome.runtime.lastError) {
                    console.error(
                        'Error saving settings:',
                        chrome.runtime.lastError
                    );
                    return;
                }

                saveButton.textContent = '✓ Saved!';
                saveButton.style.background = '#28a745';
                isSaved = true;
            });
        });
    }
});
