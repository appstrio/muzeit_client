function PinnedController($scope,$location,bb,$rootScope) {

    var currentState;

    bb.init(function(response){
        if(response.ready){
            init();
            return;
        }
        response.then(function(){
            init();
            return;
        });
    });

    var init = function(){
        //start
        currentState = $scope.currentState = bb.bg.currentState;
        if(currentState && currentState.playlist) $location.path('/playlist/current_playlist');
    };

    // set title - to be deprecated
    $scope.title="Music Player for Chrome";


    var updatePlayerState = function(){
        $scope.$apply(function(){

            if(currentState.tempFlags.refreshIframe){
                refreshIframe();
            }

        });
    };

    var refreshIframe = function(){
        try {
            chrome.extension.sendMessage({to: 'iframe-player', type: 'playCurrentState', currentState : currentState});
            currentState.tempFlags = null;
        }catch(e){
            console.error('Error','Unable to send "playCurrentState" message to iframe-player.',e);
        }
    };


    var playNextSong = function(){
        bb.bg.methods.playNextSong(false,true);
        refreshIframe();
        if(!$scope.$$phase)$scope.$apply();

    };



    $scope.$on('background',function(e,args){
        if (args.ping){
            updatePlayerState();
        }
    });

    $scope.selectSong = function(song,playlist,dontPushToRecent){
        if(!playlist) playlist = $scope.playlist;
        if(!playlist)playlist={songs:[]};
        bb.bg.methods.changeCurrentState({playlist : playlist, song:song,play:true},{loadNewVideo:true,refreshIframe : true},{updatePinnedPlayer : true});
        if(!dontPushToRecent)bb.bg.resources.recent.addSong($scope.currentState.song);
    };

    $scope.isSongActive = function(song){
        return (bb.bg.currentState.song === song);
    };



    // listen to message passing
    chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.to == "pinned"){
                switch(request.type){
                    case "player-ready":
                        sendResponse({});
                        refreshIframe();
                        break;
                    case "video-ended":
                        // TODO: update current state
                        $scope.$apply(function(){
                            bb.bg.methods.changeCurrentState({playerState : {playing : false}},null,{updatePopupPlayer:true});
                            playNextSong();
                        })
                        break;
                    case "video-playing":
                        // TODO: update currentState
                        $scope.$apply(function(){
                            bb.bg.methods.changeCurrentState({playerState : {playing : (request.mode == "playing"), mode : request.mode, time : request.time, length: request.length, volume : request.volume}},null,{updatePopupPlayer : true});
                        });

                        break;

                }

            }
        });

};


PinnedController.$inject = ['$scope','$location','bb','$rootScope'];
