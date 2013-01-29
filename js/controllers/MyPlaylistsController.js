function MyPlaylistsController($scope,$location,bb,$location) {
    $scope.goToPlaylist = function(playlist){
        $location.path("/playlist/"+playlist._id);
    };

    $scope.playlistThumbnail = function(playlist){
        return playlist.thumbnail||((playlist.songs[0]) ? playlist.songs[0].thumbnail : '');
    };

    $scope.playlistOwnerString = function(playlist){
        if(playlist.owner == $scope.user._id){
            return "My playlist";
        }else{
            //return "By " _ playlist.owner.displayName + ".";
            return "By Naftali Bennet :)";
        }
    };

    $scope.removePlaylist = function(playlist,e){
        e.stopPropagation();
        var index = $.inArray(playlist,$scope.playlists);
        bb.bg.resources.playlist.delete({_id : playlist._id},function(response){
            $scope.playlists.splice(index,1);
            $scope.$apply(function(){

            });

        },function(e){
            // TODO : implement int he background
            $scope.playlists.splice(index,1);
            $scope.$apply(function(){

            });
            console.error('Error removing playlist',e);
        });
    };

    $scope.showRemovePlaylistButton = function(playlist){
        return (playlist.title != "<on-the-go>" && playlist.title != "On The Go");
    };

    $scope.trackEvent('playlists_controller');
};



MyPlaylistsController.$inject = ['$scope','$location','bb','$location'];




