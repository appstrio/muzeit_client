function YoutubeController($scope,bb,$location,$routeParams){
    $scope.youtubePlaylists = [];
    $scope.subscriptions=[];
    $scope.loading=true;
    $scope.noAccessToken=false;

    var accessToken = bb.bg.resources.access_tokens.youtube;
    var retry=false;
    var userId;
    var init=function(){
        if(accessToken){
            userId = $routeParams.userId || null;
            bb.bg.resources.youtube.getYoutubePlaylistFeed(accessToken,userId).success(function(data){
                var xml = $(data);
                $scope.title = xml.find('title').eq(0).text();
                var displayName = xml.find('author').eq(0).find('name').eq(0).text();
                if(displayName) $scope.title = "Playlists of " + displayName;


                xml.find('entry').each(function(index,elm){
                    var playlist = {};
                    playlist.title = $(this).find('title').eq(0).text();
                    var media =  $(this).find('media\\:group').eq(0);
                    playlist.thumbnail =  media.find('media\\:thumbnail').eq(0).attr('url');
                    playlist.playlistId =  $(this).find('yt\\:playlistId').eq(0).text();
                    $scope.youtubePlaylists.push(playlist);
                });
                if(!userId){
                    getSubscriptions();
                    $scope.title = "My YouTube";
                }
                $scope.loading=false;
                if(!$scope.$$phase) $scope.$apply();
            }).error(function(err,status){
                    console.error("Error getting playlists from youtube",err,status);
                    if(status == 401){
                        if(!retry) getAccessToken();
                    }else{
                        noAccessToken();
                    }
            });

        }else{
            getAccessToken();
        }

    };

    var getSubscriptions = function(){
        // get subscriptions
        bb.bg.resources.youtube.getSubscriptions(accessToken).success(function(data){
            var xml = $(data);
            xml.find('entry').each(function(index,elm){
                var user = {};
                user.title = $(this).find('title').eq(0).text();
                user.thumbnail =  $(this).find('media\\:thumbnail').eq(0).attr('url');
                user.userId =  $(this).find('yt\\:username').eq(0).text();
                $scope.subscriptions.push(user);
            });
            $scope.$apply();
        });

    };

    var getAccessToken = function(){
        bb.bg.resources.account.refreshGoogleAccessToken().success(function(response){
            if(response.accessToken){
                retry=true;
                accessToken = response.accessToken;
                bb.bg.methods.setGoogleAccessToken(response.accessToken);
                init();
            }else{
                noAccessToken();
            }
        }).error(function(){
           noAccessToken();
        });
    };

    var noAccessToken = function(){
        $scope.noAccessToken=true;
        $scope.loading=false;
        if(!$scope.$$phase)$scope.$apply();
    };
    init();

    $scope.goToPlaylist = function(playlist,e){
        $location.path('youtube/playlist/'+playlist.playlistId);
    };

    $scope.goToUser = function(user,e){
        e.preventDefault();
        $location.path('youtube/'+user.userId);
    };

    $scope.connectYoutube = function(e){
        e.preventDefault();
        $scope.connectGoogle();
    };

    $scope.trackEvent('youtube_controller');

};


YoutubeController.$inject = ['$scope','bb','$location','$routeParams'];
