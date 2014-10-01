(function() {
	'use strict';	
	
	angular.module('download')
		.directive('reepioLoadingIndicator', [function () {
			return {
				restrict: 'A',
				link: function (scope, iElement, iAttrs) {
					
					var message = iAttrs.reepioLoadingIndicatorMessage || "Loading...";
					
					var el = angular.element(iElement);
					el.before('<div class="loading-indicator {{ className }}"><p><i class="fa fa-spin fa-gear"></i><br> ' + message + '</p></div>');
					
					el.on('load', function(e) {
						el.prev().remove();						
					});
				}
			};
		}])
})();