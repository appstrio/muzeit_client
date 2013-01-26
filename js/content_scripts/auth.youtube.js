// if succeeded send message to background page to open the pop up page
var bodyText = (document.getElementsByTagName('body')[0].innerText);
bodyText = "{" + bodyText.split('{')[1];
console.log("<",bodyText,">");
var accessToken = JSON.parse(bodyText);
console.log('accessToken',accessToken);
chrome.extension.sendMessage({to: "everyone", type : "auth", message : "success", provider : "youtube", accessTokenObject : accessToken}, function(response) {
    // close this window after getting response back from the background page
    if (response.close) window.close();
});

document.getElementsByTagName('body')[0].innerHTML = "Connected, please re-open music player !";
