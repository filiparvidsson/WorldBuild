
//Create a three.js scene
const scene = new THREE.Scene();
//Create a three.js camera(field of view, aspect ratio, near clipping plane, far clipping plane)
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//Create a three.js renderer
const renderer = new THREE.WebGLRenderer();
//Set the size of the renderer, use false to render at a lower resolution
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Create a three.js blue sphere geometry with size 1
//The geometry is described by a radius and number of segments
const geometry = new THREE.IcosahedronGeometry(1, 62);
//Create a three.js shadermaterialn for the sphere
var material = new THREE.ShaderMaterial( {
    
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent
} );




//Create a three.js blue sphere mesh
const sphere = new THREE.Mesh(geometry, material);
//Add the sphere mesh to the scene
scene.add(sphere);

//Add light to the scene
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 0, 10);
scene.add(light);


//Set camera z-position to 5
camera.position.z = 5;

//Render the scene with a animate function
function animate() {
    
    //Animate the scene
    requestAnimationFrame(animate);

    //Spin the sphere mesh
    
    sphere.rotation.y += 0.01;
    //material.uniforms[ 'time' ].value = .00025 * ( Date.now() - start );
    //Render the scene
    renderer.render(scene, camera);
}

animate();

