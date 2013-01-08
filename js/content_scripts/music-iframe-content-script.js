
function injectJs(link) {
    var scr = document.createElement('script');
    scr.type="text/javascript";
    scr.src=link;
    document.getElementsByTagName('head')[0].appendChild(scr);

}

injectJs(chrome.extension.getURL('js/content_scripts/music-iframe-injected.js'));






chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.to == "iframe-player"){
            window.postMessage(request, "*");
            sendResponse({});
        }

    });


window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window) return;
    if (event.data.type && (event.data.to == "pinned")) {
        sendToPinned(event.data);
    }

}, false);

var sendToPinned = function(data){
    chrome.extension.sendMessage(event.data, function(response) {
    });
};
