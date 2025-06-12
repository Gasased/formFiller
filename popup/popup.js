document.addEventListener("DOMContentLoaded", () => {
  const copyButton = document.getElementById("copyButton");

  copyButton.addEventListener("click", async () => {
    console.log("Copy button clicked.");
    // We will add the logic to communicate with the content script here.
    copyButton.textContent = "Copied!";
    setTimeout(() => { copyButton.textContent = "Copy Form Content"; }, 2000);
  });
});
