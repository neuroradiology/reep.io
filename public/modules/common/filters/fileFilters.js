/**
 * Created by andre (http://korve.github.io/) on 24.06.2014
 */

(function() {
	'use strict';
	
	angular.module('fileFilters', [])
		.filter('humanFileSize', function() {
			var sizes = ['B', 'kB','MB','GB','TB','PB','EB','ZB','YB'];

			return function(input, decimals) {
				if(angular.isNumber(input) === false)
					return input;

				if(angular.isNumber(decimals) === false)
					decimals = 2;

				if(input <= 1024)
					return input + sizes[0];

				var i = 0;

				do
				{
					input /= 1024;
					i++;
				}
				while(input >= 1024);

				return input.toFixed(decimals) + ' ' + sizes[i];
			};
		});
})();