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