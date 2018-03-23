// Filed used only if we want the script in background, on icon click or context menu click

function start(info, tab) {
    chrome.tabs.executeScript(null, { file: "jquery-2.min.js" }, function() {
        chrome.tabs.executeScript(null, { file: "data_to_csv.js" }, function() { 
            chrome.tabs.executeScript(null, { code: "startCSVDownload()" });
        });
    });
}

chrome.pageAction.onClicked.addListener(function(tab) {
    start(null, tab);
})

chrome.runtime.onInstalled.addListener(function() {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL contains a 'g' ...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'client.bforbank.com/espace-client' },
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});