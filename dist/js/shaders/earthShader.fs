varying vec2 vUv;
			varying float noise;
			uniform float delta;

			float random( vec3 scale, float seed ){
				return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) ;
			}

			void main() {

			float r = .1 * random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );

			// compose the colour using the UV coordinate
			// and modulate it with the noise like ambient occlusion
			vec2 tPos = vec2( 0, 110.3 * noise + r );
  			vec4 color = vec4( tPos*delta, 0.5, 0.5);
			//vec4 color = vec4( 0.5 + noise*0, 1.0, 1.0, 1.0 );
			gl_FragColor = vec4( color.rgb, 1.0 );

			}