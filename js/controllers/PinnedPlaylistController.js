function PinnedPlaylistController ($scope,bb,$routeParams,$location,discover){
    $scope.showAddToPlaylistDropDown = false;
    $scope.loading=true;
    $scope.dontPushToRecent = false;
    var init = function(){
        $scope.playlist = bb.bg.currentState.playlist;
    };

    $scope.$watch(function(){
        return bb.bg.currentState.playlist;
    },function(){
      init();
    });

    bb.init(function(promise){
        if(promise.ready){
            init();
            return;
        }else{
            promise.then(init);
        }
    });



    $scope.isSelfPlaylist = function(){
        return ($scope.playlist && $scope.playlist.title == "<on-the-go>" || bb.bg && bb.bg.user && $scope.playlist.owner && $scope.playlist.owner == bb.bg.user._id);
    };

    $scope.isOnTheGo = function(){

        return ($scope.playlist && $scope.playlist.title && $scope.playlist.title == "<on-the-go>");
    };

    $scope.showPlaylistHeader = function(){
        return ($scope.playlist && $scope.playlist.title && $scope.playlist.title != "<on-the-go>" && $scope.playlist.title != "On The Go" && $scope.playlist.title != "recent" && $scope.playlist.title != "Recent");
    };

    $scope.showAddAllDropDown = function(){
        return !$scope.showPlaylistHeader();
    };

    $scope.showAddToPlaylistDropDown = function(){
        return !$scope.showPlaylistHeader();
    };

    $scope.showUnsubscribeButton = function(){
        return false;
        return $scope.showPlaylistHeader();
    };
};



PinnedPlaylistController.$inject = ['$scope','bb','$routeParams','$location','discover'];
