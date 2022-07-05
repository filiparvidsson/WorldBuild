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
const geometry = new THREE.SphereGeometry(1, 32, 32);
//Create a three.js blue sphere material
const material = new THREE.MeshBasicMaterial({
    //blue color
    color: 0x0000ff
});
//Create a three.js blue sphere mesh
const sphere = new THREE.Mesh(geometry, material);
//Add the sphere mesh to the scene
scene.add(sphere);

//Set camera z-position to 5
camera.position.z = 5;

//Render the scene with a animate function
function animate() {
    
    //Animate the scene
    requestAnimationFrame(animate);

    //Spin the sphere mesh
    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;

    //Render the scene
    renderer.render(scene, camera);
}

animate();

