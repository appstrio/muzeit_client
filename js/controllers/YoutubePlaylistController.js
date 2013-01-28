function YoutubePlaylistController($scope,bb,$routeParams,$location){
     var playlistId = $routeParams.playlistId;
     bb.bg.resources.youtube.getYoutubePlaylist(playlistId,bb.bg.resources.access_tokens.youtube).success(function(playlist){
         $scope.playlist = playlist;
         if(!$scope.$$phase)$scope.$apply();
     });

    $scope.import = function(){
        $scope.addAllToNewPlaylist($scope.playlist,$scope.playlist.title);
    };

    $scope.goToYoutubeUser = function(user,e){
        e.preventDefault();
        $location.path('youtube/'+user.userId);
    };

};