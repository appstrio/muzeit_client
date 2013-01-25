// server base url and paths
//var baseUrl  = "http://music-player.server.nodejitsu.com/v1/";


    var config = angular.module('config', []);

    config.service('config', [function() {
        var baseUrl = chrome.i18n.getMessage('baseURL') || "http://music-player-server.herokuapp.com/v1/";

        var paths = {
            account             : "account",
            facebookAuth        : "auth/facebook/oauth",
            googleAuth          : "auth/google/oauth",
            logout              : "logout",
            onTheGo             : "account/onthego",
            playlists           : "playlists",
            discover            : "discover",
            discoverPlaylists   : "discoverPlaylists",
            facebookPlaylist    : "facebookPlaylist",
            friends             : "getfacebookfriends"

        };

        return {
            baseUrl : baseUrl,
            paths : paths,
            oldTimeout : 1000*5
        }
    }]);

