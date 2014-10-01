(function() {
    angular.module('peering', [])
        .service('peeringService', ['config', '$q', 'randomService', function (config, $q, randomService) {
            this.peer = null;

            this.getPeer = function(){
                var deferred  = $q.defer();

                if(this.peer !== null){
                    deferred.resolve(this.peer);
                    return deferred.promise;
                }

                var peer = new Peer(randomService.generateString(config.peerIdLength), config.peerConfig);

                peer.on('open', function(id){
                    deferred.resolve(peer);
                });

                peer.on('error', function(e){
                    deferred.reject(e);
                });

                this.peer = peer;
                return deferred.promise;
            }
        }]);
})();