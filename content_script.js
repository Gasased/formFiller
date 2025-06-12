console.log("Google Form Copier: Content script v7 loaded!");

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
 * Finds the questions on the page and fills them based on the provided answer data.
 * @param {object} answers - The answer data, e.g., { "1": [2], "2": [1, 3] }
 */
function fillFormWithData(answers) {
    const questionElements = document.querySelectorAll('.geS5n');
    let filledCount = 0;

    for (const questionId in answers) {
        const questionIndex = parseInt(questionId, 10) - 1;
        const answerIndices = answers[questionId]; // Should be an array, e.g., [1] or [2, 4]

        if (questionIndex >= 0 && questionIndex < questionElements.length) {
            const qElement = questionElements[questionIndex];
            
            // Find all clickable options (radio buttons or checkboxes) for this question
            const clickableOptions = qElement.querySelectorAll('div[role="radio"], div[role="checkbox"]');

            if (Array.isArray(answerIndices)) {
                answerIndices.forEach(answerIndex => {
                    const optionToClickIndex = answerIndex - 1;
                    if (optionToClickIndex >= 0 && optionToClickIndex < clickableOptions.length) {
                        clickableOptions[optionToClickIndex].click();
                        filledCount++;
                    }
                });
            }
        }
    }
    return `Successfully filled ${filledCount} options.`;
}


// --- Message Listener ---
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Handle "grab_form" action
    if (request.action === "grab_form") {
        console.log("Received 'grab_form' request from popup.");
        try {
            const data = grabFormData();
            sendResponse({ data: data });
        } catch (error) {
            console.error("Error during form grabbing:", error);
            sendResponse({ error: error.message });
        }
        return true;
    }

    // Handle new "fill_form" action
    if (request.action === "fill_form") {
        console.log("Received 'fill_form' request with data:", request.data);
        try {
            const status = fillFormWithData(request.data);
            sendResponse({ status: status });
        } catch (error) {
            console.error("Error during form filling:", error);
            sendResponse({ status: `Error: ${error.message}` });
        }
        return true;
    }
});