(function() {
    angular.module('upload')
        .service('uploadService', ['config', '$q', 'peeringService', 'randomService', '$rootScope', function (config, $q, peeringService, randomService, $rootScope) {

            /**
             * Connection data
             * @typedef {Object} Connection
             * @property {boolean} isAuthenticated - Has this connection provided the right password?
             * @property {FileReader} reader - file reader
             * @property {number} uploadedChunksSinceLastCalculate - Keeps track of the chungs that where send since last speed calculate
             * @property {number} chunksToSend - Total chunks left to send
             * @property {number} startByte - The startbyte of the current read
             */

            /**
             * Holds file data
             * @typedef {Object} File
             * @property {boolean} name - File name
             * @property {boolean} size - File size
             * @property {boolean} type - Mime type
             */

            /**
             * The complete Triforce, or one or more components of the Triforce.
             * @typedef {Object} UploadEntry
             * @property {File} file - File data
             * @property {Connection} connections - Connection Data
             * @property {string} password - File password. Password length > 0 = a password is set
             */

            /**
             * For every file we have a entry in this object. Key == file id
             * @type {Object.<string, UploadEntry>}
             */
            this.uploads = {};

            /**
             *
             * @param file
             * @returns {Q.promise}
             */
            this.registerFile = function(file){
                var deferred  = $q.defer();

                peeringService.getPeer().then(function(peer){
                    var fileId = this.__generateFileId();

                    this.uploads[fileId] = {};
                    this.uploads[fileId].file = file;
                    this.uploads[fileId].connections = {};
                    this.uploads[fileId].password = '';

                    //Bind the connection event only once
                    if(!peer._events.hasOwnProperty('connection')){
                        peer.on('connection', function(connection){
                            connection.on('data', function(data){
                                var fn = this['__onPacket' + data.packet];

                                if(typeof fn === 'function') {
                                    fn = fn.bind(this);
                                    fn(data, connection);
                                }
                            }.bind(this));
                            connection.on('close', function(){
                                $rootScope.$emit('dataChannelClose', connection.peer, fileId);
                            });
                        }.bind(this));
                    }

                    deferred.resolve({peerId: peer.id, fileId: fileId});
                }.bind(this),
                    function(){
                        deferred.reject();
                    });

                return deferred.promise;
            }

            /**
             * Generates a radom file id
             * @returns {string}
             * @private
             */
            this.__generateFileId = function(){
                var fileId = randomService.generateString(config.fileIdLength);

                while(this.uploads.hasOwnProperty(fileId)){
                    fileId = randomService.generateString(config.fileIdLength);
                }

                return fileId;
            }

            /**
             * Sets a password for a file
             * @param {string} fileId
             * @param {string} password
             */
            this.setPasswordForFile = function(fileId, password){
                this.uploads[fileId].password = password;
            }

            /**
             * Peer id and File id
             * @typedef {Object} ParsedId
             * @property {string} peerId - Peer id
             * @property {string} fileId - file id
             */

            /**
             * Gets the peer id and file id from a combined id
             * @param {string|ParsedId} id
             * @returns {ParsedId}
             */
            this.parseId = function(id){
                if ( id.hasOwnProperty('peerId') ) {
                    return id;
                }

                return {
                    peerId: id.substring(0, config.peerIdLength),
                    fileId: id.substring(config.peerIdLength, config.peerIdLength+config.fileIdLength)
                }
            }

            //Packets

            /**
             * Emits UploadFinished event
             * @param data
             * @param connection
             * @private
             */
            this.__onPacketDownloadFinished = function(data, connection){
                $rootScope.$emit('UploadFinished', connection.peer, data.fileId);
            }

            /**
             * Authenticates a connection if the password is correct
             * @param data
             * @param connection
             * @private
             */
            this.__onPacketAuthenticate = function(data, connection){
                if(data.password == this.uploads[data.fileId].password){
                    this.uploads[data.fileId].connections[connection.peer].isAuthenticated = true;

                    connection.send({
                        packet: 'FileInformation',
                        fileId: data.fileId,
                        fileName: this.uploads[data.fileId].file.name,
                        fileSize: this.uploads[data.fileId].file.size,
                        fileType: this.uploads[data.fileId].file.type
                    });

                    connection.send({
                        packet: 'AuthenticationSuccessfull'
                    });
                }else{
                    connection.send({
                        packet: 'IncorrectPassword'
                    });
                }
            }

            /**
             * Sends file information or a Authentication request if the file has a password
             * @param data
             * @param connection
             * @private
             */
            this.__onPacketRequestFileInformation = function(data, connection){
                if(this.uploads[data.fileId].connections[connection.peer] === undefined){
                    this.uploads[data.fileId].connections[connection.peer] = {};

                    if(this.uploads[data.fileId].password.length > 0){
                        this.uploads[data.fileId].connections[connection.peer].isAuthenticated = false;
                    }else{
                        this.uploads[data.fileId].connections[connection.peer].isAuthenticated = true;
                    }
                }

                if(this.uploads[data.fileId].connections[connection.peer].isAuthenticated){
                    connection.send({
                        packet: 'FileInformation',
                        fileId: data.fileId,
                        fileName: this.uploads[data.fileId].file.name,
                        fileSize: this.uploads[data.fileId].file.size,
                        fileType: this.uploads[data.fileId].file.type
                    });
                }else{
                    connection.send({
                        packet: 'AuthenticationRequest'
                    });
                }
            }

            /**
             * Send a file block
             * @param data
             * @param connection
             * @private
             */
            this.__onPacketRequestBlock = function(data, connection){
                var connectionData = this.uploads[data.fileId].connections[connection.peer];
                if(connectionData.isAuthenticated == false){
                    return;
                }

                if (connectionData.reader === undefined){
                    //First request
                    $rootScope.$emit('UploadStart', connection.peer, data.fileId);
                    connectionData.uploadedChunksSinceLastCalculate = 0;

                    connectionData.reader = new FileReader();

                    connectionData.reader.onloadend = function(evt) {

                        if (evt.target.readyState == FileReader.DONE) {
                            if(evt.target.result.byteLength == 0){
                                return;
                            }

                            connection.send(evt.target.result);
                            connectionData.uploadedChunksSinceLastCalculate++;
                            connectionData.chunksToSend--;

                            if(connectionData.chunksToSend == 0){
                                return;
                            }

                            connectionData.startByte += config.chunkSize;

                            if(this.uploads[data.fileId].file.blobData !== undefined){
                                var blob = this.uploads[data.fileId].file.blobData.slice(connectionData.startByte, (connectionData.startByte + config.chunkSize));
                            }else{
                                var blob = this.uploads[data.fileId].file.slice(connectionData.startByte, (connectionData.startByte + config.chunkSize));
                            }

//                            if(this.__clients[receiver.peer].cancelUpload == true){
//                                this.__clients[id].reader = undefined;
//                                this.__clients[receiver.peer].startByte = 0;
//                                this.__clients[receiver.peer].chunksToSend = this.chunksPerBlock;
//                                this.__clients[receiver.peer].cancelUpload = false;
//                                this.emitEvent('uploadFinished', [receiver.peer]);
//                                receiver.send({
//                                    packet: 'SuccessFullCanceld'
//                                });
//                                return;
//                            }

                            reader.readAsArrayBuffer(blob);
                        }
                    }.bind(this);
                }

                var reader = connectionData.reader;

                connectionData.startByte = data.chunkPosition * config.chunkSize;
                connectionData.chunksToSend = config.chunksPerBlock;

                if(this.uploads[data.fileId].file.blobData !== undefined){
                    var blob = this.uploads[data.fileId].file.blobData.slice(connectionData.startByte, (connectionData.startByte+config.chunkSize));
                }else{
                    var blob = this.uploads[data.fileId].file.slice(connectionData.startByte, (connectionData.startByte+config.chunkSize));
                }

                reader.readAsArrayBuffer(blob);
            }

            /**
             * Emits UploadProgress event
             * @param data
             * @param connection
             * @private
             */
            this.__onPacketDownloadProgress = function(data, connection){
                $rootScope.$emit('UploadProgress', connection.peer, data.fileId, data.percent, data.bytesPerSecond);
            }
        }]);
})();