function DiscoverController($scope,$http,config,bb,discover,$location,$window) {
    $scope.loading=true;
    $scope.loadMoreStatus = "Load More";
    $scope.disocverPlaylist = {
        title : 'Discover'
    }

    var discoverPlaylist;
    var init=function(){
        $scope.discover = discover.init(function(collection){
            discoverPlaylist = getPlaylist();
            $scope.loading=false;
            if(!$scope.$$phase)$scope.$apply();

        });

        $scope.trackEvent('discover_controller');
    };

    $scope.loadMore = function(e){
        e.preventDefault();
        e.stopPropagation();
        if($scope.loadMoreStatus == "Loading..."){
            return;
        }
        $scope.loadMoreStatus = "Loading...";
        discover.loadMore(function(){
            $scope.loadMoreStatus="Load More";
            if(!$scope.$$phase)$scope.$apply();
        },function(){
            $scope.loadMoreStatus="Load More";
            if(!$scope.$$phase)$scope.$apply();
        });
    }
    $scope.addToNewPlaylistKeyPress = function(e,song){
        if(e.keyCode == 13){
            $scope.addSongToNewPlaylist(song,$(e.target).val());
            $(e.target).val('');
        }
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


    $scope.isItemPlaying = function(item){
        return ($scope.currentState.song && $scope.currentState.song === item.data);
    };

    $scope.goToUserThumbnail = function(item,e){
        e.preventDefault();
        e.stopPropagation();
        if(item.from && item.from.fid || item.from.fId){
            $location.path('profile/facebook/'+(item.from.fid||item.from.fId));
        }
    };

    $scope.renderItem = function(item){
        if(item.itemType == "song"){
            $scope.selectSong(item.data,discoverPlaylist);
        }else if(item.itemType == "playlist"){
            $location.path('playlist/'+item.data._id);
        }
    };

    $scope.import = function(playlist,e){
        e.preventDefault();
        e.stopPropagation();
        $scope.addAllToNewPlaylist(playlist,playlist.title);
    };

    $scope.subscribe = function(playlist,e){
        e.preventDefault();
        e.stopPropagation();
        $scope.subscribeToPlaylist(playlist);
    };

    $scope.unsubscribe = function(playlist,e){
        e.preventDefault();
        e.stopPropagation();
        $scope.unSubscribeFromPlaylist(playlist);
    };


    var getPlaylist = function(){
      var songs = [];
        for (var i in $scope.discover.data){
            if($scope.discover.data[i].itemType == 'song'){
                songs.push($scope.discover.data[i].data);
            }
        }
        return {
            title : "Discover",
            songs : songs
        }
    };


    init();



};


DiscoverController.$inject = ['$scope','$http','config','bb','discover','$location','$window'];






