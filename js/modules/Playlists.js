var playlists = angular.module('playlists', []);

playlists.service('playlists', ['$http','config','account','storage','$q','playlist',function($http,config,account,storage,$q,playlist) {

    var ownedPlaylists           = [],
        subscribedPlaylists      = [],
        subscribeBaseUrl         = config.baseUrl + config.paths.subscribe,
        onTheGo;

    var resetPlaylists = function(playlistsObject){
        if(!playlistsObject)playlistsObject=[]
        else playlistsObject.length = 0;
    };

    var isOld = function(obj,oldTimeout){
        if(!oldTimeout)oldTimeout=config.oldTimeout;
        return (!obj || !obj.timestamp || new Date().getTime() - obj.timestamp > oldTimeout);
    };

    var getAllPlaylists = function(ownedPlaylistsList,subscribedPlaylistsList){
        resetPlaylists();

        if(ownedPlaylistsList){
            resetPlaylists(ownedPlaylists);
            angular.forEach(ownedPlaylistsList,function(item,key){
                playlist.get({_id : item._id},function(playlistTemp){
                    ownedPlaylists.push(playlistTemp);
                    storeLocal('ownedPlaylists',ownedPlaylists);
                });


            });
        }

        if(subscribedPlaylists){
            resetPlaylists(subscribedPlaylists);
            angular.forEach(subscribedPlaylistsList,function(item,key){
                playlist.get({_id : item._id},function(playlistTemp){
                    subscribedPlaylists.push(playlistTemp);
                    storeLocal('subscribedPlaylists',subscribedPlaylists);
                });
            });
        }

    };


    var subscribeToPlaylist = function(playlist,success,error){
        if(!playlist || !playlist._id) return false;
        if(checkIfPlaylistIsSubscribed(playlist)) return true;
        var id = playlist._id;
        subscribedPlaylists.push(playlist);
        account.addPlaylistToSubscribedList(playlist);
        $http.put(subscribeBaseUrl + '/' + id).success(function(response){
            //account.refreshUserFromRemote();
            (success||angular.noop)(response);
        }).error(error);
    };

    var unSubscribeFromPlaylist = function(playlist,success,error){
        if(!playlist || !playlist._id) return false;
        var id = playlist._id;
        var index = $.inArray(playlist,subscribedPlaylists);
        subscribedPlaylists.splice(index,1);
        account.removePlaylistFromSubscribedList(playlist);
        $http.delete(subscribeBaseUrl + '/' + id).success(function(response){
        (success||angular.noop)(response);
        }).error(error);

    };


    var checkIfPlaylistIsSubscribed = function(playlist){
        return account.searchPlaylistInSubscribed(playlist);
    };



    var addNewPlaylist = function(newPlaylist,success,error){
        return playlist.save(tempStripPropertiesFromPlaylist(newPlaylist),function(response){
            ownedPlaylists.push(response);
            storeLocal('ownedPlaylists',ownedPlaylists);
            (success||angular.noop)(response);
        },function(e){
            //TODO :
            //newPlaylist._id=genereateGUID();
            //playlists.push(new playlist(newPlaylist));
            //storeLocal('playlists',playlists,true);
            (error||angular.noop)(e);
        });
    };

    var createNewPlaylistWithSongs = function(playlistTitle,songs,success,error){
        var newPlaylist=newEmptyPlaylist(playlistTitle);
        newPlaylist.songs = angular.copy(songs);
        newPlaylist.isPublic=true;

        addNewPlaylist(newPlaylist,success,error)

    };

    var getPlaylist = function(id,success,error){
        return playlist.get({_id : id},success,error);
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

    var removeSongFromPlaylist = function(song,holderPlaylist){
        var index = $.inArray(song,holderPlaylist.songs);
        if(index == -1)return false;
        holderPlaylist.songs.splice(index,1);
        if(!song||!song._id){

        }else{
            playlist.delete({_id : holderPlaylist._id, action : 'songs', extraId : song._id},function(response){
                storeLocal('ownedPlaylists',ownedPlaylists);
            },function(response){
                storeLocal('ownedPlaylists',ownedPlaylists,true);
            });
        }

    };

    var addSongToPlaylist = function(song,destPlaylist,success,error){
        var newSong = temporaryStripSongBeforeSend(song);
        if(destPlaylist == "onthego" || destPlaylist.title == "<on-the-go>"){
            onTheGo.songs.push(newSong);
            storeLocal('onTheGo',onTheGo);
            if(onTheGo._id){
                playlist.save({_id : onTheGo._id, action : 'songs'},newSong,function(response){
                    (success||angular.noop)(response);
                },function(e){
                    (error||angular.noop)(e);
                    console.error(e);
                });
            }
        }else{
            destPlaylist.songs.push(newSong);
            storeLocal('ownedPlaylists',ownedPlaylists);
            if(destPlaylist._id){
                playlist.save({_id : destPlaylist._id, action : 'songs'},newSong,function(response){
                    (success||angular.noop)(response);
                },function(e){
                    console.error(e);
                });
            }

        }

    };

    var temporaryStripSongBeforeSend = function(song){
        /*var newSong = angular.extend({},song);
         delete newSong.views;
         delete newSong._id;
         delete newSong.__v;*/
        var newSong={};
        newSong.youtubeId = song.youtubeId;
        newSong.thumbnail = song.thumbnail;
        newSong.title = song.title;
        newSong.duration = song.duration;
        return newSong;
    };

    var newEmptyPlaylist = function(title,owner){
        if(owner)owner = "me";
        return new playlist({songs : [],title: title, owner: owner});
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
                        ownedPlaylists.unshift(onTheGo);
                    },function(err){
                        console.error('Error getting onTheGo',err);
                        handleHttpErrors(err);
                        //error
                        onTheGo=playlists.newEmptyPlaylist("<on-the-go>");
                    });
                }else{
                    onTheGo=playlists.newEmptyPlaylist("<on-the-go>");
                }
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

    var clear = function(){
        if(ownedPlaylists) ownedPlaylists.length = 0;
        if(subscribedPlaylists) subscribedPlaylists.length = 0;
         if(onTheGo){
             onTheGo.songs.length = 0 ;
             onTheGo=null;
         }
    };

    return {
        clear : clear,
        getAllPlaylists : getAllPlaylists,
        subscribeToPlaylist : subscribeToPlaylist,
        unSubscribeFromPlaylist : unSubscribeFromPlaylist,
        checkIfPlaylistIsSubscribed : checkIfPlaylistIsSubscribed,
        createNewPlaylistWithSongs : createNewPlaylistWithSongs,
        addNewPlaylist : addNewPlaylist,
        newEmptyPlaylist : newEmptyPlaylist,
        removeSongFromPlaylist : removeSongFromPlaylist,
        addSongToPlaylist : addSongToPlaylist,
        getPlaylist : getPlaylist,
        getOnTheGo : getOnTheGo,
        ownedPlaylists : function(){
            return ownedPlaylists;
        },
        subscribedPlaylists : function(){
            return subscribedPlaylists;
        }
    };

}]);

