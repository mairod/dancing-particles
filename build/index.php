<?php

$client_id = 'YOUR SPOTIFY API ID';
$client_secret = 'YOUR SPOTIFY API SECRET';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL,            'https://accounts.spotify.com/api/token' );
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1 );
curl_setopt($ch, CURLOPT_POST,           1 );
curl_setopt($ch, CURLOPT_POSTFIELDS,     'grant_type=client_credentials' );
curl_setopt($ch, CURLOPT_HTTPHEADER,     array('Authorization: Basic '.base64_encode($client_id.':'.$client_secret)));

$access_token = curl_exec($ch);

?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <meta property="og:url" content="http://lab.dorianlods.fr/dancing-particles" />
  <meta property="og:title" content="Dancing particles" />
  <meta property="og:description" content="A WebGl Experiment with music and particles" />
  <meta property="og:image" content="assets/screen.png" />
  <title>Dancing particles</title>

  <!-- Webpack Magic -->
  <link rel="stylesheet" href="stylesheet/main.css">
</head>
<body class="active">
    <div class="pop-in active">
        <div class="text">
          <h1>Pick a song</h1>
          <div class="category-container">
            <p class="category artist active">Artist</p>
            <p class="category song">Song</p>
          </div>
          <form class="" action="" method="post">
            <div class="input-container">
              <input type="text" name="song" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Search for an artist">
            </div>
          </form>
          <p class="credits">Search powered by <span>Spotify</span></p>
        </div>
    </div>
    <p class="more hidden">Try another one</p>

    <div id="container">
        <div class="progress"></div>
        <div class="infos hidden">
            <div class="cover"></div>
            <div class="text-container">
              <p class="artist-name"></p>
              <p class="song-name"></p>
              <p class="album-name"></p>
            </div>
        </div>
    </div>

    <!-- Webpack Magic -->
    <script type="text/javascript">
        window.SETTINGS = {
            spotify: JSON.parse('<?php echo $access_token; ?>')
        }
    </script>
    <script src="javascript/bundle.js"></script>
</body>
</html>
