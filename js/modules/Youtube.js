var youtubeModule = angular.module('youtube', []);

youtubeModule.service('youtube', ['$q','$rootScope','$http', function($q,$rootScope,$http) {
    var baseUrl =  "https://gdata.youtube.com/feeds/api/";
    var baseUserPlaylistsPath = "users";
    var basePlaylistPath = "playlists";
    var baseSubscriptionsPath = "users/default/subscriptions";

    var buildUrl = function(path,params,maxResults){
        var url = baseUrl + path + "?v=2";
        for (var i in params){
            url += "&" + i + "=" + params[i];
        }
        if(maxResults) url += "&max-results="+maxResults;
        return url;
    };

    var getYoutubePlaylistFeed = function(accessToken,userId){
        var userPath;
        if(userId){
            userPath = "/" + userId + "/playlists";
        }else{
            userPath = "/default/playlists";
        }
        var url = buildUrl(baseUserPlaylistsPath+userPath,{access_token : accessToken});
        return $http.get(url).error(handleError);
    };

    var getSubscriptions = function(accessToken){
        var url = buildUrl(baseSubscriptionsPath,{access_token : accessToken});
        return $http.get(url).error(handleError);
    };

    var getYoutubePlaylist = function(playlistId,accessToken){
        var url = buildUrl(basePlaylistPath+"/"+playlistId,{access_token : accessToken},50);
        return $http.get(url,{
            transformResponse : function(data) {
                var xml = $(data);

                var playlist = {};
                playlist.title = xml.find('title').eq(0).text();
                playlist.thumbnail = xml.find('media\\:group').eq(0).find('media\\:thumbnail').eq(0).attr('url');
                playlist.isPublic = true;
                playlist.songs = [];
                var author = xml.find('author').eq(0);
                playlist.youtubeUser = {
                    displayName : author.find('name').eq(0).text(),
                    userId : author.find('yt\\:userId').eq(0).text()
                };

                /*xml.find('entry').each(function(){
                    var media = $(this).find('media\\:group').eq(0);
                    playlist.songs.push ({title : $(this).find('title').text(), youtubeId : media.find('yt\\:videoId').eq(0).text(),thumbnail : media.find('media\\:thumbnail').eq(0).attr('url')});
                });*/

                xml.find('entry').each(function(){
                    var song = new Song(this);
                    if(!song.badSong) playlist.songs.push(song);
                });


                return playlist;
            }});
    };

    var handleError = function(err){
        if(err.status == 401 || err.statusCode == 401){

        }
    }

    return {
        getYoutubePlaylistFeed : getYoutubePlaylistFeed,
        getYoutubePlaylist : getYoutubePlaylist,
        getSubscriptions : getSubscriptions
    };

}]);