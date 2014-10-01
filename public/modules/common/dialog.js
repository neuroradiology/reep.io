(function() {
	'use strict';

	angular.module('common')
		.controller('DialogController', ['$scope', '$element', '$rootScope', function($scope, $element, $rootScope){
			$rootScope.muteDialogs = false;

			$rootScope.$on('error', function(err, title, message) {
				$scope.title = title;
				$scope.message = message;

				$scope.visible = true;
			});
			
			$rootScope.showDialog = function(title, message) {
				$scope.title = title;
				$scope.message = message;

				$scope.visible = true;				
			};

			$scope.$watch('visible', function(newValue) {
				if(typeof newValue === 'undefined')
					return;

				if($rootScope.muteDialogs === true)
					return;

				$element.modal({
					show: newValue
				});
			});

			$rootScope.$watch('muteDialogs', function(newValue) {
				if(typeof newValue === 'undefined')
					return;

				if(newValue === true)
				{
					$element.modal({
						show: false
					});
				}
			});
		}]);
})();