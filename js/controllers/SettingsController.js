function SettingsController($scope,bb,$location){
    $scope.importYoutube = function(){
        if(bb.bg.resources.access_tokens.youtube){
            $location.path('youtube');
        }else{
            $scope.connectGoogle();

        }
    };

    $scope.trackEvent('settings_controller');

};

SettingsController.$inject = ['$scope','bb','$location'];
