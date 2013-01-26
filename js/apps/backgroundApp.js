angular.module('backgroundApp', ['ngResource','config','syncedResource','playlist','account','StorageModule','recent','youtube'], function($routeProvider, $locationProvider) {
}).run(['config','account','$window','$resource','storage','$http','recent','$q','$rootScope','youtube',function(config,account,$window,$resource,storage,$http,recent,$q,$rootScope,youtube){
    var playlists,
        currentState={},
        popupPort,
        pinnedPort,
        isReady = false,
        readyDefer,
        user,
        onTheGo,
        playlists,
        friends,
        _friends,
        lastSearch={},
        access_tokens={};


    var playlist = $resource(config.baseUrl + config.paths.playlists + "/:listController:_id/:action/:extraId");
    var friends = $resource(config.baseUrl + config.paths.friends);

    var getPlaylist = function(id,success,error){
        if (playlists){
            for (var i  in playlists){
                if (playlists[i]._id == id){
                    (success||angular.noop)(playlists[i]);
                    return playlists[i];
                }
            }

        }
        return playlist.get({_id : id},success,error);
    };

    var addNewPlaylist = function(newPlaylist,success,error){
        //newPlaylist = new playlist(newPlaylist);
        return playlist.save(tempStripPropertiesFromPlaylist(newPlaylist),function(response){
            playlists.push(response);
            storeLocal('playlists',playlists);
            (success||angular.noop)(response);
        },function(e){
            //TODO : get rid of this
            newPlaylist._id=genereateGUID();
            playlists.push(new playlist(newPlaylist));
            storeLocal('playlists',playlists,true);
            (error||angular.noop)(e);
        });
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

    var tempStripPropertiesFromPlaylist = function(tempPlaylist){
        delete tempPlaylist._id;
        delete tempPlaylist.owner;
        var songsArr=[];
        for (var i in tempPlaylist.songs){
            if (tempPlaylist.songs[i]){
                delete tempPlaylist.songs[i]._id;
                delete tempPlaylist.songs[i].views;

                songsArr.push(tempPlaylist.songs[i]);
            }
        }
        tempPlaylist.songs=songsArr;
        return tempPlaylist;
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
        changeCurrentState({song : currentState.playlist.songs[index], play:true},{loadNewVideo:true,refreshIframe:true},{updatePinnedPlayer:true,updatePopupPlayer : true});
        if(currentState.playlist.title != 'recent')recent.addSong(song);
    };

    var playPreviousSong = function(){
        if(currentState.playlist)return;
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

        recent.addSong(song);
        changeCurrentState({song : currentState.playlist.songs[index], play:true},{loadNewVideo:true,refreshIframe:true},{updatePinnedPlayer:true,updatePopupPlayer : true});

    };

    var connectFacebook = function(){
        chrome.tabs.create({url : config.baseUrl + config.paths.facebookAuth, pinned : false, active: true});
    };

    var connectGoogle = function(){
        chrome.tabs.create({url : config.baseUrl + config.paths.googleAuth, pinned : false, active: true});
    };

    var logout = function(){
        return $http({method : 'get', url : config.baseUrl + config.paths.logout}).success(function(){

          init();
      }).error(function(e){
          console.error('logout failed',e);
      });
    };

    var removeSongFromPlaylist = function(song,holderPlaylist){
        var index = $.inArray(song,holderPlaylist.songs);
        if(index == -1)return false;
        holderPlaylist.songs.splice(index,1);
        if(!song||!song._id){

        }else{
            playlist.delete({_id : holderPlaylist._id, action : 'songs', extraId : song._id},function(response){
                storeLocal('playlists',playlists);
            },function(response){
                storeLocal('playlists',playlists,true);
            });
        }

    };

    var addSongToPlaylist = function(song,destPlaylist,success,error){
        if(destPlaylist == "onthego" || destPlaylist.title == "<on-the-go>"){
            onTheGo.songs.push(song);
            storeLocal('onTheGo',onTheGo);
            if(onTheGo._id){
                playlist.save({_id : onTheGo._id, action : 'songs'},temporaryStripSongBeforeSend(song),function(response){
                    (success||angular.noop)(response);
                },function(e){
                    (error||angular.noop)(e);
                    console.error(e);
                });
            }
        }else{
            destPlaylist.songs.push(song);
            storeLocal('playlists',playlists);
            if(destPlaylist._id){
                playlist.save({_id : destPlaylist._id, action : 'songs'},temporaryStripSongBeforeSend(song),function(response){
                },function(e){
                    console.error(e);
                });
            }

        }

    };

    var temporaryStripSongBeforeSend = function(song){
        var newSong = angular.extend({},song);
        delete newSong.views;
        return newSong;
    };


    var savePlaylist = function(playlist){

    };

    var setNewVolume = function(newVolume){
        changeCurrentState({},{newVolume : newVolume,refreshIframe:true},{updatePinnedPlayer:true});
    };

    var isAlive = function(){
        return new Date().getTime();
    };

    var exports={
        resources :{
            account : account,
            playlist : playlist,
            recent : recent,
            youtube : youtube,
            access_tokens : access_tokens
        },
        methods: {
            getPlaylist : getPlaylist,
            addNewPlaylist : addNewPlaylist,
            changeCurrentState : changeCurrentState,
            togglePlay : togglePlay,
            stop : stop,
            playPreviousSong : playPreviousSong,
            playNextSong : playNextSong,
            connectFacebook : connectFacebook,
            connectGoogle : connectGoogle,
            removeSongFromPlaylist : removeSongFromPlaylist,
            addSongToPlaylist : addSongToPlaylist,
            logout : logout,
            setNewVolume : setNewVolume,
        },
        currentState : currentState,
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
        playlists : function(){
          return playlists;
        },
        friends : function(){
          return _friends;
        },

        isAlive : isAlive,

        setLastSearch : function(lastSearchObject){
           angular.extend(lastSearch,lastSearchObject);
        },

        getLastSearch : function(){
            return lastSearch;
        }


    };


    var init = function(){
        isReady=false;
        if(!readyDefer) readyDefer = $q.defer();

        account.init(function(remoteAccount){
            user = remoteAccount;
            //success
            if(user.ownedPlaylists)getAllPlaylists(user.ownedPlaylists);
            if(user.onTheGo)getOnTheGo(user.onTheGo._id);
            isReady=true;
            _friends = friends.query();
            readyDefer.resolve(remoteAccount);

        },function(err){
            //error
            console.error('Getting remote account failed;',err);
            // no user, reset on the go anyway
            isReady=true;
            readyDefer.reject(err);
        });
    };

    var resetPlaylists = function(){
        if(playlists)playlists.length=0;
        playlists = [];
    };

    var getAllPlaylists = function(ownedPlaylists){

        resetPlaylists();

        storage.get('playlists',function(object){
            if (object.playlists && !isOld(object.playlists)){
                playlists = object.playlists.data;
            }else{
                angular.forEach(ownedPlaylists,function(item,key){
                    var playlistTemp = playlist.get({_id : item._id},function(data){
                        storeLocal('playlists',playlists);
                    });

                    playlists.push(playlistTemp);

                });
            }
        });

    };

    var storeLocal = function(key,data,dirty){
      var obj ={};
      obj[key] = {};
      obj[key].timestamp = new Date().getTime();
      if(dirty) obj[key].dirty=true;
      else  obj[key].dirty=false;
      obj[key].data = data;
      storage.set(obj);
    };

    var isOld = function(obj,oldTimeout){
        if(!oldTimeout)oldTimeout=config.oldTimeout;
        return (!obj || !obj.timestamp || new Date().getTime() - obj.timestamp > oldTimeout);
    };

    var getOnTheGo = function(_id){
        storage.get('onTheGo',function(object){
            if(!_id || object.onTheGo && !isOld(object.onTheGo) && object.onTheGo._id == _id){

                onTheGo=object.onTheGo.data;
            }else{

                if(_id){
                     playlist.get({_id: _id},function(response){
                         onTheGo = response;
                         if(object.onTheGo && object.onTheGo.dirty){
                             angular.extend(onTheGo,object.onTheGo.data);
                             playlist.put({id : onTheGo._id, action:'songs'},onTheGo.songs,function(response){
                             },function(err){
                                 handleHttpErrors(err);
                                 console.error('Error updating on the go songs list',err);
                                 storeLocal('onTheGo',onTheGo,true);
                             });
                         }
                        storeLocal('onTheGo',onTheGo);
                     },function(err){
                        console.error('Error getting onTheGo',err);
                         handleHttpErrors(err);
                        //error
                        onTheGo=new playlist({songs : [],title: "<on-the-go>", owner: "me"});
                     });
                }else{
                    onTheGo=new playlist({songs : [],title: "<on-the-go>", owner: "me"});
                }
            }
        });
    };

    var importYoutubePlaylists = function(accessToken){
        youtube.getYoutubePlaylistFeed(accessToken);
    };
    var handleHttpErrors = function(err){
        switch (err.status){
            case 401:
                account.clear();
                break;
        }
    }
    $rootScope.$on('httpError',handleHttpErrors);

    init();

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
                            access_tokens.youtube = request.accessTokenObject.accessToken;
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

}]);
