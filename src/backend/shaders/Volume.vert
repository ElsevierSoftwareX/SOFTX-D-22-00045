#version 460

layout(location = 0) uniform mat4x4 MVP;
layout(location = 0) in vec3 Position;
smooth out vec3 vPosition;

void main() {
  gl_Position = MVP * vec4(Position, 1.0f);
  vPosition = Position;
}