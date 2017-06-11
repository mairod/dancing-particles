import * as TOOLS from './tools.class.js'
import * as THREE from 'three'
import normalizeWheel from 'normalize-wheel'
import FBO from './fbo.js'


class THREE_Controller {

    constructor(options) {

        this.options              = options
        this.container            = this.options.container
        this.debug                = this.options.debug || false
        this.width                = this.container.offsetWidth
        this.height               = this.container.offsetHeight
        this.camera               = new Object()
        this.assets               = new Object()
        this.scene                = new THREE.Scene()
        this.group                = new THREE.Group()
        this.mouse                = new THREE.Vector3(0, 0)
        this.direction            = new THREE.Vector3(0, 0)
        this.camera_position      = new THREE.Vector3(0, 0)
        this.sound                = new THREE.Vector3(0, 0)
        this.sound_direction      = new THREE.Vector3(0, 0)
        this.sound_position       = new THREE.Vector3(0, 0)
        this.drag_rotation        = new THREE.Vector2(0, 0)
        this.rotation_direction   = new THREE.Vector2(0, 0)
        this.camera_rotation      = new THREE.Vector2(0, 0)
        this.cameraEasing         = {x: 10, y: 1}
        this.time                 = 0
        this.drag                 = false
        this.flag                 = 0

        this.init_environement()
        this.init_camera()
        this.init_event()
        this.init_shaders()
        this.init_loader()
        this.init_sphere()

        setTimeout(() => {
          console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
          console.log("%cMade with ❤️ by Dorian Lods : http://dorianlods.fr", "padding: 10px; margin-bottom: 10px; color: #262626; font-size: 20px; font-family: sans-serif;")
          console.log("%cCode available here : https://github.com/mairod/dancing-particles", "padding: 10px; margin-bottom: 10px; color: #262626; font-size: 20px; font-family: sans-serif;")
        }, 100);

    }

    init_loader() {
        this.manager = new THREE.LoadingManager();
		    this.manager.onProgress = (item, loaded, total) => {
            let progress = Math.round((loaded / total) * 100)
            if (progress == 100) {
           }
        }

    }

    init_camera() {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.z = 500;
    }

    init_environement() {

        this.scene.fog = new THREE.FogExp2( 0xeaeaea, 0.0020 )

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.width, this.height)

        this.container.appendChild(this.renderer.domElement)
    }

    init_event() {
        let that = this
        window.addEventListener('resize', function() {
            that.width = window.innerWidth
            that.height = window.innerHeight
            that.camera.aspect = that.width / that.height
            that.camera.updateProjectionMatrix()
            that.renderer.setSize(that.width, that.height)
        }, false)

        let last_mouse = { x: 0, y: 0 }

        window.addEventListener("mousemove", function(event) {

            that.mouse.x = (event.clientX / that.width - .5) * 2
            that.mouse.y = (event.clientY / that.height - .5) * 2

            let mouse_x = that.mouse.x - last_mouse.x
            let mouse_y = that.mouse.y - last_mouse.y

             if ( that.drag ) {
                that.drag_rotation.x += mouse_x * 1.5
                that.drag_rotation.y += mouse_y * 1.5
                that.drag_rotation.y = Math.min( Math.max( that.drag_rotation.y, -Math.PI/4 ), Math.PI/4)
             }

             last_mouse.x = that.mouse.x
             last_mouse.y = that.mouse.y
          })

          window.addEventListener("mousedown", () => {
            this.drag = true
            this.container.classList.add('dragging')
          })
          window.addEventListener("mouseup", () => {
            this.drag = false
            this.container.classList.remove('dragging')
          })

          document.addEventListener('mousewheel', (e) => {
              const normalized_wheel = normalizeWheel(e)
              let wheel = normalized_wheel.spinY
              this.mouse.z += wheel * -.01
              this.mouse.z = Math.min( Math.max( this.mouse.z, -.4 ), 1)
          })

    }

    init_shaders(){

        let width  = 512
        let height = 512

        let data = this.getSphere( width * height, 128 )
        let texture = new THREE.DataTexture( data, width, height, THREE.RGBFormat, THREE.FloatType, THREE.DEFAULT_MAPPING, THREE.RepeatWrapping, THREE.RepeatWrapping )
        texture.needsUpdate = true

        this.simulationShader = new THREE.ShaderMaterial({

            uniforms: {
                texture: { type: "t", value: texture },
                timer: { type: "f", value: 0},
                frequency: { type: "f", value: 0.01 },
                amplitude: { type: "f", value: 130 },
                maxDistance: { type: "f", value: 250 },
                spread: { type: "f", value: 10 }
            },
            vertexShader: require('../../shaders/simulation.vert'),
            fragmentShader: require('../../shaders/simulation.frag')

        });

        let renderShader = new THREE.ShaderMaterial( {
            uniforms: {
                positions: { type: "t", value: null },
                pointSize: { type: "f", value: 5 },
                color_1: { type: "v3", value: new THREE.Color('#7b4397') },
                color_2: { type: "v3", value: new THREE.Color('#dc2430') }
            },
            vertexShader: require('../../shaders/render.vert'),
            fragmentShader: require('../../shaders/render.frag'),
            transparent: true,
            side:THREE.DoubleSide,
            blending:THREE.AdditiveBlending
        } );

        FBO.init( width,height, this.renderer, this.simulationShader, renderShader )
        this.group.add( FBO.particles )
        this.scene.add( this.group )
        this.group.scale.set(.00001, .00001, .00001,)

    }

    getPoint(v,size) {

            v.x = Math.random() * 2 - 1
            v.y = Math.random() * 2 - 1
            v.z = Math.random() * 2 - 1
            if(v.length()>1)return this.getPoint(v,size)
            return v.normalize().multiplyScalar(size)

    }

    getSphere( count, size ){

            let len = count * 3
            let data = new Float32Array( len )
            let p = new THREE.Vector3()
            for( let i = 0; i < len; i+=3 )
            {
                this.getPoint( p, size )
                data[ i     ] = p.x
                data[ i + 1 ] = p.y
                data[ i + 2 ] = p.z
            }
            return data

    }

    init_sphere(){

      let geometry = new THREE.SphereBufferGeometry( 128, 64, 64 )
      let material = new THREE.ShaderMaterial( {
          vertexShader: require('../../shaders/sphere.vert'),
          fragmentShader: require('../../shaders/sphere.frag')
      } )

      let sphere = new THREE.Mesh( geometry, material )
      this.group.add( sphere )

    }

    update() {

        if (this.simulationShader != undefined) {
            //update simulation
            FBO.update()
            //update mesh
            FBO.particles.rotation.y -= Math.PI / 180 * .05
        }

        if (STORAGE.controls_points != undefined) {
            this.sound.x = STORAGE.controls_points[0].strength
            this.sound.y = STORAGE.controls_points[1].strength
            this.sound.z = STORAGE.controls_points[2].strength
        }

        // camera
        this.direction.subVectors(this.mouse, this.camera_position)
        this.direction.multiplyScalar(.06)
        this.camera_position.addVectors(this.camera_position, this.direction)

        this.sound_direction.subVectors(this.sound, this.sound_position)
        this.sound_direction.multiplyScalar(.7)
        this.sound_position.addVectors(this.sound_position, this.sound_direction)

        this.rotation_direction.subVectors(this.drag_rotation, this.camera_rotation)
        this.rotation_direction.multiplyScalar(.04)
        this.camera_rotation.addVectors(this.camera_rotation, this.rotation_direction)

        // Animation in
        if (this.group != undefined) {
            if (this.flag < 1) {
                this.flag += .008
                let zoom = Math.easing.easeOutQuint(this.flag)
                this.group.scale.set(zoom, zoom, zoom)
                this.group.rotation.y = - zoom * Math.PI * 2
            } else {
                this.group.scale.set(1 + this.camera_position.z, 1 + this.camera_position.z, 1 + this.camera_position.z)
                this.group.rotation.y = this.camera_rotation.x
                this.group.rotation.x = this.camera_rotation.y
            }

        }

        this.time += .003 + (Math.easing.easeInOutQuad(this.sound_position.x) * .4)

        this.simulationShader.uniforms.spread.value = 10 - (this.sound_position.y * 15)
        this.simulationShader.uniforms.timer.value = this.time
        // this.simulationShader.uniforms.frequency.value = .01 + (STORAGE.controls_points[1].strength * .006)

        this.renderer.render(this.scene, this.camera)
    }


}

export default THREE_Controller
