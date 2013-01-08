window.isPinnedPlayerOpen=false;

// listen to message passing
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.to == "backgroundPage" || request.to == "everyone" ){
            switch(request.type){
                case "auth":
                    sendResponse({close : true});
                break;
            }

        }
});

window.updatePopup = function(){
    try {
        chrome.extension.sendMessage({to: "popup", type: "ping"});
    }catch(e){
        console.error('Error','Unable to send message to popup.',e);
    }
};

window.updatePinnedPlayer = function(){
    checkPinnedPlayer();
};


window.checkPinnedPlayer = function(){
    window.isPinnedPlayerOpen=false;
    // ping pinned player
    chrome.extension.sendMessage({to: "pinned", type: "ping"}, function(response) {
        console.log('response',response);
        if(response && response.status == "alive"){
            window.isPinnedPlayerOpen=true;
        }else{
            window.isPinnedPlayerOpen=true;
            openPinnedPlayer(true);
        }
    });
    setTimeout(function(){
        window.openPinnedPlayer();
    },100);

};

window.pausePinnedPlayer = function(){
    try {
        chrome.extension.sendMessage({to: "pinned", type: "pause"});
    }catch(e){
        console.error('Error','Unable to send "pause" message to pinned.',e);
    }

};


window.playPinnedPlayer = function(){
    try {
        chrome.extension.sendMessage({to: "pinned", type: "play"});
    }catch(e){
        console.error('Error','Unable to send "play" message to pinned.',e);
    }

};

window.openPinnedPlayer = function(force){
    console.log("window.isPinnedPlayerOpen",window.isPinnedPlayerOpen);
    if(force || !window.isPinnedPlayerOpen){
        var pinnedUrl = chrome.extension.getURL('pinned.html');
        chrome.tabs.create({url : pinnedUrl, pinned : true, active: false});
        window.isPinnedPlayerOpen=true;
    }
};