var subscribe = angular.module('subscribe', []);

subscribe.service('subscribe', ['account','config','storage','$http',function(account,config,storage,$http) {

    var baseUrl = config.baseUrl + config.paths.subscribe;

    var subscribeToPlaylist = function(playlist,success,error){
        if(!playlist || !playlist._id) return false;
        var checkResult = checkIfPlaylistIsSubscribed(playlist);
        if(checkResult) return false;
        var id = playlist._id;
         $http.put(config.baseUrl + config.paths.subscribe + '/' + id).success(function(){
             account.refreshUserFromRemote();
         }).error(error);
    };

    var unSubscribeFromPlaylist = function(playlist,success,error){
        if(!playlist || !playlist._id) return false;
        var id = playlist._id;
        $http.delete(config.baseUrl + config.paths.subscribe + '/' + id).success(function(){

        }).error(error);

    };

    var checkIfPlaylistIsSubscribed = function(playlist){
        var _account = account.account(), subscribedPlaylists;
        if(_account.subscribedPlaylist) subscribedPlaylists = _account.subscribedPlaylist;
        if(!subscribedPlaylists) return false;
        for (var i in subscribedPlaylists){
            if(playlist._id == subscribedPlaylists[i])return true;
        }
        return false;
    };

    return {
        subscribeToPlaylist : subscribeToPlaylist,
        unSubscribeFromPlaylist : unSubscribeFromPlaylist
    };
}]);

