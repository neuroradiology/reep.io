/**
 *  For now the download service is for one file. May change in the future.
 */

(function() {
    angular.module('download')
        .service('downloadService', ['config', '$q', 'peeringService', 'randomService', '$rootScope', 'storageService', function (config, $q, peeringService, randomService, $rootScope, storageService) {

            this.id = null;

            this.connection = null;

            this.file = {
                name: '',
                type: '',
                size: 0,
                totalChunksToRecieve: 0,
                chunksRecieved: 0,
                chunksofCurrentBlockRecieved: 0,
                downloadedChunksSinceLastCalculate: 0,
                progress: 0,
                noFileSystem: false
            };

            this.intervalProgress = null;

            this.downloadState = 'connecting';

            this.requestFileInformation = function(id){
                if(this.id !== null){
                    return;
                }

                this.id = this.parseId(id);

                peeringService.getPeer().then(function(peer){

                    this.connection = peer.connect(this.id.uploaderId, {
                        reliable: true
                    });

                    this.connection.on('open', function(){
                        if(this.file.name.length == 0){
                            this.connection.send({
                                packet: 'RequestFileInformation',
                                fileId: this.id.fileId
                            });
                        }
                    }.bind(this));

                    this.connection.on('close', function(){
                        $rootScope.$emit('DownloadDataChannelClose');
                    });

                    this.connection.on('data', function(data){
                        if(data instanceof ArrayBuffer){
                            this.__onPacketFileData(data);
                            return;
                        }

                        var fn = this['__onPacket' + data.packet];

                        if(typeof fn === 'function') {
                            fn = fn.bind(this);
                            fn(data);
                        }
                    }.bind(this));

                    this.connection.on('error', function(e){
                        $rootScope.$emit('DownloadDataChannelClose');
                    });
                }.bind(this));
            }

            this.parseId = function(id){
                if ( id.hasOwnProperty('uploaderId') ) {
                    return id;
                }

                return {
                    uploaderId: id.substring(0, config.peerIdLength),
                    fileId: id.substring(config.peerIdLength, config.peerIdLength+config.fileIdLength)
                }
            }

            this.startDownload = function(){
                if(this.file.name.length == 0){
                    return;
                }

                this.downloadState = 'inprogress';

                this.intervalProgress = setInterval(this.progressCalculations.bind(this), 1000);

                storageService.getStorageForFile(this.file.name, this.file.size).then(
                    function(fileIdentifier){
                        this.file.fileIdentifier = fileIdentifier;

                        this.requestBlock(this.file.chunksRecieved);
                    }.bind(this),
                    function(fileIdentifier){
                        this.file.fileIdentifier = fileIdentifier;
                        this.file.noFileSystem = true;
                        this.requestBlock(0);

                        $rootScope.$emit('NoFileSystem',  this.file);
                    }.bind(this)
                );
            }

            this.progressCalculations = function(){

                this.file.bytesPerSecond = (this.file.downloadedChunksSinceLastCalculate * config.chunkSize);

                $rootScope.$emit('intervalCalculations');

                this.connection.send({
                    packet: 'DownloadProgress',
                    bytesPerSecond: this.file.bytesPerSecond,
                    percent: this.file.progress,
                    fileId: this.id.fileId
                });

                this.file.downloadedChunksSinceLastCalculate = 0;
            }

            this.requestBlock = function(chunkPosition){
                this.connection.send({
                    packet: 'RequestBlock',
                    fileId: this.id.fileId,
                    chunkPosition: chunkPosition
                });
            }

            this.doAuthentication = function(password){
                this.connection.send({
                    packet: 'Authenticate',
                    password: password,
                    fileId: this.id.fileId
                });
            }

            this.__onPacketFileData = function(data){
                this.file.chunksRecieved++;
                this.file.chunksofCurrentBlockRecieved++;
                this.file.downloadedChunksSinceLastCalculate++;

                storageService.addChunkToFileBuffer(this.file.fileIdentifier, data);

                this.file.progress = (this.file.chunksRecieved / this.file.totalChunksToRecieve) * 100;

                if(this.file.chunksRecieved == this.file.totalChunksToRecieve){
                    storageService.getUrlForFinishedDownload(this.file.fileIdentifier).then(
                        function(url){
                            clearInterval(this.intervalProgress);
                            this.progressCalculations();
                            this.file.fileSystemUrl = url;
                            this.downloadState = 'finished';

                            $rootScope.$emit('DownloadFinished');

                            this.connection.send({
                                packet: 'DownloadFinished',
                                fileId: this.id.fileId
                            });
                        }.bind(this)
                    );
                }else{
                    if((this.file.chunksofCurrentBlockRecieved % config.chunksPerBlock) == 0){
                        this.file.chunksofCurrentBlockRecieved = 0;
                        this.requestBlock(this.file.chunksRecieved);
                    }
                }
            }

            this.__onPacketAuthenticationSuccessfull = function(data){
                $rootScope.$emit('AuthenticationSuccessfull');
            }

            this.__onPacketIncorrectPassword = function(data){
                $rootScope.$emit('IncorrectPassword');
            }

            this.__onPacketFileInformation = function(data){
                this.file.name = data.fileName;
                this.file.size = data.fileSize;
                this.file.type = data.fileType;
                this.file.totalChunksToRecieve = Math.ceil(data.fileSize / config.chunkSize);

                this.downloadState = 'ready';

                storageService.checkIfFileExits(data.fileName, data.fileSize).then(
                    function(metaData){
                        this.file.chunksRecieved = Math.ceil(metaData.size / config.chunkSize);
                        this.file.progress = (this.file.chunksRecieved / this.file.totalChunksToRecieve) * 100;

                        if(this.file.progress == 100){
                            storageService.getUrlForFinishedDownload(storageService.generateFileIdentifier(data.fileName, data.fileSize)).then(
                                function(url){
                                    this.downloadState = 'finished';
                                    this.file.fileSystemUrl = url;

                                    $rootScope.$emit('FileInformation',  this.file);
                                }.bind(this)
                            );
                        }else{
                            $rootScope.$emit('FileInformation',  this.file);
                        }
                    }.bind(this),
                    function(){
                        $rootScope.$emit('FileInformation',  this.file);
                    }
                );
            }

            this.__onPacketAuthenticationRequest = function(data){
                this.downloadState = 'authentication';
                $rootScope.$emit('AuthenticationRequest');
            }
        }]);
})();