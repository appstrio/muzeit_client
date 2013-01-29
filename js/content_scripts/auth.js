// if succeeded send message to background page to open the pop up page
chrome.extension.sendMessage({to: "everyone", type : "auth", message : "success"}, function(response) {
    // close this window after getting response back from the background page
    //if (response.close) window.close();
});

document.location.href=chrome.extension.getURL('success.html');


setTimeout(function(){
    window.close();
},1000*10);