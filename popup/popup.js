// --- DOM Elements ---
const appendedTextInput = document.getElementById('appendedText');
const jsonOutput = document.getElementById('jsonOutput');
const grabButton = document.getElementById('grabButton');
const copyButton = document.getElementById('copyButton');
const statusMessage = document.getElementById('statusMessage');

let formJSON = null; // To store the grabbed JSON data

// --- Functions ---

/**
 * Shows a temporary status message to the user.
 */
function showStatus(message, duration = 2000) {
    statusMessage.textContent = message;
    setTimeout(() => {
        statusMessage.textContent = '';
    }, duration);
}

/**
 * Loads the saved text from storage and populates the textarea.
 */
async function loadSavedText() {
    const data = await browser.storage.local.get('appendedText');
    if (data.appendedText) {
        appendedTextInput.value = data.appendedText;
    }
}

/**
 * Saves the text from the textarea to storage.
 */
function saveText() {
    browser.storage.local.set({
        appendedText: appendedTextInput.value
    });
}

// --- Event Listeners ---

// Auto-save the appended text on input
appendedTextInput.addEventListener('input', saveText);

// Load the saved text when the popup is opened
document.addEventListener('DOMContentLoaded', loadSavedText);

// "Grab Form" button functionality
grabButton.addEventListener('click', async () => {
    grabButton.disabled = true;
    grabButton.textContent = "Grabbing...";
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    try {
        const response = await browser.tabs.sendMessage(tab.id, { action: "grab_form" });
        if (response && response.data) {
            formJSON = response.data;
            // Check if any questions were actually parsed
            if (formJSON.questions && formJSON.questions.length > 0) {
                jsonOutput.textContent = JSON.stringify(formJSON, null, 2);
                showStatus("Form content grabbed!");
            } else {
                jsonOutput.textContent = "Could not find any questions on the page. Ensure you are on a valid Google Form.";
            }
        } else if (response && response.error) {
            // Display the specific error from the content script
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

// "Copy" button functionality
copyButton.addEventListener('click', () => {
    const appendedText = appendedTextInput.value;
    const jsonString = formJSON ? JSON.stringify(formJSON, null, 2) : "No form data grabbed.";

    const combinedText = `${appendedText}\n\n--- Form JSON ---\n\n${jsonString}`;

    navigator.clipboard.writeText(combinedText).then(() => {
        showStatus("Copied to clipboard!");
    }).catch(err => {
        showStatus("Failed to copy!");
        console.error('Failed to copy text: ', err);
    });
});

// Listen for messages from the content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "form_data") {
        formJSON = message.data;
        jsonOutput.textContent = JSON.stringify(formJSON, null, 2);
        sendResponse({ status: "success" });
    }
    return true; // Keep the message channel open for async response
});