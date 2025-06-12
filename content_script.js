console.log("Google Form Copier: Content script v4 loaded!");

/**
 * This is the main function that scrapes the form data.
 * It uses the specific class names identified from the user-provided HTML.
 */
function grabFormData() {
    // This class '.geS5n' correctly identifies the entire question block.
    const questionElements = document.querySelectorAll('.geS5n'); 
    
    if (questionElements.length === 0) {
        throw new Error("No questions found. The page structure may have changed. Please report this issue.");
    }

    const questions = [];
    console.log(`Found ${questionElements.length} question blocks.`);

    questionElements.forEach((qElement) => {
        const questionData = {
            options: [],
        };

        // --- Get the Question Title ---
        // This is correct: the title is in a div with role="heading".
        const titleElement = qElement.querySelector('div[role="heading"]');
        if (!titleElement) return; // Skip non-question elements.
        
        let questionText = titleElement.textContent.trim();
        
        // --- Check if Mandatory ---
        // This method remains reliable.
        if (questionText.endsWith('*')) {
            questionData.isMandatory = true;
            questionText = questionText.slice(0, -1).trim(); // Clean the asterisk
        } else {
            questionData.isMandatory = false;
        }
        questionData.question = questionText;

        // --- Determine if Multiple Answers are Allowed (Checkboxes) ---
        // This check is stable as it uses the accessibility role.
        const isCheckboxType = qElement.querySelector('div[role="checkbox"]') !== null;
        questionData.hasMultipleAnswers = isCheckboxType;

        // --- Find Option Labels (THE FIX IS HERE) ---
        // From your HTML, the correct selector for the visible option text is this span class.
        // It correctly grabs "Варіант 1", "Варіант 2", etc.
        const optionLabels = qElement.querySelectorAll('.aDTYNe');
        
        optionLabels.forEach(label => {
            // Check to ensure we aren't accidentally grabbing other text.
            if (label.textContent.trim()) {
                questionData.options.push(label.textContent.trim());
            }
        });

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