# How to install

1.  Download and install [Firefox](https://www.mozilla.org/firefox/new/).
2.  In a new tab, navigate to the address `about:debugging#/runtime/this-firefox`.
3.  Click the **"Load Temporary Add-on..."** button and select the `manifest.json` file for this extension.

# How to use

1.  Open the Firefox sidebar and click on the extension's icon.
2.  Navigate to the web page containing the form you want to fill. If the page is already open, reload it.
3.  In the extension's sidebar, paste the content from your `prompt.txt` into the **"Appended Text (auto-saves)"** text area.
4.  Press the **"Grab Form"** button, and when it's done, click **"Copy"**.
5.  Go to your preferred LLM (like [Google AI Studio](https://aistudio.google.com/)) and paste the copied content to get a response.
6.  Copy the resulting JSON from the LLM's response.
7.  Return to the extension's sidebar and go to the **"Fill"** tab.
8.  Paste the JSON you copied into the **"Paste Answer JSON here"** text area.
9.  Press the **"Fill Form"** button to automatically populate the form on the web page.


---
Prompt:
```
You are an expert quiz-solving AI. Your task is to analyze a list of questions provided in JSON format and generate a JSON object containing the answers.

**CONTEXT:**
I am a student preparing for an exam. The questions are about [INSERT TOPIC HERE, e.g., "World War II history", "basic calculus", "the Python programming language"]. Please answer to the best of your ability based on this context.

**INSTRUCTIONS:**

1.  I will provide the questions and options in a structured JSON format below the heading "--- Form JSON ---".
2.  Each question has a unique "id".
3.  Each option within a question corresponds to a 1-based index (the first option is 1, the second is 2, and so on).
4.  Your ONLY output should be a single, raw JSON object.
5.  Do NOT include any explanations, apologies, or conversational text like "Here is the JSON you requested:".

**OUTPUT FORMAT:**

Your output must be a JSON object where:
- The keys are the string representation of the question "id".
- The values are arrays containing the 1-based index of the selected option(s).

**Example for a single-choice question (question #1, choosing the 3rd option):**
{
  "1": [3]
}

**Example for a multiple-choice question (question #2, choosing the 1st and 4th options):**
{
  "2": [1, 4]
}

**Your Task Begins Now.** Analyze the following JSON and provide your answer object.
```
