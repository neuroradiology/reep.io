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