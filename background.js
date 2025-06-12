// background.js

/**
 * Listens for a click on the browser action (the addon's icon in the toolbar).
 * When clicked, it toggles the sidebar open or closed.
 */
browser.action.onClicked.addListener(() => {
  browser.sidebarAction.toggle();
});