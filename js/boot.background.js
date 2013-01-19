var dependencies = [
    deps.backgroundApp,
    deps.ConfigModule,
    deps.PlaylistModule,
    deps.StorageModule,
    deps.SyncedResource,
    deps.Account,
    deps.Recent
];



$script(libs.angular,function(){
    $script([libs.angularResource,libs.jquery,libs.common],function(){
        $script(dependencies,function(){
                angular.bootstrap(null, ['backgroundApp']);
        });
    });
});
