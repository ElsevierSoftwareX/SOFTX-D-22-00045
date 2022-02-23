#version 450
//#pragma optimize (off)
//#pragma debug (on)

layout(location = 0) in vec3 vertCoord;
layout(location = 1) in vec2 vertTexCoord;
out vec2 fragTexCoord;

void main()
{
    gl_Position = vec4(vertCoord.x, vertCoord.y, 0.0, 1.0);
    fragTexCoord = vertTexCoord;
}
