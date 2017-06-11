uniform vec2 nearFar;
uniform vec3 color_1;
uniform vec3 color_2;
varying float dist;

void main()
{
    // gl_FragColor = vec4( small, alpha );

    float r = 0.0, delta = 0.0, alpha = .4;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);
    if (r > 1.0) {
        discard;
    }

    vec3 color = mix(color_1, color_2, (dist - 128.) / 10.);

    gl_FragColor = vec4(color, alpha);
}
