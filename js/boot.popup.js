var dependencies = [
    deps.popupApp,
    deps.ConfigModule,
    deps.StorageModule,
    deps.BBridge,
    deps.OnTheGoController,
    deps.MainController,
    deps.DiscoverController,
    deps.MyPlaylistsController,
    deps.PlaylistController,
    deps.SearchController,
    deps.SettingsController,
    deps.DebugController,
    deps.RecentController,
    deps.DiscoverModule,
    deps.YoutubeController,
    deps.YoutubePlaylistController,

    deps.filters,
    deps.directives,

    libs.jqueryUI,
    libs.jqueryMarquee,
    libs.ui
];

$script([libs.angular,libs.jquery],function(){
    $script([libs.angularResource,libs.common,libs.jqueryUI],function(){
        $script([libs.ui],function(){
            $script(dependencies,function(){
                angular.bootstrap(document, ['popupPlayerApp']);
            });
        });
    });
});
