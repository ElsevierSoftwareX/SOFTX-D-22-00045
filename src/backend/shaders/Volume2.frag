#version 450

layout(binding = 1) uniform sampler3D volume;
layout(binding = 3) uniform sampler2D frontFace;
layout(binding = 4) uniform sampler2D backFace;
layout(location = 0) out vec4 outputColor;
layout(location = 0) uniform float gamma;
layout(location = 1) uniform int renderingMode;
in vec3 vPosition;

const float stepLength = 0.01f;

vec4 colorTransfer(float intensity) {
    vec3 high = vec3(1.0f, 1.0f, 1.0f);
    vec3 low = vec3(0.0f, 0.0f, 0.0f);
    float alpha = (exp(intensity) - 1.0f) / (exp(1.0f) - 1.0f);
    return vec4(intensity * high + (1.0f - intensity) * low, alpha);
}

void main() {
    vec2 sampPos = vec2(0.5f * vPosition.xy + 0.5f);
    //    vec3 startPos = texture(frontFace, sampPos).xyz;
    //    vec3 endPos = texture(backFace, sampPos).xyz;
    //    vec3 ray = endPos - startPos;
    //    float rayLength = length(ray);
    //    vec3 stepVector = stepLength * ray / rayLength;
    //    vec3 backgroundColor = vec3(0.0f, 0.0f, 0.0f);
    //    vec3 position = startPos;
    //    float maximumIntensity = 0.0f;
    //
    //    while (rayLength > 0.0f) {
    //        float intensity = texture(volume, position).r;
    //
    //        if (renderingMode == 1) {
    //            if (intensity > maximumIntensity) {
    //                maximumIntensity = intensity;
    //            }
    //        } else {
    //            maximumIntensity = (1.0f - maximumIntensity) * intensity + maximumIntensity;
    //        }
    //
    //        if (position.x > 1.0f ||  position.y > 1.0f ||  position.z > 1.0f) {
    //            break;
    //        }
    //
    //        rayLength -= stepLength;
    //        position += stepVector;
    //    }
    //
    //    vec4 color = colorTransfer(maximumIntensity);
    //
    //    color.rgb = color.a * color.rgb + (1.0f - color.a) * pow(backgroundColor, vec3(gamma)).rgb;
    //    color.a = 1.0f;
    //    outputColor.rgb = pow(color.rgb, vec3(1.0f / gamma));
    //    outputColor.a = color.a;

    vec3 front = texture(frontFace, sampPos).xyz;
    vec3 back = texture(backFace, sampPos).xyz;

    vec3 dir = normalize(back - front);
    vec4 pos = vec4(front, 0);

    if (length(dir) < 0.001f) {
        discard;
    }

    vec4 dst = vec4(0, 0, 0, 0);
    vec4 src = vec4(0);

    float value = 0;
    float maximumIntensity = 0.0f;

    vec3 Step = dir * stepLength;

    for (int i = 0; i < 100; i++)
    {
        pos.w = 1;
        value = texture(volume, pos.xyz).r;

        if (renderingMode == 1) {
            if (value > maximumIntensity) {
                maximumIntensity = value;
            }

            if (maximumIntensity >= .95f)
            break;
        } else {
            src = vec4(value);

            src.a *= 0.5f;//reduce the alpha to have a more transparent result

            //Front to back blending
            // dst.rgb = dst.rgb + (1 - dst.a) * src.a * src.rgb
            // dst.a   = dst.a   + (1 - dst.a) * src.a
            src.rgb *= src.a;
            dst = (1.0f - dst.a)*src + dst;

            if (dst.a >= .95f)
            break;
        }

        pos.xyz += Step;
    }


    if (renderingMode == 1) {
        outputColor.rgb = pow(maximumIntensity.rrr, vec3(1.0f / gamma));
        //        outputColor.a = 1 - maximumIntensity;
        outputColor.a = 1;
    } else {
        outputColor.rgb = pow(dst.rgb, vec3(1.0f / gamma));
        outputColor.a = dst.a;
    }

    //    outputColor = dst;

}
