var backgroundBridge = angular.module('bb', []);

backgroundBridge.service('bb', ['$q','$rootScope','$timeout', function($q,$rootScope,$timeout) {

    var bg = {ready : false};
    var defer;
    var retries=0;
    var init = function(fn){
        if (bg.ready){
            (fn||angular.noop)(bg);
            return bg;
        }

        if(!defer) defer = $q.defer();

        chrome.runtime.getBackgroundPage(function(backgroundPage){
            if (backgroundPage && backgroundPage.export && backgroundPage.export.isReady()){
                angular.extend(bg,backgroundPage.export);
                bg.ready=true;
                (fn||angular.noop)(bg);
                defer.resolve(bg);

            }else if(backgroundPage && backgroundPage.export){
                backgroundPage.export.readyDefer().promise.then(function(){
                    angular.extend(bg,backgroundPage.export);
                    bg.ready=true;
                    (fn||angular.noop)(bg);
                    defer.resolve(bg);
                },function(){
                    angular.extend(bg,backgroundPage.export);
                    bg.ready=true;
                    (fn||angular.noop)(bg);
                    defer.resolve(bg);
                });
            }else{
                if(retries > 100){
                    console.error('Muzeit failed to load.');
                    return false;
                }
                retries++;
                console.info('Retry getting background page in 5ms...');
                return $timeout(function(){
                    init(fn);
                },5);

            }
        });
        return defer.promise;
    };

    init();

    return {
        init : init,
        bg : bg
    };
}]);