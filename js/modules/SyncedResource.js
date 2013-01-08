
angular.module('syncedResource', []).
        factory('syncedResource', ['$resource', 'storage','config', function($resource, storage,config) {

        function SyncedResourceFactory(path,key, paramDefaults, actions, oldTimeout, maxItems, isLazy, isArray){
            if(!oldTimeout) oldTimeout = 1000 * 60 * 60 * 24;

            var suffix = "/:listController:id/:action";

            var url = config.baseUrl + path + suffix;

            var preDefinedActions = {
                query : {method : 'get', isArray : ((isArray) ? true : false)},
                update : {method : 'put'}
            };

            var collection={};

            actions = (actions) ? angular.extend(actions,preDefinedActions) : preDefinedActions ;

            var resource = $resource(url, paramDefaults, actions);

            var applyLocalObjectToResource = function( resource, object ) {
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

            var isOld = function(object){
                return (new Date().getTime() - object.lastUpdate  > oldTimeout);
            };

            var getItemById = function(_id){
                if (isArray){
                    if(!collection && collection.resource) return false;
                    for (var i in collection.resource){
                        if (collection.resource[i] && collection.resource[i]._id && collection.resource[i]._id == _id){
                            return collection.resource[i];
                        }
                    }
                }else{
                    if(!collection && !collection.items) return false;
                    for (var i in collection.items){
                        if (collection.items[i] && collection.items[i]._id && collection.items[i]._id == _id){
                            return collection.items[i];
                        }
                    }
                }

                return false;
            };

            var storeLocal = function(params){
                var obj = {};
                angualr.extend(collection,params);
                obj[key] = {
                    resource : collection
                };

                storage.set(obj);
                obj[key].resource = null;
                obj[key]=null;
                obj=null;

            };

            return {
                query : function(fn){
                    if(collection && collection.lastUpdate && !isOld(collection)){
                        (fn||angular.noop)(collection);
                        return collection;
                    }

                    var localData = storage.get(key,function(object){
                        if(object[key] && object[key].lastUpdate && !isOld(object[key])){
                            applyLocalObjectToResource( collection, object[key]);
                        }else{
                            if (isLazy && object[key] && object[key].items){
                                applyLocalObjectToResource( collection, object[key]);
                            }

                           resource.query(function(data){
                                applyLocalObjectToResource( collection.resource, data);
                                (fn||angular.noop)(data);
                                storeLocal({dirty : false, lastUpdate : new Date().getTime()});
                            },function(){
                                //applyLocalObjectToResource(collection,{items:[]})
                                (fn||angular.noop)(collection);
                            });
                            //applyLocalObjectToResource( collection.resource, remoteResults);

                        }
                    });

                    return collection;
                },

                get : function(params,fn){
                    if(collection && collection.lastUpdate && !isOld(collection)){
                        var localItem = getItemById(params.id);
                        if(localItem){
                            (fn||angular.noop)(data);
                            return localItem;
                        }
                    }

                    return resource.get(params,fn);
                },

                save : function(params,fn){
                    if (maxItems && collection.items.length >= maxItems) return false;
                    var newIndex = (collection.items.push(params)) - 1;
                    return resource.save(params,function(data){
                        if(!data._id) return false;
                        collection.items[newIndex]._id = data._id;
                        (fn||angular.noop)(data);
                        storage.set(collection);
                    },function(){
                        //error
                        console.error('error save',collection);
                        storeLocal({dirty : true});
                    });
                },

                update : function(params,fn){
                    return resource.update(params,function(data){
                        (fn||angular.noop)(data);
                    });
                },

                delete : function(params,fn){
                    var index = $.inArray(params,collection.items);
                    index = (index >= 0) ? index : $.inArray(getItemById(params._id),collection.items) ;
                    if (index >= 0 )collection.items.splice(index,1);
                    else return false;

                    storeLocal();
                    return resource.delete(params,function(data){
                        (fn||angular.noop)(data);
                    },function(){
                        storeLocal({dirty : true});
                    });
                },

                storeLocal : storeLocal,
                collection : collection
            };
        };


        return SyncedResourceFactory;
    }]);
