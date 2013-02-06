function MainController($scope,$location,$http,bb,config) {
    $scope.bb       = bb.bg;
    $scope.loading  = true;
    $scope.alert    = {};
    $scope.volume   = 100;

    var currentState,
        baseUrl              = config.baseUrl,
        volumeIsDragging     = false,
        alertInterval;


    var init = function(){
        //start
        $scope.currentState  = currentState = bb.bg.currentState;
        $scope.user  = bb.bg.user();

        if($scope.user && $scope.user._id){
            $scope.recent = bb.bg.resources.recent.get();
            $scope.playlists = bb.bg.resources.playlists.ownedPlaylists();
            $scope.subscribedPlaylists = bb.bg.resources.playlists.subscribedPlaylists();
        }
        $scope.ga = bb.bg.resources.ga;
        $scope.loading = false;
        $scope.$apply();
    };


    $scope.trackEvent = function(category,action,label,value){
        if($scope.ga){
            $scope.ga.trackEvent(category,action,label,value);
        }
    };

    $scope.togglePlay = function(){
        // change active screen
        bb.bg.methods.togglePlay();
    };

    $scope.nextSong = function(){
        bb.bg.methods.playNextSong(true);
    };

    $scope.previousSong = function(){
        bb.bg.methods.playPreviousSong();
    };

    $scope.selectSong = function(song,playlist,dontPushToRecent){
        if(!playlist) playlist = $scope.playlist;
        if(!playlist)playlist={songs:[]};
        bb.bg.methods.changeCurrentState({playlist : playlist, song:song,play:true},{loadNewVideo:true,refreshIframe : true},{updatePinnedPlayer : true});
        if(!dontPushToRecent)bb.bg.resources.recent.addSong($scope.currentState.song);
    };

    $scope.isActiveScreen = function(screen){
        return ($location.path() == screen);
    };

    $scope.showWelcomeScreen = function(){
      return (!$scope.loading && !$scope.isConnected());
    };

    $scope.isConnected = function(){
      return bb.bg.methods.isConnected();
    };

    $scope.switchToSearch = function(){
        bb.bg.setLastSearch({searchInput : ''});
        if($location.path() != '/search' )$location.path('/search');
    };

    $scope.connectFacebook = function(){
        bb.bg.methods.connectFacebook();
    };

    $scope.connectGoogle = function(){
        bb.bg.methods.connectGoogle();
    };

    $scope.logout = function(){
        $scope.loading=true;
        bb.bg.methods.logout().then(function(){
            $location.path('');
            init();
            if(!$scope.$$phase)$scope.$apply();
        });
        if(!$scope.$$phase)$scope.$apply();
        return false;

    };

    $scope.isSongActive = function(song){
        return (bb.bg.currentState.song == song);
    };


    var hideMainDropdown = function(){
        $(".dropwrapper").hide().html('');
    };


    $scope.addSongToPlaylist = function(song,playlist,e){
        if(e){
            e.preventDefault();
            e.stopPropagation();
        }

        if(!bb.bg.ready) return;
        if (playlist === "on-the-go"){
            playlist = bb.bg.onTheGo();
        }

        bb.bg.resources.playlists.addSongToPlaylist(song,playlist,function(){
            showAlert('Song was added to playlist.');
        },function(){
            showAlert('Could not add song to playlist.');
        });
        hideMainDropdown();
    };


    $scope.addAllToNewPlaylist = function(playlist,newPlaylistTitle,e){
        if(e){
            e.preventDefault();
            e.stopPropagation();
        }

        if(!newPlaylistTitle) return false;

        bb.bg.resources.playlists.createNewPlaylistWithSongs.addNewPlaylist(newPlaylistTitle,playlist.songs,function(playlist){
            $scope.$apply(function(){
                $location.path('/playlist/'+playlist._id);
                showAlert('A new playlist was created : "'+ newPlaylist.title +'".');
            });

        },function(e){
            showAlert('Could not create new playlist, please try again.');
            console.error('Error saving new playlist',e);
        });

        hideMainDropdown();

    };

    $scope.addSongToNewPlaylist = function(song,newPlaylistTitle,e){
        if(e){
            e.preventDefault();
            e.stopPropagation();
        }

        if(!newPlaylistTitle) return false;

        bb.bg.resources.playlists.createNewPlaylistWithSongs(newPlaylistTitle,[song],function(playlist){
            $scope.$apply(function(){
                $location.path('/playlist/'+playlist._id);
                showAlert('A new playlist was created : "'+ newPlaylistTitle +'".');
            });

        },function(e){
            showAlert('Could not create new playlist, please try again.');
            console.error('Error saving new playlist',e);
        });

        $scope.showAddToPlaylistDropDown = false;
        hideMainDropdown();

    };



    $scope.removeSong = function(song,playlist,e){
        e.preventDefault();
        e.stopPropagation();
        if($scope.currentState.song == song){
            // stop
            bb.bg.methods.stop();
        }
        bb.bg.resources.playlists.removeSongFromPlaylist(song,playlist);
        showAlert('Song was removed from playlist.');
    };


    $scope.openAddToPlaylistWindow = function(e){
        e.preventDefault();
        e.stopPropagation();
        var self=e.target;
        var dropBody   = $(self).next(".drop-body"),
            holder     = $(".dropwrapper"),
            thatParent = $(self).parents(".item");

        if (holder.is(":visible")) {
            holder.html("");
            holder.hide();
            thatParent.removeClass("hover");
        }
        else {
            holder.show();
            holder.attr("data-index", thatParent.index());
            holder.html("");
            dropBody.clone(true).appendTo(holder).addClass("shown");
            thatParent.addClass("hover");

        }
    };

    $scope.openAddAllToPlaylistWindow = function(e){
        e.preventDefault();
        e.stopPropagation();
        var self = $(e.target);
        var dropBody = self.next(".drop-body");
        dropBody.toggleClass("shown");

    };

    var showAlert = function(message){
        $scope.alert.message = message;
        $scope.alert.display=true;
        $('#alert').fadeIn();
        alertInterval=setInterval($scope.hideAlert,1000*2.3);
    };

    $scope.hideAlert = function(e){
        if(e)e.stopPropagation();
        clearInterval(alertInterval);
        alertInterval=null;
        $('#alert').fadeOut(function(){
            $scope.alert.display=false;
        });

    };


    $scope.subscribeToPlaylist = function(playlist,success,error){
        return bb.bg.resources.playlists.subscribeToPlaylist(playlist,function(){
            showAlert("You have successfully subscribed to playlist '" + playlist.title +"'");
            (success||angular.noop)();
            if(!$scope.$$phase)$scope.$apply();
        },function(){
            (error||angular.noop)();
            if(!$scope.$$phase)$scope.$apply();
        });
    };

    $scope.unSubscribeFromPlaylist = function(playlist,success,error){
        var playlistTitle = playlist.title;
        return bb.bg.resources.playlists.unSubscribeFromPlaylist(playlist,function(){
            showAlert("You have successfully unsubscribed from playlist '" + playlistTitle + "'");
            (success||angular.noop)();
            if(!$scope.$$phase)$scope.$apply();
        },function(){
            showAlert("Unsubscribe from playlist '" + playlistTitle + "' was failed.");
            (error||angular.noop)();
            if(!$scope.$$phase)$scope.$apply();
        });
    };

    $scope.isPlaylistSubscribed = function(playlist){
        var result = bb.bg.resources.playlists.checkIfPlaylistIsSubscribed(playlist);
        return (result !== false);
    };

    $scope.sharePlaylist = function(playlist,e){
        if(e){
            e.stopPropagation();
            e.preventDefault();
        }
        if(!playlist || !playlist._id)return;
        $http.post(baseUrl + config.paths.playlists + "/" + playlist._id + "/share").success(function(){
            showAlert("The playlist has been shared to your Facebook.");
        }).error(function(){
                showAlert("Error sharing a playlist.");
            });
    };

    $scope.likePlaylist = function(playlist,e){
        if(e){
            e.stopPropagation();
            e.preventDefault();
        }
        if(!playlist || !playlist._id)return;
        $http.post(baseUrl + config.paths.playlists + "/" + playlist._id + "/like").success(function(){
            showAlert("You liked the playlist on Facebook.");
        }).error(function(){
                showAlert("Error like a playlist.");
            });
    };

    $scope.shareSong = function(song,e){
        if(e){
            e.stopPropagation();
            e.preventDefault();
        }
        if(!song || !song.youtubeId)return;
        $http.post(baseUrl + config.paths.playlists + "/" + song.youtubeId + "/share").success(function(){
            showAlert("The song has been shared to your Facebook.");
        }).error(function(){
                showAlert("Error sharing a song.");
            });
    };

    $scope.likeSong = function(song,e){
        if(e){
            e.stopPropagation();
            e.preventDefault();
        }
        if(!song || !song.youtubeId)return;
        $http.post(baseUrl + config.paths.playlists + "/" + song.youtubeId + "/like").success(function(){
            showAlert("You liked the song on Facebook.");
        }).error(function(){
                showAlert("Error liking a song.");
            });
    };

    $scope.myUserId = function(){
        return bb.bg.user()._id;
    };

    $scope.skipWelcomeScreen = function(){
        init();
    };


    bb.init(function(promise){
        if(promise.ready){
            init();
            return;
        }else{
            promise.then(init);
        }
    });

    $scope.$on('$routeChangeSuccess', function(){
        if(bb&&bb.bg&&bb.bg.methods) bb.bg.methods.changeCurrentState({path : $location.path()});
    });

    $scope.$on('background',function(event,args){
        $scope.$apply(function(){

        });
    });

    $scope.$watch(function(){
        if($scope.currentState && $scope.currentState.playerState) return $scope.currentState.playerState.volume;
        else return 0;
    },function(){
        if(!volumeIsDragging){
            if($scope.currentState && $scope.currentState.playerState) $scope.volume = $scope.currentState.playerState.volume;
            else $scope.volume=0;
        }
    });


    // listen to message passing
    $( ".vc_pointer" ).draggable({ containment: "parent", scroll: false, axis: "y" ,
        drag: function() {
            volumeIsDragging = true;
            $(this).next().attr("style" , $(this).attr("style"));
            var newVolumeValue = (1 -(parseInt($(this).css('top').split('px')[0]) / 37)) * 100;
            bb.bg.methods.setNewVolume(newVolumeValue);
        },
        dragEnd : function(){
            volumeIsDragging = false;
        }
    });



};



MainController.$inject = ['$scope','$location','$http','bb','config'];

