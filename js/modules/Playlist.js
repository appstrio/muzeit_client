    var playlist = angular.module('playlist', []);

    playlist.service('playlist', ['$resource','config',function($resource,config) {
        var suffix = "/:listController:id/:action";
        var url = config.baseUrl + config.paths.playlists + suffix;
        var actions = {
            updateSongs : {method : 'POST', params : {action : 'songs'}},
            put : {method : 'PUT'}

        };

        var resource = $resource(url,null,actions);

        return resource;
    }]);

