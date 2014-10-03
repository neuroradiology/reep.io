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
		.directive('notifications-modal-dialog', [function () {
			return {
				restrict: 'E',
				template: 	'<div class="modal fade">' +
							'	<div class="modal-dialog">' +
							'		<div class="modal-content">' +
							'			<div class="modal-header">' +
							'				<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
							'				<h4 class="modal-title">Modal title</h4>' +
							'			</div>' +
							'			<div class="modal-body">' +
							'				<p>One fine body&hellip;</p>' +
							'			</div>' +
							'			<div class="modal-footer">' +
							'				<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
							'				<button type="button" class="btn btn-primary">Save changes</button>' +
							'			</div>' +
							'		</div>' +
							'	</div>' +
							'</div>',
				scope: {
					title: '=',					
					message: '='
				},
				link: function (scope, element, attrs) {
				}
			};
		}])
		.service('$dialog', ['$compile', function ($compile) {
			var DialogService = function() {
				
				this.show = function(title, message) {
					var scope = {
						title: title, 
						message: message			
					};
					
					var html = angular.element(document.createElement('notifications-modal-dialog')),
						linkFn = $compile(html),
						element = linkFn(scope);
					
					angular.element(document.body).append(element);
				};
				
				this.hide = function() {
										
				};
				
				this.mute = function() {
					
				};
				
				this.unmute = function() {
					
				};
			};	
			
			return new DialogService();		
		}])
		.run(['$templateCache', function ($templateCache) {
			$templateCache.put('/default-dialog.html', '<div class="modal fade">' + 
				'	{{ title }}' +
				'</div>');
		}]);
})();