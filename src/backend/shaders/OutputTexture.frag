#version 460
//#pragma optimize (off)
//#pragma debug (on)

in vec2 fragTexCoord;
layout(location = 0) out float outputColor;
layout(binding = 1) uniform sampler3D texSampler;
layout(location = 0) uniform float depth;


void main() {
    outputColor = texture(texSampler, vec3(fragTexCoord, depth)).r;
}
