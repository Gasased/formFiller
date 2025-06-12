console.log("Google Form Copier: Content script v2 loaded!");

/**
 * This is the main function that scrapes the form data.
 * It uses ARIA roles and stable attributes instead of volatile class names.
 */
function grabFormData() {
    // Each question is contained within a div with role="listitem"
    const questionElements = document.querySelectorAll('div[role="listitem"]');
    
    if (questionElements.length === 0) {
        throw new Error("No questions found. This might not be a standard Google Form page.");
    }

    const questions = [];
    console.log(`Found ${questionElements.length} potential question blocks.`);

    questionElements.forEach((qElement, index) => {
        const questionData = {};

        // --- Get the Question Title ---
        // The title is in a div with role="heading"
        const titleElement = qElement.querySelector('div[role="heading"]');
        if (!titleElement) return; // Skip elements that aren't actual questions (like description blocks)
        
        questionData.question = titleElement.textContent.trim();

        // --- Check if Mandatory ---
        // The red asterisk has a specific aria-label
        const mandatoryIndicator = titleElement.querySelector('span[aria-label="Required question"]');
        questionData.isMandatory = !!mandatoryIndicator;

        // --- Determine Question Type and Extract Options ---
        questionData.options = [];

        // Check for Checkboxes (multiple answers)
        const isCheckboxType = qElement.querySelector('div[role="checkbox"]') !== null;
        questionData.hasMultipleAnswers = isCheckboxType;

        // The options for radio, checkbox, and dropdowns are typically text spans with this class.
        // We find all of them within the current question element.
        const optionElements = qElement.querySelectorAll('.M6JNee.itzbvb'); 
        
        optionElements.forEach(opt => {
            const textSpan = opt.querySelector('.aDT5md');
            if (textSpan) {
                questionData.options.push(textSpan.textContent.trim());
            }
        });

        // If we successfully found a question title, add it to our list.
        if (questionData.question) {
            questions.push(questionData);
        }
    });

    return { questions };
}

/**
 * Listens for messages from the popup script.
 */
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "grab_form") {
        console.log("Received 'grab_form' request from popup.");
        try {
            const data = grabFormData();
            console.log("Successfully grabbed data:", data);
            sendResponse({ data: data });
        } catch (error) {
            console.error("Error during form grabbing:", error);
            sendResponse({ error: error.message });
        }
    }
    // Return true to indicate you wish to send a response asynchronously
    return true;
});