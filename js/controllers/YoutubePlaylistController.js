function YoutubePlaylistController($scope,bb,$routeParams){
     var playlistId = $routeParams.playlistId;
     bb.bg.resources.youtube.getYoutubePlaylist(playlistId,bb.bg.resources.access_tokens.youtube).success(function(playlist){
         console.log('playlist',playlist);
         $scope.playlist = playlist;
         if(!$scope.$$phase)$scope.$apply();
     });

    $scope.import = function(){
        $scope.addAllToNewPlaylist($scope.playlist,$scope.playlist.title);
    };

};