#version 450
//#pragma optimize (off)
//#pragma debug (on)


in vec2 fragTexCoord;
layout(location = 0) out float outputColor;
layout(binding = 1) uniform sampler3D texSampler;
layout(location = 0) uniform float posX;
layout(location = 1) uniform float posY;
layout(location = 2) uniform float posZ;

const float stepSize = 0.01f;

void main() {
    vec2 localCoord = fragTexCoord;
    localCoord.x = (fragTexCoord.x + 1.0f) + 0.5f;
    localCoord.y = (fragTexCoord.y - 1.0f) + 0.5f;
    vec3 viewer = vec3(posX, posY, posZ);
    vec3 direction = normalize(viewer - vec3(localCoord, 0.0f));
    vec3 position = vec3(localCoord, 0.0f);
    vec3 step = direction * stepSize;
    float finalColor = 0.0f;
    float sampledColor;


    for (int i = 0; i < 200; i++)
    {
//        sampledColor = texture(texSampler, vec3(fragTexCoord, 0.0f)).r;
        sampledColor = texture(texSampler, position).r;
        sampledColor *= 0.01f;

        //Front to back blending
        // dst.rgb = dst.rgb + (1 - dst.a) * src.a * src.rgb
        // dst.a   = dst.a   + (1 - dst.a) * src.a

        finalColor = (1.0f - finalColor) * sampledColor + finalColor;

        if (finalColor >= 0.95f) {
            break;
        }

        position += step;

//        if (position.x > 1.0f ||  position.y > 1.0f ||  position.z > 1.0f) {
//            break;
//        }

    }

    outputColor = finalColor;
}
