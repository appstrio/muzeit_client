var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-38046118-2']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


var ga = angular.module('ga', []);

ga.service('ga', [function() {


    var trackEvent = function(category,action,label,value){
        /*_trackEvent(category, action, opt_label, opt_value, opt_noninteraction)*/
        _gaq.push(['_trackEvent', category,action,label,value]);
    };

    return {
        trackEvent : trackEvent
    }
}]);

