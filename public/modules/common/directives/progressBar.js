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
	
	angular.module('progressBar', ['fileFilters'])
		.directive('p2mProgressBar', function () {
			return {
				restrict: 'E',
				scope: {
					progress: '=percent', //progress in %
					speed: '=?', //speed in bps
					showProgress: '=?'
				},
				template:
					'<div class="p2m-progress-bar" ng-class="{\'p2m-progress-bar-no-progress\': ! showProgress }">' +
						'<div class="progress"><div class="progress-inner" style="width: {{ progress }}%"></div></div>' +
						'<ul class="progress-meta" ng-show="progress && showProgress">' +
							'<li>{{ progress|number:1 }}%</li>' +
							'<li ng-show="progress > 0 && speed">' +
								'<span ng-show="speed">{{ speed|humanFileSize }}/s</span>' +
							'</li>' +
						'</ul>' +
					'</div>'
			};
		});
})();
