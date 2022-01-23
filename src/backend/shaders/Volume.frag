#version 460

layout(binding = 1) uniform sampler3D volume;
layout(location = 0) out vec3 outputColor;
in vec3 vPosition;

void main() {
  outputColor = 0.5f * vPosition + 0.5f;
}