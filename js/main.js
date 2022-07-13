// SHADERS

// Earth
function earthVertexShader() {
    return `
    
    ${classic3DNoise()}
    ${classicPerlinNoise()}
    
    //////////////////////////////////////////////////////////////////////////////////////////////
    
    varying vec2 vUv;
    varying float noise;	
    uniform float delta;
    uniform float height;
    uniform float radius;
    uniform float numberOfOctaves;
    uniform float waterLevel;	

    varying float heightDisplacement;

    
                float turbulence( vec3 p ) {
    
                 
                    float t = .0;
                  
                    for (float f = 1.0 ; f <= numberOfOctaves ; f++ ){
                      float power = pow( 2.0, f );
                      t +=  cnoise( vec3( power * p) ) / power ;
                    }
    
                    if(t < waterLevel) {
                        t = 0.0;
                    }
                  
                    return t;
                  
                  }
    
                  
                  void main() {
                  
                    vUv = uv;
                  
                    // get a turbulent 3d noise using the normal, normal to high freq
    
                    noise = turbulence( normal );
                    
                    // get a 3d noise using the position, low frequency
                    //float b = 5.0 * pnoise( 0.05 * position, vec3( 100.0 ) );
                    
                    float displacement = height * noise;

                    heightDisplacement = displacement;
                  
                    // move the position along the normal and transform it
                    vec3 newPosition = position * radius + normal * displacement;
    
                    //Rotation
                    vec3 p = newPosition.xyz;
                    float new_x = p.x*cos(delta) - p.y*sin(delta);
                    float new_y = p.y*cos(delta) + p.x*sin(delta);
    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( new_x, new_y, p.z, 1.0 );
                  
                  }`;
}

function earthFragmentShader() {

    return `varying vec2 vUv;
    varying float noise;
    varying float heightDisplacement;
    uniform float delta;
    

    float random( vec3 scale, float seed ){
        return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) ;
    }

    void main() {

    float r = .1 * random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );

    // compose the colour using the UV coordinate
    // and modulate it with the noise like ambient occlusion
    //vec2 tPos = vec2( 0, -110.3 * noise + r );
    vec4 color = vec4( noise * 10.0 , 1.0, 1.0, 1.0);

    // set the output colour to the composed colour
    // Palette from: https://www.schemecolor.com/earth-planet-colors.php
    float colorDispConstant = 0.5;
    float colorDisplacement = r * colorDispConstant;
   
    if(heightDisplacement == 0.0) {
        color = vec4(0.235, 0.259, 0.345, 1.0);
    }
    else if(heightDisplacement > 0.0 && heightDisplacement <= 0.05) {
        color = vec4(0.231, 0.365, 0.219, 1.0);
    }
    else {
        color = vec4(0.572, 0.494, 0.467, 1.0);
    }

    gl_FragColor = vec4( color.rgb, 1.0 );
    gl_FragColor.a = 1.0;

    }`;

}

// Earth
function cloudVertexShader() {
    return `
    
    ${classic3DNoise()}
    ${classicPerlinNoise()}
    
    //////////////////////////////////////////////////////////////////////////////////////////////
    
    varying vec2 vUv;
    varying float noise;	
    uniform float delta;
    float height = 0.2;
    uniform float radius;
    uniform float numberOfOctaves;
    uniform float waterLevel;	

    varying float heightDisplacement;

    
                float turbulence( vec3 p ) {
    
                 
                    float t = .0;
                  
                    for (float f = 1.0 ; f <= numberOfOctaves ; f++ ){
                      float power = pow( 2.0, f );
                      t +=  cnoise( vec3( power * p + delta) ) / power ;
                    }
    
                    if(t < waterLevel) {
                        t = 0.0;
                    }
                  
                    return t;
                  
                  }
    
                  
                  void main() {
                  
                    vUv = uv;
                  
                    // get a turbulent 3d noise using the normal, normal to high freq
    
                    noise = turbulence( normal );
                    
                    // get a 3d noise using the position, low frequency
                    //float b = 5.0 * pnoise( 0.05 * position, vec3( 100.0 ) );
                    
                    float displacement = height * noise;

                    heightDisplacement = displacement;
                  
                    // move the position along the normal and transform it
                    vec3 newPosition = position * radius + normal * displacement;
    
                    //Rotation
                    vec3 p = newPosition.xyz;
                    float new_x = p.x*cos(delta) - p.y*sin(delta);
                    float new_y = p.y*cos(delta) + p.x*sin(delta);
    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( new_x, new_y, p.z, 1.0 );
                  
                  }`;
}

function cloudFragmentShader() {

    return `varying vec2 vUv;
    varying float noise;
    varying float heightDisplacement;
    uniform float delta;
    

    float random( vec3 scale, float seed ){
        return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) ;
    }

    void main() {

    float r = .1 * random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );

    // compose the colour using the UV coordinate
    // and modulate it with the noise like ambient occlusion
    //vec2 tPos = vec2( 0, -110.3 * noise + r );
    vec4 color = vec4( noise * 10.0 , 1.0, 1.0, 1.0);

    // set the output colour to the composed colour
    // Palette from: https://www.schemecolor.com/earth-planet-colors.php
    float colorDispConstant = 0.5;
    float colorDisplacement = r * colorDispConstant;
   
    
    color = vec4(1.0, 1.0, 1.0, 1.0);
    
    

    gl_FragColor = vec4( color.rgb, 1.0 );

    if( heightDisplacement < 0.06) {
        gl_FragColor.a = 0.0;
    }

    }`;

}

//Create a three.js scene
const scene = new THREE.Scene();
//Create a three.js camera(field of view, aspect ratio, near clipping plane, far clipping plane)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//Create a three.js renderer
const renderer = new THREE.WebGLRenderer();
//Set the size of the renderer, use false to render at a lower resolution
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Uniforms for the shader
var start = Date.now();
var customEarthUniforms = {
    delta: { value: 0 },
    height: { value: 0 },
    radius: { value: 1 },
    numberOfOctaves: { value: 5 },
    waterLevel: { value: 0 },

};

var customCloudUniforms = {
    delta: { value: 0 },
    height: { value: 0 },
    radius: { value: 1 },
    numberOfOctaves: { value: 5 },
    waterLevel: { value: 0 },

};

//Create a three.js blue sphere geometry with size 1
//The geometry is described by a radius and number of segments
const geometry = new THREE.IcosahedronGeometry(1, 62);
//Create a three.js shadermaterialn for the sphere
var earthMaterial = new THREE.ShaderMaterial({
    uniforms: customEarthUniforms,
    vertexShader: earthVertexShader(),
    fragmentShader: earthFragmentShader(),
    blending: THREE.NormalBlending,
    transparent: true,
    depthWrite: false,
    depthTest: true
});

earthMaterial.transparent = true;

var cloudMaterial = new THREE.ShaderMaterial({
    uniforms: customCloudUniforms,
    vertexShader: cloudVertexShader(),
    fragmentShader: cloudFragmentShader(),
    blending: THREE.NormalBlending,
    transparent: true,
    depthWrite: false,
    depthTest: true
});

cloudMaterial.transparent = true;




//Create a three.js blue sphere mesh
const earth = new THREE.Mesh(geometry, earthMaterial);
//Add the sphere mesh to the scene
scene.add(earth);

// create a white sphere for clouds
const cloudGeometry = new THREE.Mesh(geometry, cloudMaterial);
// Add the sphere mesh to the scene
scene.add(cloudGeometry);

//Add light to the scene
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 0, 10);
scene.add(light);


//Set camera z-position to 5
camera.position.z = 5;

//Controls to be added to the GUI
var earthControls = {
    height: 0.2,
    earthRadius: 1,
    radius: 6371000,
    numberOfOctaves: 5,
    moisture: 100
}


//GUI for the camera connected to sphere
var gui = new dat.GUI();
//Add option to change a value between 0 and 10 in the GUI
var earthGUI = gui.addFolder('Earth');
earthGUI.add(earthControls, 'height', 0.0, 10.0).name('Height').listen();
earthGUI.add(earthControls, 'radius', 4371000, 8371000).name('Radius').listen();
// Add number of octaves to the GUI which takes an int value
earthGUI.add(earthControls, 'numberOfOctaves', 1, 10).name('Number of Octaves').listen();
earthGUI.add(earthControls, 'moisture', 0, 100).name(`Moisture %`).listen();


// Physics functions
//Constants
const earthDensity = 5510; // kg/m3
const earthRotationSpeed = 464; // m/s

// function to calculate the mass of a sphere with desnity and radius as inputs
function calculateMass(density, radius) {
    return (4 / 3) * Math.PI * Math.pow(radius, 3) * density;
}

var earthMass = calculateMass(earthDensity, earthControls.radius);

const earthSpeedConstant = earthMass / earthRotationSpeed;

// function that returns earth's rotationspeed with mass and constant as insputs
function calculateRotationSpeed(mass, constant) {
    return constant / mass;
}

var earthSpeed = calculateRotationSpeed(earthMass, earthSpeedConstant);




//Render the scene with a animate function
function animate() {

    //Animate the scene
    requestAnimationFrame(animate);

    //Earth
    earthMaterial.uniforms.delta.value = ((Date.now() - start)/1000)*2*Math.PI/180;
    earthMaterial.uniforms.height.value = earthControls.height;
    earthMaterial.uniforms.radius.value = earthControls.radius / 6371000;
    earthMaterial.uniforms.numberOfOctaves.value = earthControls.numberOfOctaves;
    earthMaterial.uniforms.waterLevel.value = (earthControls.moisture / 100) - 1;
    //Cloads
    cloudMaterial.uniforms.delta.value = ((Date.now() - start)/1000)*2*Math.PI/180;
    cloudMaterial.uniforms.height.value = earthControls.height + 0.1;
    cloudMaterial.uniforms.radius.value = (earthControls.radius / 6371000) + 0.05;
    cloudMaterial.uniforms.numberOfOctaves.value = earthControls.numberOfOctaves;
    cloudMaterial.uniforms.waterLevel.value = (earthControls.moisture / 100) - 1;

    //Render the scene
    renderer.render(scene, camera);
    console.log(earthMaterial.uniforms.waterLevel.value)
}

animate();

