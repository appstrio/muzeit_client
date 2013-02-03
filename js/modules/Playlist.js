var playlist = angular.module('playlist', []);

/*playlist.service('playlist', ['$resource','config',function($resource,config) {
    var playlist = $resource(config.baseUrl + config.paths.playlists + "/:listController:_id/:action/:extraId");

    return playlist;
}]);*/

playlist.factory('playlist', ['$resource','config',function($resource,config) {
    var playlist = $resource(config.baseUrl + config.paths.playlists + "/:listController:_id/:action/:extraId");
    return playlist;
}]);
