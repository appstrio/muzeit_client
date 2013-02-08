var discover = angular.module('discover', []);

discover.service('discover', ['$http','config','storage','$q',function($http,config,storage,$q) {

    var collection={data: []};
    var oldTimeout = 1000 * 60 * 60;
    var facebookPlaylistOldTimeout = 1000 * 60 * 60 * 24;
    var maxSize = 100;

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

    var loadMore = function(success,error){
       return getServer(function(){
           (success||angular.noop)(collection);
       },function(err){
           (error||angular.noop)(err);
       });
    };


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
              angular.extend(collection,object.discover);
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


    var getServer = function(success,error){
        var songsPromise =  $http.get(config.baseUrl + config.paths.discover).success(function(response){
            var temp = angular.copy(response);
            applyObjectToResource(collection.data,temp);
            if(collection.data.length >= maxSize)collection.data.splice(0,maxSize);
            //removeDuplicates();  TODO
            collection.timestamp = new Date().getTime();
            storeLocal();
            (success||angular.noop)();
            response.length=0;
            response=null;
        }).error(function(err){
                (error||angular.noop)(err);
                console.error('Error getting discover ',err);
        });

        $q.all([songsPromise],function(array){
            (success||angular.noop)(array);
        },function(errArray){
            (error||angular.noop)(errArray);
        });
    };

    var firstTime = function(){
        var songsPromise =  $http.get(config.baseUrl + config.paths.discoverFirstTime).success(function(response){
            applyObjectToResource(collection.data,response);
            if(collection.data.length >= maxSize)collection.data.splice(0,maxSize);
            //removeDuplicates();  TODO
            storeLocal();
            response.length=0;
            response=null;
        }).error(function(err){
          //      (error||angular.noop)(err);
                console.error('Error getting discover ',err);
        });

        $q.all([songsPromise],function(array){
        },function(errArray){
            (error||angular.noop)(errArray);
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

    var getFacebookUserPlaylist = function(fbUserId,success,error){
        if(!fbUserId)return false;
        var result = {data:{}};
            getFacebookListLocal(fbUserId,function(object){
                if(object){
                    applyObjectToResource(result.data,object.data);
                    (success||angular.noop)(object.data);
                }else{
                    $http.get(config.baseUrl + config.paths.facebookPlaylist + "/" + fbUserId).success(function(data){
                        applyObjectToResource(result.data,data);
                        storeFacebookListLocal(fbUserId,result);
                        (success||angular.noop)(data);
                    }).error(function(err){
                            (error||angular.noop)(err);
                    });
                }
            });
        return result;
    };

    var storeFacebookListLocal = function(fbUserId,playlist){
        if(!playlist.data || playlist.data.length <= 0)return false;
        var key =  'fb_playlist_'+fbUserId;
        playlist.timestamp = new Date().getTime();
        var objectToStore = {};
        objectToStore[key] = playlist;
        storage.set(objectToStore);
    };

    var getFacebookListLocal = function(fbUserId,fn){
        var key =  'fb_playlist_'+fbUserId;
        return storage.get(key,function(object){
            if(object[key] && !isFacebookPlaylistOld(object[key])){
              (fn||angular.noop)(object[key]);
            }else{
                (fn||angular.noop)(false);
            }

        });
    };

    var getUserProfileByFacebookId = function(fbId,success,error){
        var url = config.baseUrl + config.paths.profileByFacebookId + '/' + fbId;
        var songsPromise =  $http.get(url).success(function(response){
                (success||angular.noop)(response);
        }).error(function(err){
                (error||angular.noop)(err);
                console.error('Error getting discover ',err);
        });

        $q.all([songsPromise],function(array){
            (success||angular.noop)(array);
        },function(errArray){
            (error||angular.noop)(errArray);
        });

    };

    var isFacebookPlaylistOld = function(playlist){
         return (!playlist || !playlist.timestamp ||  new Date().getTime() - playlist.timestamp > facebookPlaylistOldTimeout);
    };



    return {
        init : init,
        loadMore : loadMore,
        getLocal : getLocal,
        getServer : getServer,
        getFacebookUserPlaylist :  getFacebookUserPlaylist,
        getUserProfileByFacebookId : getUserProfileByFacebookId,
        firstTime : firstTime
    }
}]);

