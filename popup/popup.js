// --- DOM Elements ---
const appendedTextInput = document.getElementById('appendedText');
const jsonOutput = document.getElementById('jsonOutput');
const grabButton = document.getElementById('grabButton');
const copyButton = document.getElementById('copyButton');
const statusMessage = document.getElementById('statusMessage');

// New elements for Fill tab
const fillButton = document.getElementById('fillButton');
const answersJsonInput = document.getElementById('answersJson');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

let formJSON = null; 

// --- Functions ---

function showStatus(message, duration = 3000, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.color = isError ? 'red' : 'green';
    setTimeout(() => {
        statusMessage.textContent = '';
    }, duration);
}

async function loadSavedText() {
    const data = await browser.storage.local.get('appendedText');
    if (data.appendedText) {
        appendedTextInput.value = data.appendedText;
    }
}

function saveText() {
    browser.storage.local.set({ appendedText: appendedTextInput.value });
}

// --- Event Listeners ---

// Auto-save
appendedTextInput.addEventListener('input', saveText);
document.addEventListener('DOMContentLoaded', loadSavedText);

// Tab switching logic
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        tabContents.forEach(content => content.classList.add('hidden'));
        document.getElementById(button.dataset.tab).classList.remove('hidden');
    });
});


// "Grab Form" button
grabButton.addEventListener('click', async () => {
    grabButton.disabled = true;
    grabButton.textContent = "Grabbing...";
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    try {
        const response = await browser.tabs.sendMessage(tab.id, { action: "grab_form" });
        if (response && response.data) {
            formJSON = response.data;
            if (formJSON.questions && formJSON.questions.length > 0) {
                jsonOutput.textContent = JSON.stringify(formJSON, null, 2);
                showStatus("Form content grabbed!");
            } else {
                jsonOutput.textContent = "Could not find any questions on the page. Ensure you are on a valid Google Form.";
            }
        } else if (response && response.error) {
            jsonOutput.textContent = `Error: ${response.error}`;
        }
    } catch (error) {
        jsonOutput.textContent = "Error: Could not communicate with the page. Please refresh the Google Form tab and try again.";
        console.error("Error sending message to content script:", error);
    } finally {
        grabButton.disabled = false;
        grabButton.textContent = "Grab Form";
    }
});

// "Copy" button
copyButton.addEventListener('click', () => {
    const appendedText = appendedTextInput.value;
    const jsonString = formJSON ? JSON.stringify(formJSON, null, 2) : "No form data grabbed.";
    const combinedText = `${appendedText}\n\n--- Form JSON ---\n\n${jsonString}`;
    navigator.clipboard.writeText(combinedText).then(() => {
        showStatus("Copied to clipboard!");
    }).catch(err => {
        showStatus("Failed to copy!", true);
        console.error('Failed to copy text: ', err);
    });
});

// "Fill Form" button
fillButton.addEventListener('click', async () => {
    const answersText = answersJsonInput.value;
    if (!answersText.trim()) {
        showStatus("Answer JSON is empty.", 3000, true);
        return;
    }

    let answersData;
    try {
        answersData = JSON.parse(answersText);
    } catch (error) {
        showStatus("Invalid JSON format. Please check your input.", 3000, true);
        return;
    }

    fillButton.disabled = true;
    fillButton.textContent = "Filling...";

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    try {
        const response = await browser.tabs.sendMessage(tab.id, {
            action: "fill_form",
            data: answersData
        });
        showStatus(response.status);
    } catch (error) {
        showStatus("Failed to communicate with the page.", 3000, true);
        console.error("Error sending fill_form message:", error);
    } finally {
        fillButton.disabled = false;
        fillButton.textContent = "Fill Form";
    }
});