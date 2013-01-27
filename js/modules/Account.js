var account = angular.module('account', []);

account.service('account', ['$http','config','storage','$rootScope',function($http,config,storage,$rootScope) {

    var account={};
    var oldTimeout = 1000 * 60 * 60 * 24;

    var init = function(success,error){
        console.info('Init user account.');
        storage.get('account',function(object){
            if(object.account && object.account._id && !isOld(object.account)){
                console.info('User account was loaded successfully from local storage.');
                clearAccount();
                angular.extend(account,object.account);
                (success||angular.noop)(account);
            }else{
                refreshUserFromRemote(success,error);
            }

        });

    };

    var refreshUserFromRemote = function(success,error){
        console.info('Refresh user account from remote server.');

        $http.get(config.baseUrl + config.paths.account).success(function(data){
            clearAccount();
            angular.extend(account,data);
            account=data;
            storeLocal();
            (success||angular.noop)(data);
            chrome.extension.sendMessage({from : 'user.js', request: 'refresh_user'});
            console.info('User account was loaded successfully from remote server.');

        }).error(function(err){
                account=null;
                account={};
                storeLocal();
                (error||angular.noop)(err);
                console.error('Failed loading user account');
         });
    };
    var clearAccount = function(){
        if(!account){
            account = {};
            return;
        }
        delete account._id;
        account=null;
        account={};
        if(!$rootScope.$$phase)$rootScope.$apply();
    };


    var isOld = function(object){
        return (!object.timestamp || new Date().getTime() - object.timestamp > oldTimeout);
    };

    var storeLocal = function(){
        if(account) account.timestamp = new Date().getTime();
        storage.set({account:account});
    };

    var connectFacebook = function (){
        chrome.windows.create({url : config.baseUrl + 'auth/facebook/oauth',width:500, height:500, focused:true});
    };

    var connectGoogle = function (){
        chrome.windows.create({url : config.baseUrl + 'auth/google/oauth',width:500, height:500, focused:true});
    };

    var refreshGoogleAccessToken = function(){
      return $http.get(config.baseUrl + 'auth/google/oauth');
    };

    var logout = function(){
        return $http.get(config.baseUrl + 'logout').success(function(response){
            account=null;
            storeLocal();
        }).error(function(){

        });
    };

    var clear = function(){
        clearAccount();
        storeLocal();
        console.log('account after clear',account);
    };

    return {
        init : init,
        refreshUserFromRemote : refreshUserFromRemote,
        account : function(){
            return account;
        },
        connectFacebook : connectFacebook,
        connectGoogle : connectGoogle,
        refreshGoogleAccessToken : refreshGoogleAccessToken,
        logout : logout,
        clear : clear
    };

}]);
