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
    
                    // if(t < waterLevel) {
                    //     t = 0.0;
                    // }
                  
                    return t;
                  
                  }
    
                  
                  void main() {
                  
                    vUv = uv;
                  
                    // get a turbulent 3d noise using the normal, normal to high freq
    
                    noise = turbulence( normal );
                    
                    // get a 3d noise using the position, low frequency
                    //float b = 5.0 * pnoise( 0.05 * position, vec3( 100.0 ) );
                    
                    float displacement = height * noise;

                    heightDisplacement = noise;
                  
                    // move the position along the normal and transform it
                    vec3 newPosition = position * radius + normal * displacement;
    
                    //Rotation
                    vec3 p = newPosition.xyz;
                    float new_x = p.x;//*cos(delta) - p.y*sin(delta);
                    float new_y = p.y;//*cos(delta) + p.x*sin(delta);
    
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
   
    if(heightDisplacement <= 0.0) {
        color = vec4(0.272 + 0.2*heightDisplacement, 0.294 + 0.2*heightDisplacement, 0.267 + 0.2*heightDisplacement, 1.0);
    }
    else if(heightDisplacement > 0.0 && heightDisplacement <= 0.3) {
        color = vec4(0.231 + 0.1*heightDisplacement, 0.365 + 0.2*heightDisplacement, 0.219 + 0.2*heightDisplacement, 1.0);
    }
    else {
        color = vec4(0.322 + 0.3*heightDisplacement, 0.334 + 0.3*heightDisplacement, 0.327 + 0.2*heightDisplacement, 1.0);
    }

    gl_FragColor = vec4( color.rgb, 1.0 );
    gl_FragColor.a = 1.0;

    }`;

}

//Water
function waterVertexShader() {
    return `
    
    ${classic3DNoise()}
    ${classicPerlinNoise()}
    ${cellularNoise()}
    
    //////////////////////////////////////////////////////////////////////////////////////////////
    
    varying vec2 vUv;
    varying float noise;
    varying float earthNoice;	
    varying float distanceToWater;


    uniform float earthHeight;
    uniform float delta;
    uniform float height;
    uniform float radius;
    uniform float numberOfOctaves;
    uniform float waterLevel;
    
    uniform float cameraPositionX;
    uniform float cameraPositionY;
    uniform float cameraPositionZ;

    varying float heightDisplacement;

    varying float waterOpacity;

                float turbulence( vec3 p ) {
                
                            
                    float t = .0;
                
                    for (float f = 1.0 ; f <= numberOfOctaves ; f++ ){
                    float power = pow( 2.0, f );
                    t +=  cnoise( vec3( power * p) ) / power ;
                    }

                    // if(t < waterLevel) {
                    //     t = 0.0;
                    // }
                
                    return t;
                
                }

    
                float cellularTurbulence( vec3 p ) {
    
                 
                    float t = .0;
                  
                    for (float f = 1.0 ; f <= numberOfOctaves ; f++ ){
                      float power = pow( 2.0, f );
                      t +=  cellular( vec3( power * p + delta*3.0) ).x / power ;
                    }
    
                    // if(t < waterLevel) {
                        //t = 0.0;
                    // }
                    
                  
                    return t;
                  
                  }
    
                  
                  void main() {
                  
                    vUv = uv;
                  
                    // get a turbulent 3d noise using the normal, normal to high freq
    
                    noise = cellularTurbulence( normal );

                    earthNoice = turbulence( normal ) * earthHeight;
                    
                    // get a 3d noise using the position, low frequency
                    //float b = 5.0 * pnoise( 0.05 * position, vec3( 100.0 ) );
                    
                    float displacement = 0.01 * noise;

                    distanceToWater = earthNoice - displacement;

                    heightDisplacement = noise;

                    waterOpacity = dot(vec3(cameraPositionX, cameraPositionY, cameraPositionZ), normal) / sqrt(cameraPositionX * cameraPositionX + cameraPositionY * cameraPositionY + cameraPositionZ * cameraPositionZ);
                  
                    // move the position along the normal and transform it
                    vec3 newPosition = position * radius + normal * displacement;
    
                    //Rotation
                    vec3 p = newPosition.xyz;
                    float new_x = p.x;//*cos(delta) - p.y*sin(delta);
                    float new_y = p.y;//*cos(delta) + p.x*sin(delta);
    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( new_x, new_y, p.z, 1.0 );
                  
                  }`;
}

function waterFragmentShader() {

    return `varying vec2 vUv;
    varying float noise;
    varying float heightDisplacement;
    varying float waterOpacity;
    varying float distanceToWater;
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
   
    //if(heightDisplacement <= 0.5) {
    

    if(distanceToWater > -0.005) {
        color = vec4(0.5*heightDisplacement, 0.7*heightDisplacement, 1.0 - 0.2*heightDisplacement, 1.0);
        gl_FragColor = vec4( color.rgb, 1.0 );
        gl_FragColor.a = 1.0 + 0.3*waterOpacity;
    }
    else {
        color = vec4(0.2*heightDisplacement, 0.6*heightDisplacement, 1.0 - 0.6*heightDisplacement, 1.0);
        gl_FragColor = vec4( color.rgb, 1.0 );
        gl_FragColor.a = 1.0 + 0.7*waterOpacity;
    }
    // }
    // else {
    // color = vec4(0.0, 0.0, 0.8, 1.0);
    // }


    
    //waterOpacity > 0.0 ? gl_FragColor.a = 1.0 : gl_FragColor.a = waterOpacity;
    


    }`;

}

// Clouds
function cloudVertexShader() {
    return `
    
    ${classic3DNoise()}
    ${classicPerlinNoise()}
    
    //////////////////////////////////////////////////////////////////////////////////////////////
    
    varying vec2 vUv;
    varying float noise;	
    uniform float delta;

    float height = 0.2;
    float offset = 2.0;

    uniform float radius;
    uniform float numberOfOctaves;
    uniform float waterLevel;	

    varying float heightDisplacement;

    
                float turbulence( vec3 p ) {
    
                 
                    float t = .0;
                  
                    for (float f = 1.0 ; f <= numberOfOctaves ; f++ ){
                      float power = pow( 2.0, f );
                      t +=  cnoise( vec3( power * p + delta*10.0 + offset) ) / power ;
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
                    float new_x = p.x*cos(delta*noise) - p.y*sin(delta*noise);
                    float new_y = p.y*cos(delta*noise) + p.x*sin(delta*noise);
    
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
    
    

    gl_FragColor = vec4( color.rgb, 1.0 - (0.2 - heightDisplacement) );

    if( heightDisplacement < 0.06) {
        gl_FragColor.a = 0.0;
    }

    }`;

}

//Moon
function moonVertexShader() {
    return `
    
    ${classic3DNoise()}
    ${classicPerlinNoise()}
    
    //////////////////////////////////////////////////////////////////////////////////////////////
    
    varying vec2 vUv;
    varying float noise;	
    uniform float delta;
    uniform float radius;
    uniform float craterLevel;
    uniform float numberOfOctaves;	

    varying float heightDisplacement;

    
                float turbulence( vec3 p ) {
    
                 
                    float t = .0;
                  
                    for (float f = 1.0 ; f <= numberOfOctaves ; f++ ){
                      float power = pow( 2.0, f );
                      t +=  cnoise( vec3( power * p) ) / power ;
                    }

                    if(t > craterLevel) {
                        t = 2.0*craterLevel - t;
                    }

                    

                  
                    return t;
                  
                  }
    
                  
                  void main() {
                  
                    vUv = uv;
                  
                    // get a turbulent 3d noise using the normal, normal to high freq
                    noise = turbulence( normal );
                    
                    float displacement = noise * 0.1;

                    heightDisplacement = noise;
                  
                    // move the position along the normal and transform it
                    vec3 newPosition = position * radius + normal * displacement;
    
                    //Rotation
                    vec3 p = newPosition.xyz;
                    float new_x = p.x*cos(delta) - p.y*sin(delta);
                    float new_y = p.y*cos(delta) + p.x*sin(delta);
    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( new_x, new_y, p.z, 1.0 );
                  
                  }`;
}

function moonFragmentShader() {

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
   
    // if(heightDisplacement == 0.0) {
    //     color = vec4(0.235, 0.259, 0.345, 1.0);
    // }
    // else if(heightDisplacement > 0.0 && heightDisplacement <= 0.05) {
    //     color = vec4(0.231, 0.365, 0.219, 1.0);
    // }
    // else {
    //     color = vec4(0.572, 0.494, 0.467, 1.0);
    // }

    // r = 0.5 - 1.0*heightDisplacement;

    // color = vec4(r, r, r, 1.0);

    if( heightDisplacement < -0.05) {
        color = vec4(0.7 + 0.3*heightDisplacement, 0.7 + 0.3*heightDisplacement, 0.7 + 0.3*heightDisplacement, 1.0);
    }
    else {
        color = vec4(0.5 - heightDisplacement, 0.5 - heightDisplacement, 0.5 - heightDisplacement, 1.0);
    }

    gl_FragColor = vec4( color.rgb, 1.0 );
    gl_FragColor.a = 1.0;

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

//Set camera z-position to 5
camera.position.z = 5;

const controls = new THREE.OrbitControls( camera, renderer.domElement );
// add some customization to controls
controls.enableDamping = true;
controls.dampingFactor = 0.25;


//Uniforms for the shader
var start = Date.now();
var customEarthUniforms = {
    delta: { value: 0 },
    height: { value: 0 },
    radius: { value: 1 },
    numberOfOctaves: { value: 5 },
    waterLevel: { value: 0 },
    waveIntensity: { value: 0 },

};

var customWaterUniforms = {
    delta: { value: 0 },
    earthHeight: { value: 0 },
    radius: { value: 1 },
    numberOfOctaves: { value: 5 },
    waterLevel: { value: 0 },
    cameraPositionX: { value: 0 },
    cameraPositionY: { value: 0 },
    cameraPositionZ: { value: -5 },

};

var customCloudUniforms = {
    delta: { value: 0 },
    height: { value: 0 },
    radius: { value: 1 },
    numberOfOctaves: { value: 5 },
    waterLevel: { value: 0 },

};

var customMoonUniforms = {
    delta: { value: 0 },
    height: { value: 0 },
    radius: { value: 1 },
    numberOfOctaves: { value: 5 },
    waterLevel: { value: 0 },

};



//Create a three.js blue sphere geometry with size 1
//The geometry is described by a radius and number of segments
const geometry = new THREE.IcosahedronGeometry(1, 90);
//geometry.drawRange.count = 100000;
//Create a three.js shadermaterialn for the sphere
var earthMaterial = new THREE.ShaderMaterial({
    uniforms: customEarthUniforms,
    vertexShader: earthVertexShader(),
    fragmentShader: earthFragmentShader(),
});

var waterMaterial = new THREE.ShaderMaterial({
    uniforms: customWaterUniforms,
    vertexShader: waterVertexShader(),
    fragmentShader: waterFragmentShader(),
    blending: THREE.NormalBlending,
    transparent: true,
    depthWrite: false,
    depthTest: true
});

waterMaterial.transparent = true;
waterMaterial.side = THREE.DoubleSide;

var cloudMaterial = new THREE.ShaderMaterial({
    uniforms: customCloudUniforms,
    vertexShader: cloudVertexShader(),
    fragmentShader: cloudFragmentShader(),
    blending: THREE.NormalBlending,
    transparent: true,
    depthWrite: false,
    depthTest: true
});
// Clouds are transparent and do not write to the depth buffer
cloudMaterial.transparent = true;
cloudMaterial.side = THREE.DoubleSide;

var moonMaterial = new THREE.ShaderMaterial({
    uniforms: customMoonUniforms,
    vertexShader: moonVertexShader(),
    fragmentShader: moonFragmentShader(),
});



//Create a three.js blue earth mesh
const earth = new THREE.Mesh(geometry, earthMaterial);
//Add the sphere mesh to the scene
scene.add(earth);

//Create a three.js blue water mesh
const water = new THREE.Mesh(geometry, waterMaterial);
//Add the sphere mesh to the scene
scene.add(water);

// create a white sphere for clouds
const cloudGeometry = new THREE.Mesh(geometry, cloudMaterial);
// Add the sphere mesh to the scene
scene.add(cloudGeometry);

// create a white sphere for moon
const moonGeometry = new THREE.Mesh(geometry, moonMaterial);
// Add the sphere mesh to the scene
scene.add(moonGeometry);
// Move the sphere next to the earth
moonGeometry.position.set(0, 2, 0);

//Add light to the scene
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 0, 10);
scene.add(light);


//Controls to be added to the GUI
var earthControls = {
    height: 0.2,
    radius: 6371000,
    numberOfOctaves: 5,
    moisture: 100,
    waveIntensity: 0.0,
}

var moonControls = {
    radius: 1737400,
    numberOfOctaves: 5
}


//GUI for the camera connected to sphere
var gui = new dat.GUI();
//Add option to change a value between 0 and 10 in the GUI
var earthGUI = gui.addFolder('Earth');
earthGUI.add(earthControls, 'height', 0.0, 1.0).name('Height').listen();
earthGUI.add(earthControls, 'radius', 4371000, 8371000).name('Radius').listen();
// Add number of octaves to the GUI which takes an int value
earthGUI.add(earthControls, 'numberOfOctaves', 1, 10).name('Number of Octaves').listen();
earthGUI.add(earthControls, 'moisture', 0, 100).name(`Moisture %`).listen();
//earthGUI.add(earthControls, 'waveIntensity', 0, 0.25).name(`Wave Intensity`).listen();

var moonGUI = gui.addFolder('Moon');
moonGUI.add(moonControls, 'radius', 1037400, 2337400).name('Radius').listen();
moonGUI.add(moonControls, 'numberOfOctaves', 1, 10).name('Number of Octaves').listen();


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

    //Water
    waterMaterial.uniforms.delta.value = ((Date.now() - start)/1000)*2*Math.PI/180;
    waterMaterial.uniforms.numberOfOctaves.value = earthControls.numberOfOctaves;
    waterMaterial.uniforms.earthHeight.value = earthControls.height;
    //waterMaterial.uniforms.radius.value = (earthControls.radius / 6371000) - 0.3*earthControls.waveIntensity;
    //waterMaterial.uniforms.height.value = earthControls.waveIntensity;

    waterMaterial.uniforms.cameraPositionX.value = -1.0 *camera.position.x;
    waterMaterial.uniforms.cameraPositionY.value = -1.0 *camera.position.y;
    waterMaterial.uniforms.cameraPositionZ.value = -1.0 *camera.position.z;


    //Cloads
    cloudMaterial.uniforms.delta.value = ((Date.now() - start)/1000)*2*Math.PI/180;
    cloudMaterial.uniforms.height.value = earthControls.height + 0.1;
    cloudMaterial.uniforms.radius.value = (earthControls.radius / 6371000) + 0.05;
    cloudMaterial.uniforms.numberOfOctaves.value = earthControls.numberOfOctaves;
    cloudMaterial.uniforms.waterLevel.value = (earthControls.moisture / 100) - 1;

    //Moon
    moonMaterial.uniforms.delta.value = ((Date.now() - start)/1000)*2*Math.PI/180;
    moonMaterial.uniforms.radius.value = moonControls.radius / 6371000;
    moonMaterial.uniforms.numberOfOctaves.value = moonControls.numberOfOctaves;
    //moonMaterial.uniforms.radius.value

    //Render the scene
    renderer.render(scene, camera);
    console.log(earthMaterial.uniforms.waterLevel.value)
}

animate();

