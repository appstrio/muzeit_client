// if succeeded send message to background page to open the pop up page
var bodyText = (document.getElementsByTagName('body')[0].innerText);
bodyText = "{" + bodyText.split('{')[1];
var accessToken = JSON.parse(bodyText);
chrome.extension.sendMessage({to: "everyone", type : "auth", message : "success", provider : "youtube", accessTokenObject : accessToken}, function(response) {
    // close this window after getting response back from the background page
    //if (response.close) window.close();
});

document.location.href=chrome.extension.getURL('success.html');

setTimeout(function(){
    window.close();
},1000*10);