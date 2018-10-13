# High Fidelity: Stargate

This stargate can transport users anywhere within the High Fidelity metaverse! Simply turn it on, and then walk through it.

---

## Features

- [x] Stargate
  - [x] Click to activate (temporary, until DHDs work)
  - [x] Shader-based animation of the event horizon
  - [ ] Light effects
  - [x] Sound effects
  - [x] Teleport user on enter
- [ ] Stargate network
  - [ ] Give each stargate an automatically generated 9-digit alphabetic address
  - [ ] Create relay server to keep stargates in sync across domains
  - [ ] Activate target stargate in receive mode
- [ ] Standard DHD
  - [ ] Allow activating the nearest stargate with a hardcoded address
  - [ ] Map gate address digits to chevrons
  - [ ] Allow users to dial custom addresses
- [ ] Handheld DHD
  - [ ] See and store nearby gate addresses
  - [ ] Dial a stored address

---

## Attributions

- Model: [Stargate by stale_mud](https://sketchfab.com/models/1af03ae28595490aa11ce3ba07b1e23f)

---

## Discoveries

This is my first project using shaders in High Fidelity, and in fact shaders at all, so I'm going to put my discoveries here so I don't forget them.

**Entity:** To use a shader to render an entity, add a section like this to the userData:

``` json
{
    "ProceduralEntity": {
        "version": 2,
        "shaderUrl": "https://.../shader.fs",
        "uniforms": {},
        "channels": []
    }
}
```

- `uniforms` is an object defining uniform values to pass to the shader. Can be changed at runtime by an entity script.
- `channels` is an array of image URLs, which will become available to the shader as textures in `iChannel0`, `iChannel1` etc.

**Main Function:** Shaders must define this main function:

``` c
/**
 *  Called by HF to determine the pixel's PBR values.
 *
 *  @param diffuse The base color.
 *  @param specular The metallicness value.
 *  @param shininess The glossiness value (inverse of roughness).
 *  @returns Emissive value
 */
float getProceduralColors(out vec3 diffuse, out vec3 specular, out float shininess) {

}
```

**Built-in Uniforms:** These variables are available to all shaders.

- `vec3 _position` : Contains the position of the pixel on the surface of the object.
- `float iGlobalTime` : The time in seconds since this shader started running.
