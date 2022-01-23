#version 460
//#pragma optimize (off)
//#pragma debug (on)

in vec2 fragTexCoord;
layout(location = 0) out float outputColor;
layout(binding = 0) uniform sampler2D texSampler;
layout(location = 0) uniform float rescaleSlope;
layout(location = 1) uniform float rescaleIntercept;
layout(location = 2) uniform float windowCenter;
layout(location = 3) uniform float windowWidth;

const uint out_min = 0;
const uint out_max = 255;

void main() {
    float sampled = texture(texSampler, fragTexCoord).r * 32768.0f;
    float ww = windowWidth - 1.0f;
    float wc = windowCenter - 0.5f;
    float hw = ww / 2.0f;
    float val = sampled * rescaleSlope + rescaleIntercept;

    //     As per DICOM C.11.2.1.2.1
    if (val <= wc - hw) {
        outputColor = 0.0f;
    } else if (val > wc + hw) {
        outputColor = 1.0f;
    } else {
        outputColor = ((val - wc) / ww + 0.5f);
    }
}
