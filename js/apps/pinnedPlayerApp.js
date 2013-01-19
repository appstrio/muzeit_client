angular.module('pinnedPlayerApp', ['bb','config','filters','discover','StorageModule'], function($routeProvider, $locationProvider) {
    var bbDelay = {
        // I will cause a 1 second delay
        delay: function(bb) {
            var promise = bb.init();
            if(promise.ready) return true;
            return promise;
        }
    };

    $routeProvider.when('/playlist/:playlistId', {
        templateUrl: 'views/controllers/PinnedPlaylist.html',
        controller: PlaylistController,
        resolve: bbDelay
    });

}).run(function(bb,$location,$rootScope){
        bb.init(function(){
            if(bb.bg.currentState && bb.bg.currentState.path){
                $rootScope.$apply(function(){
                    $location.path(bb.bg.currentState.path);
                });
            }
        });

        var backgroundTimestamp;
        var port  = chrome.extension.connect({name: "pinned"});

        port.onMessage.addListener(function(msg) {
               $rootScope.$broadcast('background',msg);
               backgroundTimestamp=new Date().getTime();
        });

        var checkBgIsAlive = function(){
            port.postMessage({request : 'isAlive'})
        };

        var closePinnedPlayer = function(){
          // close pinnedplyaer if no answer from background page for 8 seconds
           if(new Date().getTime() - backgroundTimestamp > 1000*8){
               window.close();
           }
        };
        setInterval(checkBgIsAlive,2000);
        setInterval(closePinnedPlayer,8000);




    });


