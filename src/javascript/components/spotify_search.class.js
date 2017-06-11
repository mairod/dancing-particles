import THREE_Controller from './THREE_Controller.class.js'
import * as TOOLS from './tools.class.js'

class Spotify_search {


    constructor() {

        this.access_token = SETTINGS.spotify.access_token
        this.track = null
        this.audio = null
        this.category = 'artist'

        this.init_event()
        this.init_webgl()

    }

    init_webgl(){
        this.THREE_controller = new THREE_Controller({
            container: document.querySelector('#container')
        })
    }

    init_event(){
        let artist_selector = document.querySelector('.artist')
        let song_selector = document.querySelector('.song')
        let input_container = document.querySelector('.input-container')
        let input = document.querySelector('input')
        let form = document.querySelector('form')
        let more = document.querySelector('.more')

        this.input = input

        artist_selector.addEventListener('click', () => {
            this.category = 'artist'
            artist_selector.classList.add('active')
            song_selector.classList.remove('active')
            input.placeholder = 'Search for an artist'
        })

        song_selector.addEventListener('click', () => {
            this.category = 'track'
            song_selector.classList.add('active')
            artist_selector.classList.remove('active')
            input.placeholder = 'Search for a song'
        })

        input.addEventListener('focusin', ()=> input_container.classList.add('active'))
        input.addEventListener('focusout', ()=> input_container.classList.remove('active'))
        more.addEventListener('click', ()=> {
            document.body.classList.add('active')
            this.analyser.pause()
            more.classList.add('hidden')
            document.querySelector('.infos').classList.add('hidden')
            document.querySelector('.progress').classList.remove('play')
        })

        form.addEventListener('submit', (e)=> {
            e.preventDefault()
            this.get_song(input.value)
            input.value = ''
        })
    }

    get_song(name){

        name = name.toLowerCase().split(" ").join("+")
        let Spotify = require('spotify-web-api-js')
        let spotifyApi = new Spotify()
        spotifyApi.setAccessToken(this.access_token)
        this.track = null
        this.audio = null

        spotifyApi.searchTracks(this.category + ':' + name, {limit: 50, market: 'US'})
          .then((data) => {
            for (let i = 0; i < data.tracks.items.length; i++) {
              this.get_preview(data.tracks.items[i])
            }
            if (this.track == null) {
                this.input.placeholder = this.category.charAt(0).toUpperCase() + this.category.slice(1) + ' not found'
                if (this.category === 'artist') {
                  setTimeout(()=> this.input.placeholder = 'Search for an artist', 1000);
                } else {
                  setTimeout(()=> this.input.placeholder = 'Search for a song', 1000);
                }
            } else {
                this.init_song()
                document.body.classList.remove('active')
                setTimeout(()=> {
                    document.querySelector('.more').classList.remove('hidden')
                    document.querySelector('.infos').classList.remove('hidden')
                }, 1000);
            }
          }, function(err) {
            console.error(err)
        })
    }

    get_preview(track){
        if (track.preview_url != null && this.track == null) {
            this.track = track
        }
    }

    init_song(){
        this.audio = new Audio(this.track.preview_url)
        this.audio.crossOrigin = "anonymous";
        this.init_analyser()

        let cover = document.querySelector('.infos .cover')
        cover.style.backgroundImage = 'url(' + this.track.album.images[0].url + ')'

        let artist = document.querySelector('.artist-name')
        artist.textContent = this.track.artists[0].name

        let song = document.querySelector('.song-name')
        song.textContent = this.track.name

        let album = document.querySelector('.album-name')
        album.textContent = this.track.album.name
    }

    init_analyser(){

        this.analyser = new TOOLS.AudioAnalyzer({
            audioElement: this.audio,
            samplingFrequency: 256,
            debug: false,
            playerUI: true,
            autoplay: false
        })
        this.analyser.hide()

        this.analyser.addControlPoint({ bufferPosition: 10 })
        this.analyser.addControlPoint({ bufferPosition: 45 })
        this.analyser.addControlPoint({ bufferPosition: 80 })
        STORAGE.controls_points = this.analyser.controls

        setTimeout(()=> {
          this.analyser.play()
          document.querySelector('.progress').classList.add('play')
        }, 1000);

    }

    update(){

        this.THREE_controller.update()
        if (this.analyser != undefined) {
            this.analyser.update()
        }

    }

}
export default Spotify_search
