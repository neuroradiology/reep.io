(function() {
    angular.module('common')
        .service('detectCrawlerService', [function () {

            this.regex = "(bot|borg|google(^tv)|yahoo|slurp|msnbot|msrbot|openbot|archiver|netresearch|lycos|scooter|altavista|teoma|gigabot|baiduspider|blitzbot|oegp|charlotte|furlbot|http%20client|polybot|htdig|ichiro|mogimogi|larbin|pompos|scrubby|searchsight|seekbot|semanticdiscovery|silk|snappy|speedy|spider|voila|vortex|voyager|zao|zeal|fast\\-webcrawler|converacrawler|dataparksearch|findlinks|Prerender)";
            /**
             * Generates a random string
             * @param {number} length
             * @returns {string}
             */
            this.isCrawler = function(ua){
                var match = ua.match(this.regex);

                if(match){
                    return true;
                }

                return false;
            }
        }]);
})();