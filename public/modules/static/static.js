(function() {
    'use strict';

    angular.module('static',[])
        .controller('StaticCtrl', ['$analytics', '$location', function($analytics, $location) {
            $analytics.pageTrack($location.path());
        }]);
})();