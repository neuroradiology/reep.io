/**
 * Created by andre (http://korve.github.io/) on 03.07.2014
 */


(function() {
	'use strict';
	angular.module('reepIoLogoModule', [])
		.directive('reepIoLogo', function () {
			return {
				restrict: 'E',
				scope: {
					width: '=?',
					height: '=?'			
				},
				link: function ($scope, el) {

					var container;

					var camera, scene, renderer;

					var cube;

					var width = $scope.width || 150,
						height = $scope.height || 75;

					var targetRotation = 90 * Math.PI / 180,
						targetAxis = 'x';

					init();
					animate();

					function init() {

						container = document.createElement( 'div' );
						$(el).append( container );

						camera = new THREE.PerspectiveCamera( 20, width / height, 1, 1000 );
						camera.position.y = 150;
						camera.position.z = 220;

						scene = new THREE.Scene();

						var boxSize = 20;
						var geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

						var color = 0xbd2222;
						for ( var i = 0; i < geometry.faces.length; i += 2 ) {
							geometry.faces[ i ].color.setHex( color );
							geometry.faces[ i + 1 ].color.setHex( color );
						}

						var material = new THREE.MeshLambertMaterial({
							vertexColors: THREE.FaceColors,
							overdraw: 0.15
						});

						cube = new THREE.Mesh(geometry, material);
						cube.position.y = 150;
						cube.rotation.y = 45 * Math.PI / 180;
						cube.rotation.x = 45 * Math.PI / 180;

						scene.add(cube);

						var light = new THREE.DirectionalLight(0xffffff, 2);
						light.position.set(0, 2, 2);
						light.target.position.set(0, 0, 0);

						scene.add( light );

						renderer = new THREE.CanvasRenderer();
						renderer.setClearColor( 0xffffff );
						renderer.setSize( width, height );

						container.appendChild( renderer.domElement );

					}

					function animate() {
						requestAnimationFrame(animate);
						render();
					}

					function render() {

						if(targetRotation <= 0)
						{
							if(targetAxis == 'x')
								targetAxis = 'y';
							else if(targetAxis == 'y')
								targetAxis = 'z';
							else
								targetAxis = 'x';

							targetRotation = 45 * Math.PI / 180;
						}
						else
						{
							cube.rotation[targetAxis] += 0.003;
							targetRotation -= 0.003;
						}

						renderer.render( scene, camera );

					}
				}
			};
		});
})();