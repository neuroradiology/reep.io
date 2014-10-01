(function() {
    'use strict';

    angular.module('upload')
        .controller('UploadCtrl', ['$scope', '$location', '$timeout', '$document', '$analytics', '$modal', 'uploadService', '$rootScope', 'detectCrawlerService',
            function ($scope, $location, $timeout, $document, $analytics, $modal, uploadService, $rootScope, detectCrawlerService) {
                $analytics.pageTrack($location.path());

                //Show the incompatible site only to real users
                if(!detectCrawlerService.isCrawler(navigator.userAgent) && !util.supports.data)
                {
                    $location.path('incompatible');
                    return;
                }

                if($rootScope.fileModel === undefined){
                    $rootScope.fileModel = {};
                    $rootScope.fileModel.files = [];
                }

                var $initializing = true;

                $scope.$watchCollection('fileModel.files', function (newValue) {
                    // wait for next digest cycle 
                    if($initializing)
                    {
                        $timeout(function() {
                            $initializing = false;
                        });
                        return;
                    }

                    var file = newValue[0];

                    uploadService.registerFile(file.rawFile).then(function(id){
                        file.fileId = id.fileId;
                        file.uniqueUrl = window.location.protocol + '//' + location.hostname + '/d/' + id.peerId + id.fileId;
                    });
                });

                $rootScope.$on('UploadStart', function(event, peerId, fileId){
                    $scope.$apply(function () {
                        for (var i = 0; i < $scope.fileModel.files.length; ++i) {
                            if($scope.fileModel.files[i].fileId == fileId){
                                $scope.fileModel.files[i].clients[peerId] = {
                                    progress: 0,
                                    speed: 0
                                };

                                break;
                            }
                        }
                    });
                });

                $rootScope.$on('UploadProgress', function (event, peerId, fileId, percent, bytesPerSecond) {
                    $scope.$apply(function(){
                        for (var i = 0; i < $scope.fileModel.files.length; ++i) {
                            if($scope.fileModel.files[i].fileId == fileId && $scope.fileModel.files[i].clients[peerId] !== undefined){
                                $scope.fileModel.files[i].clients[peerId].progress = percent;
                                $scope.fileModel.files[i].clients[peerId].speed = bytesPerSecond;

                                break;
                            }
                        }
                    });
                });

                $rootScope.$on('UploadFinished', function (event, peerId, fileId) {
                    $scope.$apply(function(){
                        for (var i = 0; i < $scope.fileModel.files.length; ++i) {
                            if($scope.fileModel.files[i].fileId == fileId){
                                delete $scope.fileModel.files[i].clients[peerId];
                                $scope.fileModel.files[i].totalDownloads++;

                                break;
                            }
                        }
                    });
                });

                $rootScope.$on('dataChannelClose', function(event, peerId, fileId){
                    $scope.$apply(function () {
                        for (var i = 0; i < $rootScope.fileModel.files.length; ++i) {
                            if($rootScope.fileModel.files[i].fileId == fileId){
                                delete $rootScope.fileModel.files[i].clients[peerId];
                            }

                            break;
                        }
                    });
                });

                $scope.getIsFileDropped = function(){
                    return $rootScope.fileModel.files.length > 0;
                };

                $scope.addFile = function () {
                    $('#drop-box').next().trigger('click');
                };

                $scope.removeFile = function (id) {
                    for(var i = 0; i < $rootScope.fileModel.files.length; i++)
                    {
                        if($rootScope.fileModel.files[i].uniqueUrl === id)
                        {
                            $rootScope.fileModel.files.splice(i, 1);
                            break;
                        }
                    }
                };

                $scope.lockFile = function(file) {
                    $scope.modalDialogFile = file;

                    var modalInstance = $modal.open({
                        templateUrl: 'modules/upload/modals/password.html',
                        controller: ['$scope', function($scope, password) {
                            $scope.input = {};
                            $scope.input.password = file.password;

                            $scope.ok = function() {
                                $scope.$close($scope.input.password);
                            };

                            $scope.close = function() {
                                $scope.$dismiss('cancel');
                            };
                        }]
                    });

                    modalInstance.result.then(function (password) {
                        uploadService.setPasswordForFile(file.fileId, password);
                        file.password = password;
                    });
                };

                var paste = $.paste().appendTo($('body').get(0));

                paste.on('pasteImage', function (e, data){
                    $scope.$apply(function() {
                        //data:image/png;base64,....
                        var byteString = atob(data.dataURL.split(',')[1]);

                        // separate out the mime component
                        var mimeString = data.dataURL.split(',')[0].split(':')[1].split(';')[0];

                        if(byteString === null || byteString.length <= 0 || mimeString === null || mimeString.length <= 0)
                            return;

                        var ab = new ArrayBuffer(byteString.length);
                        var ia = new Uint8Array(ab);
                        for(var i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                        }

                        var fileType = 'png';

                        if(mimeString == 'image/jpeg' || mimeString == 'image/pjpeg'){
                            fileType = 'jpg';
                        }

                        $rootScope.fileModel.files.unshift({
                            name: 'Clipbboard Image ' + new Date() + '.' + fileType,
                            size: byteString.length,
                            type: mimeString,
                            blobData: new Blob([ab], {type: mimeString})
                        });

                        delete data.dataURL;
                    });
                });
                paste.focus();

                $('body').get(0).onpaste = function(e) {
                    paste.focus();
                };

                $scope.$on('$destroy', function(e) {
                    paste.remove();
                });
            }]);
})();