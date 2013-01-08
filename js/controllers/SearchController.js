function SearchController($scope,$http,bb) {

    $scope.playlists = bb.bg.playlists();
    $('#searchInput').focus();

	$scope.launch = function (video){
		//window.open(video.url);
	}

    $scope.playSong = function(song){
        $scope.selectSong(song,null);
    };


    $scope.addToNewPlaylistKeyPress = function(e,song){
        if(e.keyCode == 13){
            $scope.addSongToNewPlaylist(song,$(e.target).val());
            $(e.target).val('');
        }
    };



    $scope.searchYoutube = function(e,restrict){
        var url = "https://gdata.youtube.com/feeds/api/videos?orderby=relevance&max-results=10&v=2";


        $scope.searchResults = [];
        if (restrict && $scope.searchInput.length <= 2)return;
        $http.get(url,{
            params : {q:$scope.searchInput,category : 'Music'},
            transformResponse : function(data) {
                var tempArr=[];
                $(data).find('entry').each(function(){
                    tempArr.push(new Song(this));
                });
                data=null;
                return tempArr;
            }
        }).success(function(array){
                $scope.searchResults.length=0;
                $scope.searchResults = array;
                //initUITemp();
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


};





