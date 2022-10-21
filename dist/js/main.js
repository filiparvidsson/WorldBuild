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
    uniform float offset;
    uniform float topologicalOffset;
    uniform float topologicalOffsetStrength;	

    varying float heightDisplacement;

    varying float colorDisplacement;

    
                float turbulence( vec3 p ) {
    
                 
                    float t = .0;
                  
                    for (float f = 1.0 ; f <= numberOfOctaves ; f++ ){
                      float power = pow( 2.0, f );
                      t +=  cnoise( vec3( power * p + offset) ) / power ;
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

                    colorDisplacement = turbulence( normal + vec3(topologicalOffset, topologicalOffset, topologicalOffset) );
                    
                    
                    // get a 3d noise using the position, low frequency
                    //float b = 5.0 * pnoise( 0.05 * position, vec3( 100.0 ) );
                    
                    float displacement = height * noise;

                    heightDisplacement = displacement;

                    colorDisplacement = (1.0-topologicalOffsetStrength)*heightDisplacement + topologicalOffsetStrength*colorDisplacement;
                  
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
    varying float colorDisplacement;
    

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
    // float colorDispConstant = 0.5;
    // float colorDisplacement = r * colorDispConstant;
   
    if(colorDisplacement <= 0.002) {
        color = vec4(0.272 + 0.2*noise, 0.294 + 0.2*noise, 0.267 + 0.2*noise, 1.0);
    }
    else if(colorDisplacement > 0.002 && colorDisplacement <= 0.01) {
        color = vec4(0.65 + 0.7*noise, 0.60 + 0.7*noise, 0.44 + 0.4*noise, 1.0);
    }
    else if(colorDisplacement> 0.01 && colorDisplacement <= 0.07) {
        color = vec4(0.231 + 0.1*noise, 0.365 + 0.2*noise, 0.219 + 0.2*noise, 1.0);
    }
    else if(colorDisplacement> 0.07 && colorDisplacement <= 0.09) {
        color = vec4(0.322 + 0.2*noise, 0.334 + 0.2*noise, 0.327 + 0.2*noise, 1.0);
    }
    else {
        color = vec4(0.622 + 0.4*noise, 0.634 + 0.4*noise, 0.627 + 0.4*noise, 1.0);
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

    uniform float offset;
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
    varying vec3 vNormal;

                float turbulence( vec3 p ) {
                
                            
                    float t = .0;
                
                    for (float f = 1.0 ; f <= numberOfOctaves ; f++ ){
                    float power = pow( 2.0, f );
                    t +=  cnoise( vec3( power * p + offset) ) / power ;
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
                    
                    float displacement = (0.01 + height) * noise;

                    distanceToWater = earthNoice - displacement;

                    heightDisplacement = noise;

                    //waterOpacity = dot(vec3(cameraPositionX, cameraPositionY, cameraPositionZ), normal) / sqrt(cameraPositionX * cameraPositionX + cameraPositionY * cameraPositionY + cameraPositionZ * cameraPositionZ);
                  
                    // move the position along the normal and transform it
                    vec3 newPosition = position * radius + normal * displacement;
    
                    //Rotation
                    vec3 p = newPosition.xyz;
                    float new_x = p.x*cos(delta) - p.y*sin(delta);
                    float new_y = p.y*cos(delta) + p.x*sin(delta);

                    //Rotate the normal vector to match the rotation
                    vec3 n = normal.xyz;
                    float new_nx = n.x*cos(delta) - n.y*sin(delta);
                    float new_ny = n.y*cos(delta) + n.x*sin(delta);
                    vNormal = vec3(new_nx, new_ny, n.z);

    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( new_x, new_y, p.z, 1.0 );

                    waterOpacity = dot(vec3(cameraPositionX, cameraPositionY, cameraPositionZ), vNormal) / sqrt(cameraPositionX * cameraPositionX + cameraPositionY * cameraPositionY + cameraPositionZ * cameraPositionZ);
                  
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

    uniform float cameraPositionX;
    uniform float cameraPositionY;
    uniform float cameraPositionZ;

    varying float heightDisplacement;

    varying float cloudCosAngle;

    
                float turbulence( vec3 p ) {
    
                 
                    float t = .0;
                  
                    for (float f = 1.0 ; f <= numberOfOctaves ; f++ ){
                      float power = pow( 2.0, f );
                      t +=  cnoise( vec3( power * p + delta*2.0 + offset) ) / power ;
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

                    cloudCosAngle = dot(vec3(cameraPositionX, cameraPositionY, cameraPositionZ), normal);
                  
                    // move the position along the normal and transform it
                    vec3 newPosition = position * radius + normal * displacement;
    
                    //Rotation
                    vec3 p = newPosition.xyz;
                    float new_x = p.x;//*cos(delta*noise) - p.y*sin(delta*noise);
                    float new_y = p.y;//*cos(delta*noise) + p.x*sin(delta*noise);
    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( new_x, new_y, p.z, 1.0 );
                  
                  }`;
}

function cloudFragmentShader() {

    return `varying vec2 vUv;
    varying float noise;
    varying float heightDisplacement;
    varying float cloudCosAngle;
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
   
    

    
    

    gl_FragColor = vec4( color.rgb, (heightDisplacement - 0.1)*2.0 );

    

    if( heightDisplacement < 0.1) {
        gl_FragColor.a = heightDisplacement*0.2 - 0.15;
    }

    // if(cloudCosAngle > 0.0) {
    //     gl_FragColor.a = 1.0;
    // }


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
    uniform float distanceToEarth;

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

                    vec3 distance = vec3(distanceToEarth, 0.0, 0.0);
                  
                    // move the position along the normal and transform it
                    vec3 newPosition = position * radius + normal * displacement + distance;
    
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

//A function that calculates the length of a vector3
function length(vec) {
    distance = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);

    if (distance > 15.0) {
        distance = 15.0;
    }
    else if (distance < 1.0) {
        distance = 1.0;
    }

    return distance;
    

} 
// A function that returns the argument multiplied by negative 2, square rooted and 14.5 added to it
function numberOfOctaves(arg) {
    return Math.sqrt(arg)*-2.0 + 14.5;
}

// A function which return the mass of a sphere with a given radius and density
function mass(radius, density) {
    return 4.0 / 3.0 * Math.PI * Math.pow(radius, 3) * density;
}

// A function which return the radious of an orbit given the mass of the object, the gravitational constant and orbit time
function radiusOfOrbit(planetMass, moonMass, gravitationalConstant, orbitTime) {
    return Math.cbrt(Math.pow(orbitTime, 2.0) * gravitationalConstant * (planetMass + moonMass) / (4.0 * Math.pow(Math.PI, 2.0)));
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
    offset: { value: 0 },
    waveIntensity: { value: 0 },
    topologicalOffset: { value: 0 },
    topologicalOffsetStrength: { value: 0 },

};

var customWaterUniforms = {
    delta: { value: 0 },
    earthHeight: { value: 0 },
    height: { value: 0 },
    radius: { value: 1 },
    numberOfOctaves: { value: 5 },
    offset: { value: 0 },
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
    cameraPositionX: { value: 0 },
    cameraPositionY: { value: 0 },
    cameraPositionZ: { value: -5 },

};

var customMoonUniforms = {
    delta: { value: 0 },
    height: { value: 0 },
    radius: { value: 1 },
    numberOfOctaves: { value: 5 },
    waterLevel: { value: 0 },
    distanceToEarth: { value: 3 },

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
//moonGeometry.position.set(2, 0, 0);

//Add light to the scene
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 0, 10);
scene.add(light);


//Controls to be added to the GUI
var earthControls = {
    height: 0.2,
    radius: 6371000,
    numberOfOctaves: 5,
    offset: 0,
    waveIntensity: 0.0,
    topologicalOffset: 0.0,
    topologicalOffsetStrength: 0.0,
    density: 5510,
}

var moonControls = {
    radius: 1737400,
    numberOfOctaves: 5,
    density: 3346,
}


//GUI for the camera connected to sphere
var gui = new dat.GUI();
//Add option to change a value between 0 and 10 in the GUI
var earthGUI = gui.addFolder('Earth');
earthGUI.add(earthControls, 'height', 0.0, 1.0).name('Height').listen();
earthGUI.add(earthControls, 'radius', 4371000, 8371000).name('Radius').listen();
// Add number of octaves to the GUI which takes an int value
earthGUI.add(earthControls, 'offset', 0, 5).name(`Offset %`).listen();
earthGUI.add(earthControls, 'waveIntensity', -0.25, 0.25).name(`Flooding`).listen();
earthGUI.add(earthControls, 'topologicalOffset', 0, 5).name(`Topological Offset`).listen();
earthGUI.add(earthControls, 'topologicalOffsetStrength', 0, 1).name(`T.O Strength`).listen();

var moonGUI = gui.addFolder('Moon');
moonGUI.add(moonControls, 'radius', 1037400, 2337400).name('Radius').listen();
//moonGUI.add(moonControls, 'numberOfOctaves', 1, 10).name('Number of Octaves').listen();


//Render the scene with a animate function
function animate() {

    //Animate the scene
    requestAnimationFrame(animate);

    //Earth
    earthMaterial.uniforms.delta.value = ((Date.now() - start)/1000)*2*Math.PI/180;
    earthMaterial.uniforms.height.value = earthControls.height;
    earthMaterial.uniforms.radius.value = earthControls.radius / 6371000;
    earthMaterial.uniforms.numberOfOctaves.value = numberOfOctaves(length(camera.position));//earthControls.numberOfOctaves;
    earthMaterial.uniforms.offset.value = earthControls.offset;//(earthControls.moisture / 100) - 1;
    earthMaterial.uniforms.topologicalOffset.value = earthControls.topologicalOffset;
    earthMaterial.uniforms.topologicalOffsetStrength.value = earthControls.topologicalOffsetStrength;

    //Water
    waterMaterial.uniforms.delta.value = ((Date.now() - start)/1000)*2*Math.PI/180;
    waterMaterial.uniforms.numberOfOctaves.value = numberOfOctaves(length(camera.position));
    waterMaterial.uniforms.earthHeight.value = earthControls.height;
    waterMaterial.uniforms.offset.value = earthControls.offset;
    waterMaterial.uniforms.radius.value = (earthControls.radius / 6371000);
    waterMaterial.uniforms.height.value = earthControls.waveIntensity;

    waterMaterial.uniforms.cameraPositionX.value = -1.0 *camera.position.x;
    waterMaterial.uniforms.cameraPositionY.value = -1.0 *camera.position.y;
    waterMaterial.uniforms.cameraPositionZ.value = -1.0 *camera.position.z;


    //Cloads
    cloudMaterial.uniforms.delta.value = ((Date.now() - start)/1000)*2*Math.PI/180;
    cloudMaterial.uniforms.height.value = earthControls.height + 0.1;
    cloudMaterial.uniforms.radius.value = (earthControls.radius / 6371000) + 0.03;
    cloudMaterial.uniforms.numberOfOctaves.value = numberOfOctaves(length(camera.position));
    cloudMaterial.uniforms.waterLevel.value = (earthControls.moisture / 100) - 1;

    cloudMaterial.uniforms.cameraPositionX.value = -1.0 *camera.position.x;
    cloudMaterial.uniforms.cameraPositionY.value = -1.0 *camera.position.y;
    cloudMaterial.uniforms.cameraPositionZ.value = -1.0 *camera.position.z;

    //Moon

    moonMaterial.uniforms.delta.value = (((Date.now() - start)/1000)*2*Math.PI/180)/27;
    moonMaterial.uniforms.radius.value = moonControls.radius / 6371000;
    moonMaterial.uniforms.numberOfOctaves.value = numberOfOctaves(length(moonGeometry.position.clone().sub(camera.position )));
    moonMaterial.uniforms.distanceToEarth.value = radiusOfOrbit(mass(earthControls.radius, earthControls.density), mass(moonControls.radius, moonControls.density), 6.674 * Math.pow(10.0, -11.0), 27*24*60*60) / Math.pow(10.0, 8.0);
    //moonMaterial.uniforms.radius.value

    //Render the scene
    renderer.render(scene, camera);
    //console.log(earthMaterial.uniforms.waterLevel.value)
}

animate();

