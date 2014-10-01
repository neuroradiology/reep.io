(function() {
	'use strict';

	angular.module('titleController', ['fileFilters'])
		.controller('TitleController', ['$rootScope', '$element', '$filter', function($rootScope, $element, $filter) {

			var divider = ' | ';

			var client_onIntervalCalculations = function(bytesPerSecond, downloadProgress) {
				var speed = $filter('humanFileSize')(bytesPerSecond);

				$element.html(Math.round(downloadProgress) + '%' + divider + speed + '/s' + divider + 'reep.io');
			};

			$rootScope.$watch('downloadState', function(newValue) {
				if(typeof newValue === 'undefined')
					return;

				if(newValue === 'inprogress')
				{
					// keep user updated on download progress
					$rootScope.client.on('intervalCalculations', client_onIntervalCalculations);
				}
				else
				{
//					$rootScope.client.off('intervalCalculations', client_onIntervalCalculations);
					$element.html('reep.io | peer to peer filesharing and streaming made easy');
				}
			});

		}]);
})();