//
// This fragment shader renders the Event Horizon with animation

#define M_PI 3.1415926535897932384626433832795



/*******************************************
 *             Noise functions             *
 *******************************************/


/**
 *  Generates a random number.
 *
 *  @param co The seed
 *  @returns The value from 0 to 1
 */
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

/** From https://www.shadertoy.com/view/Ms2SD1 */
float hash( vec2 p ) {
	float h = dot(p,vec2(127.1,311.7));
    return fract(sin(h)*43758.5453123);
}
float noise( in vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );
	vec2 u = f*f*(3.0-2.0*f);
    return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ),
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ),
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}
























/*******************************************
 *                Main code                *
 *******************************************/




/**
 *  Called by HF to determine the pixel's PBR values.
 *
 *  @param diffuse The base color.
 *  @param specular The metallicness value.
 *  @param shininess The glossiness value (inverse of roughness).
 *  @returns Emissive value
 */
float getProceduralColors(out vec3 diffuse, out vec3 specular, out float shininess) {

    // bool front = _position.x > 0

    // Set base color
    vec3 color = vec3(0.143, 0.151, 0.339);

    // Apply noise
    vec2 noiseOffset = _position.yz * 20;
    noiseOffset.x += iGlobalTime * 1.5;
    noiseOffset.y += iGlobalTime * 1;
    color *= noise(noiseOffset) * 0.5 + 1.0;

    // Apply more noise
    noiseOffset = _position.yz * 16;
    noiseOffset.x += iGlobalTime * -0.8;
    noiseOffset.y += iGlobalTime * -0.3;
    color *= noise(noiseOffset) * 0.5 + 1.0;

    // Apply lighter shading in the center
    float closenessToCenter = clamp(1.0 - length(_position.yz), 0.0, 1.0);
    color *= closenessToCenter * 8.0;

    // On gate activation, apply a super bright burst of light
    if (iGlobalTime < 2.0) {

        // Apply it based on sine wave
        float progress = iGlobalTime / 2.0;
        float brightness = sin(progress * M_PI) * 2.0;
        color += brightness;

    }

    // Return color
    diffuse = color;
    specular = vec3(0.0);
    return 1.0;

}
