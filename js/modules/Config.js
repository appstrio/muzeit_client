// server base url and paths
//var baseUrl  = "http://music-player.server.nodejitsu.com/v1/";


    var config = angular.module('config', []);

    config.service('config', [function() {
        var baseUrl = chrome.i18n.getMessage('baseURL') || "http://www.muzeit.net/v1/";

        var paths = {
            account             : "account",
            facebookAuth        : "auth/facebook/oauth",
            googleAuth          : "auth/google/oauth",
            logout              : "logout",
            onTheGo             : "account/onthego",
            playlists           : "playlists",
            discover            : "discover",
            discoverPlaylists   : "discoverPlaylists",
            discoverFirstTime   : "discoverFirstTime",
            facebookPlaylist    : "facebookPlaylist",
            friends             : "getfacebookfriends",
            profileByFacebookId : "userContentByFid",
            subscribe           : "account/subscribedPlaylists"


        };

        var getBuildVersion = function(){
            return chrome.app.getDetails().version;
        };

        return {
            baseUrl : baseUrl,
            paths : paths,
            oldTimeout : 1000*60,
            getBuildVersion : getBuildVersion
        }
    }]);

