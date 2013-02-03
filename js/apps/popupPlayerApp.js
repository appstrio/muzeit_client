angular.module('popupPlayerApp', ['StorageModule','config','bb','filters','directives','discover'], ['$routeProvider', '$locationProvider',function($routeProvider, $locationProvider) {
    var bbDelay = {
        delay: function(bb) {
            var promise = bb.init();
            if(promise.ready){
                return true;
            }else{
                return promise;
            }

        }
    };

   $routeProvider. when('/playlists', {
       templateUrl: 'views/controllers/Playlists.html',
       controller: MyPlaylistsController,
       resolve: bbDelay
       }).



   when('/discover', {
       templateUrl: 'views/controllers/Discover.html',
       controller: DiscoverController,
       resolve: bbDelay
   }).


   when('/profile/facebook/:fbUserId', {
       templateUrl: 'views/controllers/Profile.html',
       controller: ProfileByFacebookController,
       resolve: bbDelay
   }).


   when('/playlist/:playlistId/:fbUserId', {
   templateUrl: 'views/controllers/Playlist.html',
   controller: PlaylistController,
   resolve: bbDelay
   }).

   when('/playlist/:playlistId', {
       templateUrl: 'views/controllers/Playlist.html',
       controller: PlaylistController,
       resolve: bbDelay
   }).


       when('/settings', {
        templateUrl: 'views/controllers/Settings.html',
        resolve: bbDelay
   }).

   when('/search', {
	    templateUrl: 'views/controllers/Search.html',
	    controller: SearchController,
        resolve: bbDelay
  }).

   when('/youtube', {
       templateUrl: 'views/controllers/Youtube.html',
       controller: YoutubeController,
       resolve: bbDelay
   }).

   when('/youtube/:userId', {
       templateUrl: 'views/controllers/Youtube.html',
       controller: YoutubeController,
       resolve: bbDelay
   }).


       when('/youtube/playlist/:playlistId', {
       templateUrl: 'views/controllers/YoutubePlaylist.html',
       controller: YoutubePlaylistController,
       resolve: bbDelay
   }).


       when('/loading', {
       templateUrl: 'views/controllers/Loading.html',
       resolve: bbDelay
   }).


   when('/welcome', {
       templateUrl: 'views/controllers/Welcome.html',
       resolve: bbDelay
   }).

       when('/debug', {
       templateUrl: 'views/controllers/debug.html',
       controller: DebugController,
       resolve: bbDelay
   }).

   otherwise({redirectTo:'/discover'});

}]).run(['bb','$location','$rootScope',function(bb,$location,$rootScope){

        bb.init(function(){
            if(bb.bg.currentState && bb.bg.currentState.path){
                $rootScope.$apply(function(){
                    $location.path(bb.bg.currentState.path);
                });
            }

            var port  = chrome.extension.connect({name: "popup"});
            port.onMessage.addListener(function(msg) {
                $rootScope.$broadcast('background',msg);
            });

        });




}]);
