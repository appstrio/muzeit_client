function MyPlaylistsController($scope,$location,bb,$location) {
    $scope.goToPlaylist = function(playlist){
        $location.path("/playlist/"+playlist._id);
    };

    $scope.playlistThumbnail = function(playlist){
        return playlist.thumbnail||((playlist.songs[0]) ? playlist.songs[0].thumbnail : '');
    };

    $scope.playlistOwnerString = function(playlist){
        if(playlist.owner == $scope.user._id){
            return "my playlist";
        }else{
            //return "By " _ playlist.owner.displayName + ".";
            return "By Naftali Bennet";
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

}






