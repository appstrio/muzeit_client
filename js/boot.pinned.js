var dependencies = [
    deps.pinnedApp,
    deps.ConfigModule,
    deps.StorageModule,
    deps.BBridge,
    deps.OnTheGoController,
    deps.MainController,
    deps.DiscoverController,
    deps.MyPlaylistsController,
    deps.PinnedController,
    deps.PinnedPlaylistController,
    deps.SearchController,
    deps.SettingsController,
    deps.filters,
    deps.directives,
    deps.DiscoverModule

];

$script(libs.angular,function(){
    $script([libs.angularResource,libs.jquery,libs.common],function(){
        $script(dependencies,function(){
            angular.bootstrap(document, ['pinnedPlayerApp']);
        });
    });
});
