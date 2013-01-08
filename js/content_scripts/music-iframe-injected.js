var player={};
var myPlayer= myPlayer || {};
var firstVideo = null;
var done = false;
var currentState;
var playingInterval;

var loadYoutubePlayer = function (){
    // 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
};

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        events: {
            'onReady': myPlayer.onPlayerReady,
            'onStateChange': myPlayer.onPlayerStateChange,
            'onError' : myPlayer.onPlayerError
        }
    });

    initialized=true;
}


myPlayer.onPlayerReady = function (event) {
    document.getElementById('loading').style.display='none';
    window.postMessage({ from:'iframe-player', to: 'pinned', type: "player-ready" }, "*");
}

myPlayer.onPlayerStateChange = function (event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        if(firstVideo){
            player.loadVideoById(firstVideo);
            firstVideo=null;
        }
        done = true;
        playingInterval=setInterval(sendPlayingStateToPinned,1000);
    } else if (event.data == YT.PlayerState.PLAYING){
        playingInterval=setInterval(sendPlayingStateToPinned,1000);
    } else if (event.data == YT.PlayerState.ENDED){
        clearInterval(playingInterval);
        window.postMessage({ from:'iframe-player', to: 'pinned', type: "video-ended" }, "*");
    } else if (event.data == YT.PlayerState.PAUSED){
        clearInterval(playingInterval);
        sendPausedStateToPinned();
    }
}

myPlayer.onPlayerError = function (event){
    console.error(event);
    if (event.data == 2){
        // The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.
        console.error('Error 2 :The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.');
    }else if(event.data == 5){
        //The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.
        console.error('Error 5 : The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.');
    }else if(event.data == 100){
        console.error(' Error 100 : The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.');
    }else if (event.data == 101){
        console.error('Error 101 : The owner of the requested video does not allow it to be played in embedded players');
    }else if (event.data == 150){
        console.error('Error 105 : This error is the same as 101. Its just a 101 error in disguise, 101 : The owner of the requested video does not allow it to be played in embedded players');
    }
}

var loadVideo = function(youtubeId){
    if(!player && !done){
        firstVideo=youtubeId;
    }else{
        player.loadVideoById(youtubeId);
    }

};

var sendPlayingStateToPinned = function(){
    window.postMessage({ from:'iframe-player', to: 'pinned', type: "video-playing", mode: "playing", time : player.getCurrentTime() , length : player.getDuration(), volume :  player.getVolume()}, "*");
};

var sendPausedStateToPinned = function(){
    window.postMessage({ from:'iframe-player', to: 'pinned', type: "video-playing", mode: "paused", time : player.getCurrentTime() , length : player.getDuration(), volume :  player.getVolume()}, "*");
};


window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    if (event.data && (event.data.type == "playCurrentState")) {
        currentState = event.data.currentState;
        if(currentState.play){
            player.playVideo();
        }else{
            player.pauseVideo();
        }

        if(currentState.tempFlags.loadNewVideo) loadVideo(currentState.song.youtubeId);
        if(currentState.tempFlags.newVolume) player.setVolume(currentState.tempFlags.newVolume);

    }else if (event.data && (event.data.type == "play")){
             player.playVideo();
        }else if (event.data && (event.data.type == "pause")){
            player.pauseVideo();
        }

}, false);



loadYoutubePlayer();
