/**
 * Created by andre (http://korve.github.io/) on 24.06.2014
 */

(function() {
	'use strict';
	
	angular.module('stringFilters', [])
		.filter('maxLength', function () {

			return function(input, length){

				if( ! input)
					return '';

				if( ! angular.isString(input))
					input = input.toString();

				length = length || 10;

				return input.length > length ? input.substr(0, length) + '...' : input;
			};
		});
})();