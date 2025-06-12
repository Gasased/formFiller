console.log("Google Form Copier: Content script v6 loaded!");

/**
 * This is the main function that scrapes the form data.
 * It adds a sequential ID to each question object.
 */
function grabFormData() {
    const questionElements = document.querySelectorAll('.geS5n'); 
    
    if (questionElements.length === 0) {
        throw new Error("No questions found. The page structure may have changed. Please report this issue.");
    }

    const questions = [];
    console.log(`Found ${questionElements.length} question blocks.`);

    // Add 'index' to the forEach to get the current position in the loop
    questionElements.forEach((qElement, index) => {
        // --- 1. Gather all the necessary data first ---
        
        const titleElement = qElement.querySelector('div[role="heading"]');
        if (!titleElement) return;
        
        let questionText = titleElement.textContent.trim();
        let isMandatoryValue = false;

        if (questionText.endsWith('*')) {
            isMandatoryValue = true;
            questionText = questionText.slice(0, -1).trim();
        }
        
        const hasMultipleAnswersValue = qElement.querySelector('div[role="checkbox"]') !== null;
        
        const optionsArray = [];
        const optionLabels = qElement.querySelectorAll('.aDTYNe');
        optionLabels.forEach(label => {
            if (label.textContent.trim()) {
                optionsArray.push(label.textContent.trim());
            }
        });

        // --- 2. Build the final object in the desired order, including the new ID ---

        const questionData = {
            "id": index + 1, // The new 'id' field. We use index + 1 to start counting from 1.
            "question": questionText,
            "hasMultipleAnswers": hasMultipleAnswersValue,
            "options": optionsArray,
        };

        // --- The "isMandatory" field remains commented out ---
        // questionData.isMandatory = isMandatoryValue;

        questions.push(questionData);
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
            console.log("Successfully grabbed data with IDs:", data);
            sendResponse({ data: data });
        } catch (error) {
            console.error("Error during form grabbing:", error);
            sendResponse({ error: error.message });
        }
    }
    // Return true to indicate you wish to send a response asynchronously
    return true;
});