/**
 * Created by andre (http://korve.github.io/) on 25.06.2014
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
