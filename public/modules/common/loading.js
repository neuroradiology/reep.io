(function() {
	'use strict';	
	
	angular.module('common')
		.controller('LoadingCtrl', ['$scope', '$element', function ($scope, $element) {
			$scope.indicator = '...';
			
			var highlight = $element.find('.loading-screen-inner .text-primary');
			
			var step = 0;
			var loadingTimer = setInterval(function() {
				$scope.$apply(function() {
					if(highlight.css('opacity') == 1)
						highlight.css('opacity', .2)
					else
						highlight.css('opacity', 1);							
				});
			}, 500);
			
			$scope.$on('$destroy', function(e) {
				clearInterval(loadingTimer);				
			});
		}]);
})();
	