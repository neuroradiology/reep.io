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

	angular.module('upload')
		.directive('p2mDropZone', ['$animate', '$document', function ($animate, $document) {

            var checkIfFolder = function(scope, files, el){
                var length = (files.length < scope.maxFiles) ? files.length : scope.maxFiles;

                for(var i = 0; i < length; i++)
                {
                    var file = files[i];
                    if (file.size > 1048576){
                        addFile(scope, file, el);
                    }else{
                        var reader = new FileReader();
                        reader.onload = function () {
                            addFile(scope, file, el);
                        };
                        reader.onerror = function(){
                            if(scope.files.length > 0)
                                $animate.addClass(el, 'ng-hide');
                        };
                        reader.readAsArrayBuffer(file);
                    }
                }
            }

			var addFile = function (scope, file, el) {
                var file = {
                    rawFile: file,
                    fileId: null,
                    clients: {},
                    totalDownloads:  0,
                    password: ''
                };

                scope.files.unshift(file);

                if(scope.files.length > scope.maxFiles)
                {
                    scope.files.pop();
                }
                $animate.addClass(el, 'ng-hide');
                scope.$apply();
			};

			return {
				restrict: 'A',
				scope: {
					files: '=',
					maxFiles: '=?'
				},
				link: function (scope, el) {

					var $el = angular.element(el);

					scope.maxFiles = scope.maxFiles || 5;

					$document.bind('dragover', function (e) {
						e.stopPropagation();
						e.preventDefault();
						
						$animate.removeClass(el, 'ng-hide');
					});

					$document.bind('dragleave', function (e) {
						e.stopPropagation();
						e.preventDefault();
						
                        if(scope.files.length > 0)
						    $animate.addClass(el, 'ng-hide');
					});

					$el.after('<input type="file" style="display: none" multiple>');

					$el.next().on('change', function () {
                        checkIfFolder(scope, this.files);
					});

					$el.on('click', function () {
						$el.next().trigger('click');
					});

					return $document.bind('drop', function (e) {
						e.stopPropagation();
						e.preventDefault();
						
					    $animate.addClass(el, 'ng-hide');
						
						var files = e.originalEvent.dataTransfer.files || [];
                        checkIfFolder(scope, files, el);

						e.preventDefault();
						return false;
					});
				}
			};
		}]);
})();