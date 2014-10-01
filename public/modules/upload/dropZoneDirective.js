/**
 * Created by andre (http://korve.github.io/) on 14.06.2014
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
                    name: file.name,
                    size: file.size,
                    type: file.type,
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