function YoutubeController($scope,bb,$location){
    $scope.youtubePlaylists = [];

    var accessToken = bb.bg.resources.access_tokens.youtube;
    if(accessToken){
        bb.bg.resources.youtube.getYoutubePlaylistFeed(accessToken).success(function(data){
           var xml = $(data);
           xml.find('entry').each(function(index,elm){
               var playlist = {};
               playlist.title = $(this).find('title').eq(0).text();
               var media =  $(this).find('media\\:group').eq(0);
               playlist.thumbnail =  media.find('media\\:thumbnail').eq(0).attr('url');
               playlist.playlistId =  $(this).find('yt\\:playlistId').eq(0).text();
               $scope.youtubePlaylists.push(playlist);
           });
            $scope.$apply();
        });
    }else{

    }

    $scope.goToPlaylist = function(playlist){
        $location.path('youtube/'+playlist.playlistId);
    };
};