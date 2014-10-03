/**
 * Copyright (C) 2014 reep.io 
 * KodeKraftwerk (https://github.com/KodeKraftwerk/)
 *
 * reep.io source - In-browser peer-to-peer file transfer and streaming 
 * made easy
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
(function() {
    'use strict';

    angular.module('download')
        .controller('DownloadCtrl', ['$scope', '$rootScope', '$route', '$timeout', '$location', '$analytics', '$crypto', 'config', 'downloadService', 'detectCrawlerService',
            function ($scope, $rootScope, $route, $timeout, $location, $analytics, $crypto, config, downloadService, detectCrawlerService) {

                if($rootScope.downloadId === undefined){
                    $rootScope.downloadId = $route.current.params.id;
                    $rootScope.cryptoDownloadId = $crypto.crc32($route.current.params.id);
                    $rootScope.downloadService = downloadService;
                }

                // dismiss key
                $analytics.pageTrack('/d/' + $rootScope.cryptoDownloadId);

                if(!detectCrawlerService.isCrawler(navigator.userAgent) && !util.supports.data)
                {
                    $location.path('incompatible');
                    return;
                }

//                $scope.isStreamAble = false;
//                $scope.isStreamingRunning = false;
//                $scope.isImage = false;

                if(downloadService.id === null && $rootScope.downloadId.length == (config.peerIdLength + config.fileIdLength)){
                        downloadService.requestFileInformation($rootScope.downloadId);
                }

                $scope.downloadFile = function(){
//                    $scope.isStreamingRunning = false;

                    downloadService.startDownload();

                    $analytics.eventTrack('startDownload', {  category: 'download', label: $rootScope.cryptoDownloadId, value: Math.round(downloadService.file.size/1024) });
                };

                $scope.getIsDownloadVisible = function () {
                    return ! $scope.downloadError && ['ready', 'inprogress', 'paused', 'finished', 'datachannelClosed'].indexOf($rootScope.downloadService.downloadState) !== -1;
                };

                $scope.saveFile = function(){
                    $timeout(function(){
                        $('#download-frame').get(0).click();
                    });
                };

                $scope.doAuthentication = function(){
                    downloadService.doAuthentication($scope.password);
                }

                $rootScope.$on('FileInformation', function(event, data) {
                    $timeout(function(){
                        $scope.$apply();
                    });
                });

                $rootScope.$on('DownloadFinished', function (event) {
                    $timeout(function(){
                        $scope.$apply(function(){});

                        if($scope.isImage){

                        }else{
                            if($('#download-frame').length > 0){
                                $('#download-frame').get(0).click();
                            }
                        }
                    });

                    $analytics.eventTrack('downloadFinished', { category: 'download', label: $scope.cryptoDownloadId });
                });

                $rootScope.$on('intervalCalculations', function(event){
                    $timeout(function(){
                        $scope.$apply();
                    });
                });

                $rootScope.$on('AuthenticationRequest', function(event){
                    $timeout(function(){
                        $scope.$apply();
                    });
                });

                $rootScope.$on('IncorrectPassword', function(event) {
                    $timeout(function(){
                        $scope.$apply(function() {
                            $scope.authenticationError = 'Invalid credentials. Please enter the correct password';
                        });
                    });
                });

                $rootScope.$on('DownloadDataChannelClose', function() {
                    if($rootScope.downloadService.downloadState != 'finished' && $scope.isStreamingRunning === false){
                        $timeout(function(){
                            $scope.$apply(function () {
                                $scope.downloadError = 'The uploader has closed the connection';
                                $scope.downloadErrorDescription = 'You cannot download this file anymore because the connection to the uploader is closed.';

                            });
                        });
                    }
                });

                $rootScope.$on('NoFileSystem', function(){
                    $timeout(function(){
                        $scope.$apply();
                    });
                });

//                $rootScope.client.addListener('packetFileReadyForDownload', function(data){
//                    $rootScope.$apply(function () {
//                        $rootScope.file = {
//                            name: data.fileName,
//                            size: data.fileSize,
//                            type: data.fileType
//                        };
//
//                        $rootScope.downloadService.downloadState = 'ready';
//
//                        if(data.fileType == 'image/jpeg' || data.fileType == 'image/gif' || data.fileType == 'image/png'){
//                            $rootScope.isImage = true;
//                            $rootScope.isStreamingRunning = false;
//                            $rootScope.client.startDownload();
//                            $rootScope.downloadService.downloadState = 'inprogress';
//                        }else{
//                            $rootScope.isStreamAble = $rootScope.client.isStreamAble(data.fileType);
//                        }
//                    });
//                });
//
//                $rootScope.client.addListener('errorPlayingStream', function(){
//                    $rootScope.$apply(function () {
//                        $rootScope.isStreamAble = false;
//                        $rootScope.isStreamingRunning = false;
//                        $rootScope.downloadService.downloadState = 'ready';
//
//                        $rootScope.$emit('error', 'Could not Play video', 'Your browser could not play the video file. Please download it.');
//                    });
//                });
//
//                $rootScope.client.addListener('connectionError', function(err) {
//                    $rootScope.$apply(function () {
//                        if($rootScope.downloadService.downloadState !== 'ready' && $rootScope.isStreamingRunning === false)
//                        {
//                            $rootScope.downloadError = 'Could not connect to peer.';
//                            $rootScope.downloadErrorDescription = 'The peer you have tried to connect to does not respond.';
//
////						$rootScope.$emit('error', $rootScope.downloadError, $rootScope.downloadErrorDescription);
//                            return;
//                        }
//
//                        switch(err.type)
//                        {
//                            case 'socket-closed':
//                                $rootScope.downloadError = 'Connection closed by peer.';
//                                $rootScope.downloadErrorDescription = 'Your peer has closed the connection.';
//
////							$rootScope.$emit('error', $rootScope.downloadError, $rootScope.downloadErrorDescription);
//                                return;
//                        }
//
//                        $rootScope.$emit('error', $rootScope.downloadError, $rootScope.downloadErrorDescription);
//                    });
//                });
//
//
//                $scope.startStream = function(){
//                    client.startStream();
//                    $rootScope.isStreamingRunning = true;
//                    $rootScope.downloadService.downloadState = 'inprogress';
//                    $analytics.eventTrack('startStream', {  category: 'download', label: $rootScope.cryptoDownloadId, value: Math.round(client.fileSize/1024) });
//                };
            }]);
})();