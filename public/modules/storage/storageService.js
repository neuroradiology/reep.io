(function() {
    'use strict';

    angular.module('storage')
        .service('storageService', ['$crypto', '$q', function ($crypto, $q) {
            this.files = {};

            this.isFileSystemAvailable = function(){
                window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

                if(window.requestFileSystem !== undefined){
                    if(navigator.webkitTemporaryStorage !== undefined && navigator.webkitPersistentStorage !== undefined){
                        return true;
                    }
                }

                return false;
            }

            this.checkIfFileExits = function(fileName, fileSize){
                var deferred = $q.defer();

                if(!this.isFileSystemAvailable()){
                    deferred.reject();
                    return deferred.promise;
                }

                var fileIdentifier = $crypto.crc32(fileName + fileSize);

                if(this.files[fileIdentifier] === undefined){
                    this.initilizeFileObject(fileIdentifier);
                }

                this.findFileInTemporaryStorage(fileIdentifier, fileName, fileSize).then(
                    function(data){
                        this.files[fileIdentifier].sizeOfExistingFileTemp = data.metaData.size;
                        this.files[fileIdentifier].fileSystemUrl = data.fileEntry.toURL('application/unknown');
                        deferred.resolve(data.metaData);
                    }.bind(this),
                    function(){
                        this.findFileInPersitentStorage(fileIdentifier, fileName, fileSize).then(
                            function(data){
                                this.files[fileIdentifier].sizeOfExistingFilePersitent = data.metaData.size;
                                this.files[fileIdentifier].fileSystemUrl = data.fileEntry.toURL('application/unknown');
                                deferred.resolve(data.metaData);
                            }.bind(this),
                            function(){
                                deferred.reject();
                            }
                        );
                    }.bind(this)
                );

                return deferred.promise;
            }

            this.findFileInTemporaryStorage = function(fileIdentifier, fileName, fileSize){
                var deferred = $q.defer();

                this.requestTemporaryStorageFileSystem(fileSize).then(
                    function(fileSystem){
                        this.getFile(fileSystem, fileIdentifier + '/' + fileName, {create: false}).then(
                            function(fileEntry){
                                fileEntry.getMetadata(
                                    function(metaData){
                                        deferred.resolve({metaData:metaData, fileEntry:fileEntry});
                                    },
                                    function(){
                                        deferred.reject();
                                    }
                                );
                            },
                            function(){
                                deferred.reject();
                            }
                        );
                    }.bind(this),
                    function(){
                        deferred.reject();
                    }
                );

                return deferred.promise;
            }

            this.findFileInPersitentStorage = function(fileIdentifier, fileName, fileSize){
                var deferred = $q.defer();

                this.getFreePersistentStorageSpace().then(
                    function(left){
                        if(left > 0){
                            this.requestPersistentStorageFileSystem(fileSize).then(
                                function(fileSystem){
                                    this.getFile(fileSystem, fileIdentifier + '/' + fileName, {create: false}).then(
                                        function(fileEntry){
                                            fileEntry.getMetadata(
                                                function(metadata){
                                                    deferred.resolve({metaData:metaData, fileEntry:fileEntry});
                                                },
                                                function(){
                                                    deferred.reject();
                                                }
                                            );
                                        },
                                        function(){
                                            deferred.reject();
                                        }
                                    );
                                }.bind(this),
                                function(){
                                    deferred.reject();
                                }
                            );
                        }else{
                            deferred.reject();
                        }
                    }.bind(this),
                    function(){
                        deferred.reject();
                    }
                );

                return deferred.promise;
            }

            this.initilizeFileObject = function(fileIdentifier){
                this.files[fileIdentifier] = {};
                this.files[fileIdentifier].blockBuffer = [];
                this.files[fileIdentifier].sizeOfExistingFileTemp = 0;
                this.files[fileIdentifier].sizeOfExistingFilePersitent = 0;
            }

            this.getStorageForFile = function(fileName, fileSize){
                var deferred  = $q.defer();

                //This is not the best way to identify a file, but to generate a md5 hash on the uploader site is in my opinion overkill.
                var fileIdentifier = $crypto.crc32(fileName + fileSize);

                if(this.files[fileIdentifier] === undefined){
                    this.initilizeFileObject(fileIdentifier);
                }

                if(!this.isFileSystemAvailable()){
                    deferred.resolve(fileIdentifier);
                    return deferred.promise;
                }

                this.requestTemporaryStorage(fileIdentifier, fileName, fileSize).then(
                    function(){
                        deferred.resolve(fileIdentifier);
                    },
                    function(){
                        this.requestPersistentStorage(fileIdentifier, fileName, fileSize).then(
                            function(){
                                deferred.resolve(fileIdentifier);
                            },
                            function(){
                                if(this.files[fileIdentifier].fileWriter !== undefined){
                                    delete this.files[fileIdentifier].fileWriter;
                                }

                                deferred.reject(fileIdentifier);
                            }.bind(this)
                        );
                    }.bind(this)
                );

                return deferred.promise;
            }

            /**
             * Temp Storage
             */
            this.requestTemporaryStorage = function(fileIdentifier, fileName, fileSize){
                var deferred = $q.defer();

                this.requestTemporaryStorageFileSystem(fileSize).then(
                    function(fileSystem){
                        this.cleanUpFilesystem(fileSystem, fileIdentifier).then(
                            function(){
                                this.getFreeTemporaryStorageSpace().then(
                                    function(left){
                                        if(((fileSize-this.files[fileIdentifier].sizeOfExistingFileTemp)+100) <= left){
                                            this.initializeFiles(fileSystem, fileIdentifier, fileName).then(
                                                function(){
                                                    deferred.resolve();
                                                },
                                                function(){
                                                    deferred.reject();
                                                }
                                            );
                                        }else{
                                            deferred.reject()
                                        }
                                    }.bind(this),
                                    function(){
                                        deferred.reject();
                                    }
                                );
                            }.bind(this)
                        );
                    }.bind(this),
                    function(){
                        deferred.reject();
                    }
                );

                return deferred.promise;
            }

            this.requestTemporaryStorageFileSystem = function(fileSize){
                var deferred  = $q.defer();

                window.requestFileSystem(
                    window.TEMPORARY,
                    fileSize+100,
                    function(fileSystem){
                        deferred.resolve(fileSystem);
                    }.bind(this),
                    function(){
                        deferred.reject();
                    }
                )

                return deferred.promise;
            }

            this.getFreeTemporaryStorageSpace = function(){
                var deferred  = $q.defer();

                navigator.webkitTemporaryStorage.queryUsageAndQuota(
                    function(usage, total) {
                        var left = total-usage;

                        deferred.resolve(left);
                    },
                    function(){
                        deferred.reject();
                    }
                );

                return deferred.promise;
            }

            /**
             * Persisten Storage
             */
            this.requestPersistentStorage = function(fileIdentifier, fileName, fileSize){
                var deferred  = $q.defer();

                this.getFreePersistentStorageSpace().then(
                    function(left){
                        if(((fileSize-this.files[fileIdentifier].sizeOfExistingFilePersitent)+100) <= left){
                            //dont need requestquota
                            this.requestPersistentStorageFileSystem(fileSize).then(
                                function(fileSystem){
                                    this.cleanUpFilesystem(fileSystem, fileIdentifier).then(
                                        function(){
                                            this.initializeFiles(fileSystem, fileIdentifier, fileName).then(
                                                function(){
                                                    deferred.resolve();
                                                },
                                                function(){
                                                    deferred.reject();
                                                }
                                            );
                                        }.bind(this)
                                    );
                                }.bind(this),
                                function(){
                                    deferred.reject();
                                }
                            );
                        }else{
                            this.requestPersistentStorageQuota().then(
                                function(){
                                    this.requestPersistentStorageFileSystem(fileSize).then(
                                        function(fileSystem){
                                            this.cleanUpFilesystem(fileSystem, fileIdentifier).then(
                                                function(){
                                                    this.getFreePersistentStorageSpace().then(
                                                        function(left){
                                                            if(((fileSize-this.files[fileIdentifier].sizeOfExistingFilePersitent)+100) <= left){
                                                                this.initializeFiles(fileSystem, fileIdentifier, fileName).then(
                                                                    function(){
                                                                        deferred.resolve();
                                                                    },
                                                                    function(){
                                                                        deferred.reject();
                                                                    }
                                                                );
                                                            }else{
                                                                deferred.reject();
                                                            }
                                                        }.bind(this),
                                                        function(){
                                                            deferred.reject();
                                                        }
                                                    );
                                                }.bind(this)
                                            );
                                        }.bind(this),
                                        function(){
                                            deferred.reject();
                                        }
                                    );
                                }.bind(this),
                                function(){
                                    deferred.reject();
                                }
                            );
                        }
                    }.bind(this),
                    function(){
                        deferred.reject();
                    }
                );

                return deferred.promise;
            }

            this.getFreePersistentStorageSpace = function(){
                var deferred  = $q.defer();

                navigator.webkitPersistentStorage.queryUsageAndQuota(
                    function(usage, total){
                        var left = total-usage;

                        deferred.resolve(left);
                    },
                    function(){
                        deferred.reject();
                    }
                );

                return deferred.promise;
            }

            this.requestPersistentStorageQuota = function(){
                var deferred  = $q.defer();

                navigator.webkitPersistentStorage.requestQuota(
                    1024*1024*1024*100,
                    function (bytesGranted) {
                        deferred.resolve(bytesGranted);
                    },
                    function(){
                        deferred.reject();
                    }
                );

                return deferred.promise;
            }

            this.requestPersistentStorageFileSystem = function(fileSize){
                var deferred  = $q.defer();

                window.requestFileSystem(
                    window.PERSISTENT,
                    fileSize+100,
                    function(fileSystem){
                        deferred.resolve(fileSystem);
                    }.bind(this),
                    function(){
                        deferred.reject();
                    }
                )

                return deferred.promise;
            }

            this.initializeFiles = function(fileSystem, fileIdentifier, fileName){
                var deferred  = $q.defer();

                this.createFolder(fileSystem, fileIdentifier).then(
                    function(){
                        this.getFile(fileSystem, fileIdentifier + '/lockfile', {create: true}).then(
                            function(lockFileEntry){
                                this.getFileWriter(lockFileEntry).then(
                                    function(lockFileWriter){
                                        lockFileWriter.truncate(0);

                                        this.files[fileIdentifier].lockFileInterval = setInterval(
                                            function(){
                                                lockFileWriter.truncate(0);
                                            },
                                            5000
                                        );

                                        this.getFile(fileSystem, fileIdentifier + '/' + fileName, {create: true}).then(
                                            function(downloadFileEntry){
                                                this.getFileWriter(downloadFileEntry).then(
                                                    function(downloadFileWriter){
                                                        downloadFileWriter.seek(downloadFileWriter.length);
                                                        this.files[fileIdentifier].fileWriter = downloadFileWriter;
                                                        this.files[fileIdentifier].fileSystemUrl = downloadFileEntry.toURL('application/unknown');
                                                        this.files[fileIdentifier].fileWriterInterval = setInterval(function(){
                                                            if(this.files[fileIdentifier].fileWriter.readyState == 1){
                                                                //Wait until next interval;
                                                                return;
                                                            }

                                                            try{
                                                                if(this.files[fileIdentifier].blockBuffer.length > 0){
                                                                    this.files[fileIdentifier].fileWriter.write(new Blob(this.files[fileIdentifier].blockBuffer));

                                                                    delete this.files[fileIdentifier].blockBuffer;
                                                                    this.files[fileIdentifier].blockBuffer = [];
                                                                }
                                                            }
                                                            catch (e){
                                                                //at this point we need to SHUT DOWN EVERYTHING
                                                                console.log(e);
                                                            }
                                                        }.bind(this), 3000);

                                                        deferred.resolve();
                                                    }.bind(this),
                                                    function(){
                                                        deferred.reject();
                                                    }
                                                );
                                            }.bind(this),
                                            function(){
                                                deferred.reject();
                                            }
                                        );
                                    }.bind(this),
                                    function(){
                                        deferred.reject();
                                    }
                                );
                            }.bind(this),
                            function(){
                                deferred.reject();
                            }
                        );
                    }.bind(this),
                    function(){
                        deferred.reject();
                    }
                );

                return deferred.promise;
            }

            this.createFolder = function(fileSystem, fileIdentifier){
                var deferred  = $q.defer();

                fileSystem.root.getDirectory(fileIdentifier, {create: true},
                    function(dirEntry) {
                        deferred.resolve();
                    },function(e){
                        deferred.reject();
                    }
                );

                return deferred.promise;
            }

            this.getFile = function(fileSystem, file, opts){
                var deferred  = $q.defer();

                fileSystem.root.getFile(
                    file,
                    opts,
                    function(fileEntry){
                        deferred.resolve(fileEntry);
                    },
                    function(){
                        deferred.reject();
                    }
                );

                return deferred.promise;
            }

            this.getFileWriter = function(fileEntry){
                var deferred  = $q.defer();

                fileEntry.createWriter(
                    function(fileWriter){
                        deferred.resolve(fileWriter);
                    },
                    function(){
                        deferred.reject();
                    }
                );

                return deferred.promise;
            }

            this.cleanUpFilesystem = function(fileSystem, fileIdentifier){
                var deferred  = $q.defer();

                var dirReader = fileSystem.root.createReader();

                dirReader.readEntries (
                    function(entries) {
                        if(entries.length > 0){
                            this.deleteEntries(entries, 0, fileSystem, fileIdentifier).then(
                                function(){
                                    deferred.resolve();
                                }
                            );
                        }else{
                            deferred.resolve();
                        }
                    }.bind(this),
                    function(){
                        deferred.resolve();
                    }
                );

                return deferred.promise;
            }

            this.deleteEntries = function(entries, index, fileSystem, fileIdentifier){
                var deferred  = $q.defer();

                if(index >= entries.length){
                    deferred.resolve();
                    return deferred.promise;
                }

                //To make this synchronous we need to go to the bottom first
                var nextIndex = index+1;
                this.deleteEntries(entries, nextIndex, fileSystem, fileIdentifier).then(
                    function(){
                        var entry = entries[index];

                        if(entry.isDirectory == true){
                            if(entry.name == fileIdentifier){
                                deferred.resolve();
                                return;
                            }

                            fileSystem.root.getFile(
                                entry.name + '/lockfile',
                                {
                                    create: false
                                },
                                function(fileEntry){
                                    fileEntry.getMetadata(
                                        function(metadata){
                                            if(metadata.modificationTime.getTime()+7000 < new Date().getTime()){
                                                entry.removeRecursively(
                                                    function(){
                                                        deferred.resolve();
                                                    },
                                                    function(){
                                                        deferred.resolve();
                                                    }
                                                );
                                            }else{
                                                deferred.resolve();
                                            }
                                        },
                                        function(){
                                            deferred.resolve();
                                        }
                                    );
                                },
                                function(e){
                                    entry.removeRecursively(
                                        function(){
                                            deferred.resolve();
                                        },
                                        function(){
                                            deferred.resolve();
                                        }
                                    );
                                }
                            );
                        }else{
                            deferred.resolve();
                        }
                    }
                );


                return deferred.promise;
            }

            this.addChunkToFileBuffer = function(fileIdentifier, chunk){
                this.files[fileIdentifier].blockBuffer.push(chunk);
            }

            this.getUrlForFinishedDownload = function(fileIdentifier){
                var deferred  = $q.defer();

                if(this.files[fileIdentifier].fileWriter === undefined){
                    if(this.files[fileIdentifier].fileSystemUrl !== undefined){
                        deferred.resolve(this.files[fileIdentifier].fileSystemUrl);
                        return deferred.promise;
                    }

                    deferred.resolve(URL.createObjectURL(new Blob(this.files[fileIdentifier].blockBuffer)));
                    return deferred.promise;
                }

                clearInterval(this.files[fileIdentifier].fileWriterInterval);

                if(this.files[fileIdentifier].blockBuffer.length > 0){
                    this.files[fileIdentifier].fileWriter.onwriteend = function(){
                        deferred.resolve(this.files[fileIdentifier].fileSystemUrl);
                    }.bind(this);

                    this.files[fileIdentifier].fileWriter.write(new Blob(this.files[fileIdentifier].blockBuffer));

                    delete this.files[fileIdentifier].blockBuffer;
                    this.files[fileIdentifier].blockBuffer = [];
                }else{
                    deferred.resolve(this.files[fileIdentifier].fileSystemUrl);
                }

                return deferred.promise;
            }

            this.generateFileIdentifier = function(fileName, fileSize){
                return $crypto.crc32(fileName + fileSize);
            }
        }]);
})();