angular.module('backgroundApp', ['ngResource','config','syncedResource','playlist','account','StorageModule','recent','youtube','discover','ga','playlists'], function() {
}).run(['config','account','$window','$resource','storage','$http','recent','$q','$rootScope','youtube','discover','ga','playlist','playlists',function(config,account,$window,$resource,storage,$http,recent,$q,$rootScope,youtube,discover,ga,playlist,playlists){

    var currentState        = {},
        isReady             = false,
        lastSearch          = {},
        access_tokens       = {},
        popupPort,
        pinnedPort,
        readyDefer,
        user,
        onTheGo,
        _friends;


    //var playlist = $resource(config.baseUrl + config.paths.playlists + "/:listController:_id/:action/:extraId");
    var friends = $resource(config.baseUrl + config.paths.friends);

    var init = function(){
        isReady=false;
        if(!readyDefer) readyDefer = $q.defer();

        account.init(function(remoteAccount){
            user = remoteAccount;
            //success
            playlists.getAllPlaylists(user.ownedPlaylists,user.subscribedPlaylists);

            if(user.onTheGo)playlists.getOnTheGo(user.onTheGo._id);
            isReady=true;
            _friends = friends.query();
            readyDefer.resolve(remoteAccount);
            discover.firstTime();
        },function(err){
            console.error('Getting remote account failed;',err);
            //error
            if(1  < 2){ //401
               account.clear();
               playlists.clear();

            }
            // no user, reset on the go anyway
            isReady=true;
            readyDefer.reject(err);

        });
    };


    var checkFirstRun = function(){
        var v = config.getBuildVersion();
        if(!localStorage.getItem('installTime')){
            ga.trackEvent('new_install',v);
            localStorage.setItem('installTime',new Date().getTime());
            localStorage.setItem('install_version',v);

        }else if (localStorage.getItem('install_version') != v){
            localStorage.setItem('installTime',new Date().getTime());
            localStorage.setItem('install_version',v);
            ga.trackEvent('install_update',v);
        }
    };

    var changeCurrentState = function(params,tempFlags,actions){
        $.extend(currentState,params);
        currentState.tempFlags = null;
        currentState.tempFlags = tempFlags;
        if(actions&&actions.updatePinnedPlayer) updatePinnedPlayer();
        if(actions&&actions.updatePopupPlayer) updatePopupPlayer();
    };

    var updatePinnedPlayer = function(){
       if(pinnedPort){
           pinnedPort.postMessage({ping : true});
       }else{
           openPinnedPlayer();
       }
    };

    var openPinnedPlayer = function(){
        var pinnedUrl = chrome.extension.getURL('pinned.html');
        chrome.tabs.create({url : pinnedUrl, pinned : true, active: false});
    };

    var updatePopupPlayer = function(){
       if(popupPort){
           popupPort.postMessage({ping : true});
       }
    };

    var togglePlay = function(){
        if(currentState.play){
            //pause
            changeCurrentState({play:false},{refreshIframe:true},{updatePinnedPlayer:true});
        }else{
            // play
            changeCurrentState({play:true},{refreshIframe:true},{updatePinnedPlayer:true});
        }
    };

    var stop = function(){
        changeCurrentState({song:null,play:false},{refreshIframe:true},{updatePinnedPlayer:true});
    };


    var playNextSong = function(forceRepeat,allowShuffle){
        if(!currentState.playlist){
            stop();
            return;
        }
        var index = $.inArray(currentState.song,currentState.playlist.songs);
        if (index == -1){
            // not found
            return false;
        }
        if (index >= currentState.playlist.songs.length-1){
            // if repeat
            if (currentState.repeat || forceRepeat)
                index = 0;
            else{
                changeCurrentState({play:false},{refreshIframe:true},{updatePinnedPlayer:true,updatePopupPlayer : true});
                return false;
            }
        }else{
            if(allowShuffle && currentState.shuffle){
                index = Math.floor((Math.random()*currentState.playlist.songs.length-1));
            }else{
                index++;
            }
        }
        var song = currentState.playlist.songs[index];
        changeCurrentState({song : song, play:true},{loadNewVideo:true,refreshIframe:true},{updatePinnedPlayer:true,updatePopupPlayer : true});
        if(currentState.playlist.title != 'recent')recent.addSong(song);
    };

    var playPreviousSong = function(){
        console.log('playPreviousSong',currentState.playlist);
        if(!currentState.playlist || !currentState.playlist.songs)return;
        var index = $.inArray(currentState.song,currentState.playlist.songs);
        if (index == -1){
            // not found
            return false;
        }

        if (index <= 0){
            index = currentState.playlist.songs.length-1;
        }else{
            index--;
        }

        var song = currentState.playlist.songs[index];
        changeCurrentState({song : song, play:true},{loadNewVideo:true,refreshIframe:true},{updatePinnedPlayer:true,updatePopupPlayer : true});
        if(currentState.playlist.title != 'recent')recent.addSong(song);

    };

    var connectFacebook = function(){
        chrome.tabs.create({url : config.baseUrl + config.paths.facebookAuth, pinned : false, active: true});
    };

    var connectGoogle = function(){
        chrome.tabs.create({url : config.baseUrl + config.paths.googleAuth, pinned : false, active: true});
    };

    var logout = function(){
        return account.logout().then(function(){
            access_tokens=null;
            access_tokens={};

            user=null;
            init();
            if(!$rootScope.$$phase)$rootScope.$apply();
        });
    };

    var setNewVolume = function(newVolume){
        changeCurrentState({},{newVolume : newVolume,refreshIframe:true},{updatePinnedPlayer:true});
    };

    var isAlive = function(){
        return new Date().getTime();
    };

    var setGoogleAccessToken = function(accessToken){
        access_tokens.youtube = accessToken;
    };

    var isConnected = function(){
        var _account = account.account();
      return (_account && _account._id);
    };

    var handleHttpErrors = function(err){
        switch (err.status){
            case 401:
                account.clear();
                break;
        }
    }


    var exports={
        resources :{
            account                  : account,
            playlist                 : playlist,
            recent                   : recent,
            youtube                  : youtube,
            ga                       : ga,
            playlists                : playlists,
            access_tokens            : access_tokens
        },
        methods: {
            changeCurrentState       : changeCurrentState,
            togglePlay               : togglePlay,
            stop                     : stop,
            playPreviousSong         : playPreviousSong,
            playNextSong             : playNextSong,
            connectFacebook          : connectFacebook,
            connectGoogle            : connectGoogle,
            logout                   : logout,
            setNewVolume             : setNewVolume,
            setGoogleAccessToken     : setGoogleAccessToken,
            isConnected              : isConnected
        },
        currentState                 : currentState,
        isAlive                      : isAlive,

        isReady : function(){
            return isReady;
        },
        readyDefer : function(){
            return readyDefer;
        },
        user : function (){
            return user;
        },
        onTheGo : function(){
            return onTheGo;
        },
        friends : function(){
          return _friends;
        },

        setLastSearch : function(lastSearchObject){
           angular.extend(lastSearch,lastSearchObject);
        },

        getLastSearch : function(){
            return lastSearch;
        }


    };

    $rootScope.$on('httpError',handleHttpErrors);


    chrome.extension.onConnect.addListener(function(port) {
      if(port.name == "popup"){
          popupPort = port;
          popupPort.onDisconnect.addListener(function(){
              popupPort=null;
          });
      }

      if(port.name == "pinned"){
          pinnedPort = port;
          pinnedPort.onDisconnect.addListener(function(){
              pinnedPort=null;
          });

          pinnedPort.onMessage.addListener(function(msg) {
              if (msg.request == "isAlive")
                  pinnedPort.postMessage({alive: true});
          });

      }
    });

    // listen to message passing
    chrome.extension.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.to == "backgroundPage" || request.to == "everyone" ){
                switch(request.type){
                    case "auth":
                        init();
                        if(request.provider == 'youtube'){
                            setGoogleAccessToken(request.accessTokenObject.accessToken);
                            changeCurrentState({path : 'youtube'});
                            //importYoutubePlaylists(request.accessTokenObject.accessToken);

                        }
                        sendResponse({close : true});
                        break;
                }

            }
     });

    exports.debug = {
        init: init
    };

    $window.export = exports;

    init();
    checkFirstRun();

}]);
