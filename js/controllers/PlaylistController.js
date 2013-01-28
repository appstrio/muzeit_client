function PlaylistController ($scope,bb,$routeParams,$location,discover){
    $scope.showAddToPlaylistDropDown = false;
    $scope.loading=true;
    $scope.dontPushToRecent = false;
    var init = function(){
        if($routeParams.playlistId == "on-the-go"){
            $scope.playlist = bb.bg.onTheGo();
            console.log('$scope.playlist',$scope.playlist);
            $scope.loading=false;
        }else if ($routeParams.playlistId == "recent"){
            $scope.playlist = bb.bg.resources.recent.get();
            $scope.loading=false;
            $scope.dontPushToRecent = true;
        }else if($routeParams.playlistId == "search"){
                $location.path('search');
        }else if ($routeParams.playlistId == "facebookPlaylist"){
            $scope.playlist = discover.getFacebookUserPlaylist($routeParams.fbUserId,function(playlist){
                $scope.playlist = playlist;
                $scope.loading=false;
            });
        }else if (!$routeParams.playlistId || $routeParams.playlistId == "current_playlist"){
            $scope.playlist = bb.bg.currentState.playlist;
            $scope.loading=false;
        }else{
            $scope.showPlaylistsNavigation=true;
             bb.bg.methods.getPlaylist($routeParams.playlistId,function(response){
                $scope.playlist=response;

                 $scope.loading=false;
                if(!$scope.$$phase) {
                    $scope.$apply();
                }
            },function(e){
                console.error('Error getting playlist',e);
            });
        }

        if ($scope.playlist && $scope.playlist.title == "<on-the-go>" && $routeParams.playlistId != "on-the-go"){
            $location.path('/playlist/on-the-go');
        }else if($scope.playlist && $scope.playlist.title == "Recent" && $routeParams.playlistId != "recent"){
            $location.path('/playlist/recent');
        }


    };

    bb.init(function(promise){
        if(promise.ready){
            init();
            return;
        }else{
            promise.then(init);
        }
    });


    $scope.removePlaylist = function(){
        $location.path('/playlists');
        var index = $.inArray($scope.playlist,bb.bg.playlists);
        bb.bg.resources.playlist.delete({_id : $scope.playlist._id},function(response){
            bb.bg.playlists.splice(index,1);
            $scope.$apply(function(){

            });

        },function(e){
            console.error('Error removing playlist',e);
        });
    };

    $scope.addToNewPlaylistKeyPress = function(e,song){
        if(e.keyCode == 13){
            $scope.addSongToNewPlaylist(song,$(e.target).val());
            $(e.target).val('');
        }


    };

    $scope.addAllToNewPlaylistKeyPress = function(e){
        if(e.keyCode == 13){
            $scope.addAllToNewPlaylist($scope.playlist,$scope.allToNewPlaylistTitle);
            $scope.allToNewPlaylistTitle="";
        }
    };

    $scope.addAllToExistingPlaylist = function(playlist){
    };


    $scope.isSelfPlaylist = function(){
      return ($scope.playlist && $scope.playlist.title == "<on-the-go>" || bb.bg && bb.bg.user && $scope.playlist.owner && $scope.playlist.owner == bb.bg.user._id);
    };

    $scope.isOnTheGo = function(){
        return ($scope.playlist && $scope.playlist.title && $scope.playlist.title == "<on-the-go>");
    };

    $scope.showPlaylistHeader = function(){
        return ($scope.playlist && $scope.playlist.title  && $scope.playlist.title != "recent" && $scope.playlist.title != "Recent");
    };

    $scope.showAddAllDropDown = function(){
         return !$scope.showPlaylistHeader()||$scope.isOnTheGo();
    };

    $scope.showAddToPlaylistDropDown = function(){
        return !$scope.showPlaylistHeader() || $scope.isOnTheGo();
    };

    $scope.showUnsubscribeButton = function(){
        return false;
        return $scope.showPlaylistHeader();
    };

    $scope.showSubscribeButton = function(){
        return ($scope.showPlaylistHeader() && $scope.playlist.owner != $scope.myUserId());
    };





    $scope.owner = function(playlist){
        return ((playlist.owner == $scope.myUserId()) ? "By me" : "");
    };

    $scope.setSortable = function(){
            $(".otg-list").disableSelection();
            $(".otg-list").sortable();
    };


};