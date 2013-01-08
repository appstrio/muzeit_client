var discover = angular.module('discover', []);

discover.service('discover', ['$http','config','storage',function($http,config,storage) {

    var collection={data: []};
    var oldTimeout = 1000 * 60 * 10;
    var maxSize = 100;

    var applyObjectToResource = function( resource, object ) {
        if(!resource)resource={};

        if ( angular.isArray( resource ) ) {
            resource.splice.apply(
                resource,
                [ 0, 0 ].concat( object )
            );
        } else {
            angular.extend( resource, object );
        }

        return resource;

    };

    var getLocal = function(fn){
        storage.get('discover',function(object){
          if(object.discover){
              collection.data.length=0;
              collection.data=null;
              collection=null;
              collection=object.discover;
              //removeDuplicates();
              //storeLocal();
              (fn||angular.noop)(collection);
          }else{
              (fn||angular.noop)()
          }
      });
    };

    var storeLocal = function(){
        storage.set({discover : collection});
    };


    var getServer = function(success){
        return $http.get(config.baseUrl + config.paths.discover).success(function(response){
            applyObjectToResource(collection.data,response);
            if(collection.data.length >= maxSize)collection.data.splice(0,maxSize);
            //removeDuplicates();  TODO
            collection.timestamp = new Date().getTime();
            storeLocal();
            (success||angular.noop)();
            response.length=0;
            response=null;
        }).error(function(err){
                console.error('Error getting discover ',err);
        });

    };

    var removeDuplicates = function(){
       for (var i in collection.data){
           if(!collection.data[i] || !collection.data[i].data)continue;
          for (var j in collection.data){
              if (j == i)continue;
              if (collection.data[i].data._id == collection.data[j].data._id){
                  collection.data.splice(j,1);
              }
          }
       }
    };

    var isOld = function(){
      if(!collection.timestamp) return true;
      return (new Date().getTime() -  collection.timestamp > oldTimeout);
    };

    var init = function(success,error){
        getLocal(function(){
           if( isOld() || collection.data.length ==0){
              getServer(function(){
                  (success||angular.noop)(collection);
              },function(err){
                  (error||angular.noop)(err);
              });
           }else{
               (success||angular.noop)(collection);
           }
        });
        return collection;
    };
    var getFacebookUserPlaylist = function(fbUserId,success,error){
        if(!fbUserId)return false;
        var result = {data:[]};
            $http.get(config.baseUrl + config.paths.facebookPlaylist + "/" + fbUserId).success(function(data){
                applyObjectToResource(result.data,data);
                (success||angular.noop)(data);
            }).error(function(err){
                (error||angular.noop)(err);
            });
        return result;
    };

    return {
        getLocal : getLocal,
        getServer : getServer,
        init : init,
        getFacebookUserPlaylist :  getFacebookUserPlaylist
    }
}]);

