(function() {
    angular.module('common')
        .service('randomService', [function () {

            /**
             * Generates a random string
             * @param {number} length
             * @returns {string}
             */
            this.generateString = function(length){
                var text = "";
                var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

                for( var i=0; i < length; i++ )
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
            }
        }]);
})();