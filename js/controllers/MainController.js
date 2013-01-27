function MainController($scope,$location,$http,bb) {
    $scope.bb=bb.bg;
    $scope.loading=true;
    $scope.alert={};

    var currentState;

    var init = function(){
        //start
        $scope.currentState  = currentState = bb.bg.currentState;
        $scope.user  = bb.bg.user();

        if($scope.user && $scope.user._id){
            $scope.recent = bb.bg.resources.recent.get();
            $scope.playlists = bb.bg.playlists();
        }
        $scope.loading = false;
        $scope.$apply();
    };




    bb.init(function(promise){
        if(promise.ready){
            init();
            return;
        }else{
            promise.then(init);
        }
    });

    $scope.togglePlay = function(){
        // change active screen
        bb.bg.methods.togglePlay();
    };

    $scope.nextSong = function(){
        bb.bg.methods.playNextSong(true);
        bb.bg.resources.recent.addSong($scope.currentState.song);
    };

    $scope.previousSong = function(){
        bb.bg.methods.playPreviousSong();
        bb.bg.resources.recent.addSong($scope.currentState.song);
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
      return $scope.user && $scope.user._id;
    };

    $scope.$on('$routeChangeSuccess', function(){
        if(bb&&bb.bg&&bb.bg.methods) bb.bg.methods.changeCurrentState({path : $location.path()});
    });

    $scope.switchToSearch = function(){
        bb.bg.setLastSearch({searchInput : ''});
        if($location.path() != '/search' )$location.path('/search');
    };


    $scope.$on('background',function(event,args){
        $scope.$apply(function(){

        });
    });
    $scope.volume = 0;

    $scope.$watch(function(){
        if($scope.currentState && $scope.currentState.playerState) return $scope.currentState.playerState.volume;
        else return 0;
    },function(){
        if(!volumeIsDragging){
            if($scope.currentState && $scope.currentState.playerState) $scope.volume = $scope.currentState.playerState.volume;
            else $scope.volume=0;
        }
    });
    var volumeIsDragging = false;

    $scope.connectFacebook = function(){
        bb.bg.methods.connectFacebook();
    };

    $scope.connectGoogle = function(){
        bb.bg.methods.connectGoogle();
    };


    $scope.logout = function(){
        bb.bg.methods.logout().then(function(){
            $scope.$apply(function(){
                $scope.user=bb.bg.user();
            });
        });
    };


    $scope.isSongActive = function(song){
        return (bb.bg.currentState.song === song);
    };


    var hideMainDropdown = function(){
        $(".dropwrapper").hide().html('');
    };


    $scope.addSongToPlaylist = function(song,playlist,e){
        if(!bb.bg.ready) return;
        if (playlist === "on-the-go"){
            playlist = bb.bg.onTheGo();
        }
        if(e){
            e.preventDefault();
            e.stopPropagation();
        //    var alertElement = $(e.target).parents('li.item').eq(0).find('.item-alert')[0];
        //    if(alertElement)
        //        showAlertOnItem(alertElement,"Song was added to playlist");
        }
        bb.bg.methods.addSongToPlaylist(song,playlist);
        hideMainDropdown();
        showAlert('Song was added to playlist');
    };


    var showAlertOnItem = function(elm,message){
       elm.fadeIn(function(){
          setTimeout(function(){
              elm.fadeOut();
          },2000);
       });
    };

    $scope.addAllToNewPlaylist = function(playlist,newPlaylistTitle){
        if(!newPlaylistTitle) return false;

        var newPlaylist={};
        newPlaylist.songs = angular.copy(playlist.songs);
        newPlaylist.title = newPlaylistTitle;
        newPlaylist.isPublic=true;
        tempStripSongsV(newPlaylist);
        console.log(JSON.stringify(newPlaylist));
        bb.bg.methods.addNewPlaylist(newPlaylist,function(playlist){
            $scope.$apply(function(){
                $location.path('/playlist/'+playlist._id);
            });
            showAlert('A new playlist was created.');

        },function(e){
            console.error('Error saving new playlist',e);
        });
        hideMainDropdown();

    };

    var tempStripSongsV = function(playlist){
        for(var i in playlist.songs){
            delete playlist.songs[i].__v;
        }
    };

    $scope.addSongToNewPlaylist = function(song,newPlaylistTitle){
        if(!newPlaylistTitle) return false;
        var newPlaylist={};
        newPlaylist.title = newPlaylistTitle;
        newPlaylist.isPublic=true;

        bb.bg.methods.addNewPlaylist(newPlaylist,function(playlist){
            $scope.$apply(function(){
                if(song){
                    bb.bg.methods.addSongToPlaylist(song,playlist,function(){
                        $location.path('/playlist/'+playlist._id);
                    },function(error){
                        console.error('Error adding song to playlist');
                    });
                }else{
                    $location.path('/playlist/'+playlist._id);
                }
                showAlert('A new playlist was created.');

            });

        },function(e){
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
        bb.bg.methods.removeSongFromPlaylist(song,playlist);
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

    var alertInterval;
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

    $scope.myUserId = function(){
        return bb.bg.user()._id;
    };

    $scope.skipWelcomeScreen = function(){
        init();
    };

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
