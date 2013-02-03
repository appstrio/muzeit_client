function ProfileByFacebookController($scope,$http,config,bb,discover,$location,$window,$routeParams) {
    $scope.loading=true;
    $scope.profilePlaylist = {};

    var fbId = $routeParams.fbUserId;
    var userPlaylist,result;
    var init=function(){
        if(!fbId)return false;
         discover.getUserProfileByFacebookId(fbId,function(response){
            $scope.discover = angular.copy(response);
            $scope.from = $scope.discover.from;
            userPlaylist = getPlaylist($scope.discover.data.items,$scope.from);
            $scope.loading=false;
            if(!$scope.$$phase)$scope.$apply();

        },function(err){
             $scope.loading=false;
             $scope.error = "Oh oh seems like the user is not a friend of you or there's a mistake...";
         });

        $scope.trackEvent('profile_controller_by_facebook_id',fbId);
    };

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

    $scope.renderItem = function(item){
        if(item.itemType == "song"){
            $scope.selectSong(item.data,userPlaylist);
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


    var getPlaylist = function(items,from){
        var songs = [];
        for (var i in items){
            if($scope.items.itemType == 'song'){
                songs.push(items[i].data);
            }
        }
        return {
            title : "All the songs of " + from.name,
            songs : songs
        }
    };


    init();



};


ProfileByFacebookController.$inject = ['$scope','$http','config','bb','discover','$location','$window','$routeParams'];






