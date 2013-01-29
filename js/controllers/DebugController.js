function DebugController($scope,bb) {
    bb.init(function(){
        $scope.bg = bb.bg;
    });

};

DebugController.$inject = ['$scope', 'bb'];




