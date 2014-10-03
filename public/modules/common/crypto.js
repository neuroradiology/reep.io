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
		.service('$crypto', function() {
			var CryptoService = function() {
				// http://stackoverflow.com/questions/18638900/javascript-crc32
				var makeCRCTable = function(){
				    var c;
				    var crcTable = [];
				    for(var n =0; n < 256; n++){
				        c = n;
				        for(var k =0; k < 8; k++){
				            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
				        }
				        crcTable[n] = c;
				    }
				    return crcTable;
				};

				this.crc32 = function(str) {
				    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
				    var crc = 0 ^ (-1);

				    for (var i = 0; i < str.length; i++ ) {
				        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
				    }

				    return (crc ^ (-1)) >>> 0;
				};
			};
			
			return new CryptoService();
		});
})();