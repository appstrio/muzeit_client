function RecentController ($scope){

    $scope.addToNewPlaylistKeyPress = function(e,song){
        if(e.keyCode == 13){
            $scope.addSongToNewPlaylist(song,$scope.newPlaylistTitle);
        }
    };

    $scope.addAllToNewPlaylistKeyPress = function(e){
        if(e.keyCode == 13){
            $scope.addAllToNewPlaylist($scope.recent,$scope.allToNewPlaylistTitle);
        }
    };


};