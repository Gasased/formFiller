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
