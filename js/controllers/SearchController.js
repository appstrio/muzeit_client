function SearchController($scope,$http,bb,$location) {
    $scope.friends = angular.copy(bb.bg.friends());

    var lastSearch = bb.bg.getLastSearch();
    $scope.searchResults = [];
    $scope.searchIn = "youtube";

    if(lastSearch){
        if(lastSearch.searchResults)$scope.searchResults = lastSearch.searchResults;
        if(lastSearch.searchInput)$scope.searchInput = lastSearch.searchInput;
        if(lastSearch.searchIn) $scope.searchIn = lastSearch.searchIn;
    }

    $('#searchInput').focus();

	$scope.launch = function (video){
		//window.open(video.url);
	}

    $scope.playSong = function(song){
        var playlist = {
            _id : 'search',
            title : "Search",
            songs : $scope.searchResults
        }
        $scope.selectSong(song,playlist);
    };


    $scope.addToNewPlaylistKeyPress = function(e,song){
        if(e.keyCode == 13){
            $scope.addSongToNewPlaylist(song,$(e.target).val());
            $(e.target).val('');
        }
    };

    $scope.changeSearchIn = function(changeTo,e){
        e.preventDefault();
        e.stopPropagation();
        $scope.searchIn = changeTo;
    };

    $scope.search = function(restrictResults,e){
        if(lastSearch){
            lastSearch.searchInput = $scope.searchInput;
            lastSearch.searchIn = $scope.searchIn;
        }
         if($scope.searchIn == "friends"){

         }else{
             $scope.searchYoutube(restrictResults,e);
         }
    };

    $scope.searchYoutube = function(restrict,e){
        var url = "https://gdata.youtube.com/feeds/api/videos?orderby=relevance&max-results=20&v=2";

        if (restrict && $scope.searchInput.length <= 2)return;
        $http.get(url,{
            params : {q:$scope.searchInput,category : 'Music'},
            transformResponse : function(data) {
                var tempArr=[];
                $(data).find('entry').each(function(){
                    var song = new Song(this);
                    if(!song.badSong) tempArr.push(song);
                });
                data=null;
                return tempArr;
            }
        }).success(function(array){
                $scope.searchResults.length=0;
                $scope.searchResults = array;
                bb.bg.setLastSearch({searchResults : array});
        });
    };

    $scope.openAddToPlaylist =function(e){
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

    $scope.goToUser = function(friend,e){
        e.preventDefault();
        e.stopPropagation();
        if(friend.uid){
            $location.path('profile/facebook/'+friend.uid);
        }
    };

    $scope.trackEvent('search_controller');


};


SearchController.$inject = ['$scope','$http','bb','$location'];






