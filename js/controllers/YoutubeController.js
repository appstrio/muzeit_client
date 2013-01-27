function YoutubeController($scope,bb,$location,$routeParams){
    $scope.youtubePlaylists = [];
    $scope.subscriptions=[];

    var accessToken = bb.bg.resources.access_tokens.youtube;
    var retry=false;
    var userId;
    var init=function(){
        if(accessToken){
            userId = $routeParams.userId || null;
            console.log('userId',userId);
            bb.bg.resources.youtube.getYoutubePlaylistFeed(accessToken,userId).success(function(data){
                var xml = $(data);
                $scope.title = xml.find('title').eq(0).text();
                xml.find('entry').each(function(index,elm){
                    var playlist = {};
                    playlist.title = $(this).find('title').eq(0).text();
                    var media =  $(this).find('media\\:group').eq(0);
                    playlist.thumbnail =  media.find('media\\:thumbnail').eq(0).attr('url');
                    playlist.playlistId =  $(this).find('yt\\:playlistId').eq(0).text();
                    $scope.youtubePlaylists.push(playlist);
                });
                console.log('$scope.youtubePlaylists',$scope.youtubePlaylists);
                if(!userId){
                    getSubscriptions();
                    $scope.title = "My YouTube";
                }

                if(!$scope.$$phase) $scope.$apply();
            }).error(function(err){
                    if(err.status == 401 || err.statusCode == 401){
                        if(!retry) handle401Error();
                    }else{
                        noAccessToken();
                    }
            });

        }else{
            noAccessToken();
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
            console.log('$scope.subscriptions',$scope.subscriptions);
            $scope.$apply();
        });

    };

    var handle401Error = function(){
        bb.bg.resources.account.refreshGoogleAccessToken().success(function(response){
            if(response.access_token){
                retry=true;
                accessToken = response.access_token;
                init();
            }else{
                noAccessToken();
            }
        }).error(function(){
           noAccessToken();
        });
    };

    var noAccessToken = function(){

    };
    init();

    $scope.goToPlaylist = function(playlist,e){
        $location.path('youtube/playlist/'+playlist.playlistId);
    };

    $scope.goToUser = function(user,e){
        e.preventDefault();
        $location.path('youtube/'+user.userId);
    };

};