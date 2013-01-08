angular.module('popupPlayerApp', ['StorageModule','config','bb','filters','directives','discover'], function($routeProvider, $locationProvider) {
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

   otherwise({redirectTo:'/playlist/recent'});

}).run(function(bb,$location,$rootScope){

        bb.init(function(){
            console.log('popupapp run');
            if(bb.bg.currentState && bb.bg.currentState.path){
                $rootScope.$apply(function(){
                    console.log('bb.bg.currentState.path '+bb.bg.currentState.path);
                    $location.path(bb.bg.currentState.path);
                });
            }

            var port  = chrome.extension.connect({name: "popup"});
            port.onMessage.addListener(function(msg) {
                $rootScope.$broadcast('background',msg);
            });

        });




    });

/*
$routeProvider.when('/Book/:bookId', {
  templateUrl: 'book.html',
  controller: BookCntl,
  resolve: {
    // I will cause a 1 second delay
    delay: function($q, $timeout) {
      var delay = $q.defer();
      $timeout(delay.resolve, 1000);
      return delay.promise;
    }
  }
});

*/
