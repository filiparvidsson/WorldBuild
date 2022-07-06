
//Create a three.js scene
const scene = new THREE.Scene();
//Create a three.js camera(field of view, aspect ratio, near clipping plane, far clipping plane)
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//Create a three.js renderer
const renderer = new THREE.WebGLRenderer();
//Set the size of the renderer, use false to render at a lower resolution
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Uniforms for the shader
var start = Date.now();
var customUniforms = {
    delta: { value: 0 },
    height: { value: 0 },

};

//Create a three.js blue sphere geometry with size 1
//The geometry is described by a radius and number of segments
const geometry = new THREE.IcosahedronGeometry(1, 62);
//Create a three.js shadermaterialn for the sphere
var material = new THREE.ShaderMaterial( {
    uniforms: customUniforms,
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent
} );

material.transparent = true;




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

//Controls to be added to the GUI
var controls = {
    height: 0,
    earthRadius: 1,
    moonRadius: 0.5
}


//GUI for the camera connected to sphere
var gui = new dat.GUI();
//Add option to change a value between 0 and 10 in the GUI
var heightControls = gui.addFolder('Controls');
heightControls.add(controls, 'height', 0.0, 10.0).name('Height').listen();

//Render the scene with a animate function
function animate() {
    
    //Animate the scene
    requestAnimationFrame(animate);

    //Spin the sphere mesh
    
    //sphere.rotation.y += 0.01;
    material.uniforms.delta.value = .00025 * Date.now() - start;
    material.uniforms.height.value = controls.height;
    //Render the scene
    renderer.render(scene, camera);
    console.log(material.uniforms.delta.value)
}

animate();

