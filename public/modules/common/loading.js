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
	