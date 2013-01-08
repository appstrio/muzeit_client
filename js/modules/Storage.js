var storageModule = angular.module('StorageModule', []);

storageModule.service('storage', ['$q','$rootScope', function($q,$rootScope) {
    var storage = chrome.storage.local;

    var get = function(key,callback){
        //var deferred = $q.defer();
        storage.get(key,function(data){
            //deferred.resolve(data);
            if(callback)callback(data);
            if(!$rootScope.$$phase) $rootScope.$apply();
        });
        //return deferred.promise;
    };

    var set = function(item,callback){
        var deferred = $q.defer();
        storage.set(item,function(data){
            deferred.resolve(data);
            if(callback)callback(data);
        });
        return deferred.promise;
    };

    return {
        get : get,
        set : set
    }
}]);