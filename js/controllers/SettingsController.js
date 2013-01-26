function SettingsController($scope,bb,$location){
    console.log('SettingsController');
    $scope.importYoutube = function(){
        if(bb.bg.resources.access_tokens.youtube){
            $location.path('youtube');
        }else{
            $scope.connectGoogle();

        }
    };
};