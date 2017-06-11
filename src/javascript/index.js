import Spotity_search from './components/spotify_search.class.js'
import * as TOOLS from './components/tools.class.js'

let search = new Spotity_search()

var framecounter = new TOOLS.FrameRateUI()

// start animating
animate();

function animate() {
    requestAnimationFrame(animate)

    // Updating components
    search.update()
    framecounter.update()

}

// console.log("YO !");
