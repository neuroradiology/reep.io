(function() {
	'use strict';	
	
	angular.module('static')
		.directive('reepioSlidingFile', ['$document', function ($document) {
			return {
				restrict: 'E',
				template: 	'<div class="sliding-file" ng-class="{ \'is-sliding\': scrollTop > .05 && scrollTop < 0.95, \'is-static\': scrollTop >= 1 }">' +
								'<i class="fa fa-file"></i>' +
							'</div>',
				scope: {
					scrollMax: '=?'					
				},
				link: function (scope, iElement, iAttrs) {
					var el = angular.element(iElement);
					
					scope.isSliding = false;
					scope.scrollMax = scope.scrollMax || 100;
					
					$document.on('scroll', function(e) {
						scope.$apply(function() {
							scope.scrollTop = $document.scrollTop() / scope.scrollMax;
						});
					});
				}
			};
		}])	
})();