function DiscoverController($scope,$http,config,bb,discover,$location,$window) {
    $scope.loading=true;


    var init=function(){
        discover.init(function(collection){
           if($scope.discover){
               $scope.discover.data.length=0;
               $scope.discover=null;
           }
            $scope.discover=collection;
            $scope.loading=false;
            if(!$scope.$$phase)$scope.$apply();
        });
    };

    init();

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

    $scope.renderItem = function(item){
      if(item.itemType == "song"){
         $scope.selectSong(item.data);
      }
    };

    $scope.isItemPlaying = function(item){
        return ($scope.currentState.song && $scope.currentState.song === item.data);
    };

    $scope.goToUserThumbnail = function(item,e){
        e.preventDefault();
        e.stopPropagation();
        if(item.from && item.from.facebookId){
            $location.path('playlist/facebookPlaylist/'+item.from.facebookId);
        }
    };

};






