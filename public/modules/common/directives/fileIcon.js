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

	var mappings = {
		'image/jpeg': 				'fa-file-image-o',
		'image/png': 				'fa-file-image-o',
		'image/gif': 				'fa-file-image-o',
		'image/jpg': 				'fa-file-image-o',
		'image/bmp': 				'fa-file-image-o',
		'image/tiff': 				'fa-file-image-o',

		'application/pdf': 			'fa-file-pdf-o',

		'application/x-zip-compressed': 'fa-file-zip-o',
		'application/x-gzip': 		'fa-file-zip-o',
		'application/x-tar': 		'fa-file-zip-o',

		'application/javascript': 	'fa-file-code-o',
		'text/xml': 				'fa-file-code-o',
		'text/html': 				'fa-file-code-o',
		'text/css': 				'fa-file-code-o',

		'text/plain': 				'fa-file-text-o',
		'text/rtf': 				'fa-file-text-o',

		'application/vnd.oasis.opendocument.text': 'fa-file-word-o',

		'audio/mpeg':				'fa-file-audio-o',

		'video/x-flv':				'fa-file-video-o',
		'video/mpeg':				'fa-file-video-o',
		'video/quicktime':			'fa-file-video-o',
		'video/mp4':				'fa-file-video-o',
		'video/x-msvideo':			'fa-file-video-o',
		'video/x-ms-wmv':			'fa-file-video-o',
		'video/webm':			    'fa-file-video-o',
		'video/avi':			    'fa-file-video-o'
	};
	
	angular.module('fileIcon', [])
		.directive('p2mFileIcon', function () {
			return {
				restrict: 'E',
				scope: {
					fileType: '=',
					'class': '@?class'
				},
				template: '<div class="file-icon {{ class }}"><i class="fa {{ iconType }}"></i></div>',
				link: function (scope, el, attrs) {
					scope['class'] = attrs['class'] || 'file-icon-default';

					scope.$watch('fileType', function (val) {
						if(typeof mappings[val] !== 'undefined')
						{
							scope.iconType = mappings[val];
							return;
						}

						scope.iconType = 'fa-file-o';
					});
				}
			};
		});
})();