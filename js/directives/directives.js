    angular.module('directives', [])


// key-up directive

        .directive('onKeyUp', ['$parse',function($parse) {
        return function(scope, elm, attrs) {
            var fn=$parse(attrs.onKeyUp);
            elm.bind('keyup', function(e) {
                scope.$apply(function() {
                    fn(scope,{$event : e});
                });
            });
        };
    }]);


