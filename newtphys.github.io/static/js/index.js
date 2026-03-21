window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}

function initMapOverlayPlayer() {
  var player = document.querySelector('[data-map-player]');
  if (!player) {
    return;
  }

  var playerVideo = document.getElementById('newtphys-map-video');
  var buttons = Array.prototype.slice.call(player.querySelectorAll('.map-toggle-button'));
  var sceneButtons = Array.prototype.slice.call(player.querySelectorAll('.map-scene-button'));

  if (!playerVideo || !buttons.length || !sceneButtons.length) {
    return;
  }

  var activeScenePath = playerVideo.dataset.scenePath || '';

  function buildSceneAssetPath(fileName) {
    return activeScenePath + '/' + fileName;
  }

  function updateButtonState(activeButton) {
    buttons.forEach(function(button) {
      var isActive = button === activeButton;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function updateSceneButtonState(activeButton) {
    sceneButtons.forEach(function(button) {
      var isActive = button === activeButton;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function getActiveMapButton() {
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].classList.contains('is-active')) {
        return buttons[i];
      }
    }

    return buttons[0];
  }

  function setVideoSource(fileName, shouldAutoplay) {
    if (!fileName || !activeScenePath) {
      return;
    }

    playerVideo.dataset.videoFile = fileName;
    var nextSource = buildSceneAssetPath(fileName);
    var normalizedNextSource = nextSource.replace(/^\.\//, '');
    var currentSource = playerVideo.currentSrc || '';

    if (currentSource.endsWith(normalizedNextSource)) {
      if (shouldAutoplay) {
        var resumedPlayPromise = playerVideo.play();
        if (resumedPlayPromise && typeof resumedPlayPromise.catch === 'function') {
          resumedPlayPromise.catch(function() {});
        }
      }
      return;
    }

    playerVideo.src = nextSource;
    playerVideo.load();

    if (shouldAutoplay) {
      var playPromise = playerVideo.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function() {});
      }
    }
  }

  function activateScene(button) {
    updateSceneButtonState(button);
    activeScenePath = button.dataset.scenePath || activeScenePath;
    playerVideo.dataset.scenePath = activeScenePath;
    setVideoSource(getActiveMapButton().dataset.videoFile || '_fps-25_render.mp4', !playerVideo.paused);
  }

  function activateMap(button) {
    updateButtonState(button);
    setVideoSource(button.dataset.videoFile || '_fps-25_render.mp4', !playerVideo.paused);
  }

  buttons.forEach(function(button) {
    button.addEventListener('click', function() {
      activateMap(button);
    });
  });

  sceneButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      activateScene(button);
    });
  });

  var initialSceneButton = player.querySelector('.map-scene-button.is-active') || sceneButtons[0];
  updateSceneButtonState(initialSceneButton);
  activeScenePath = initialSceneButton.dataset.scenePath || '';
  playerVideo.dataset.scenePath = activeScenePath;

  var initialMapButton = getActiveMapButton();
  updateButtonState(initialMapButton);
  playerVideo.dataset.videoFile = initialMapButton.dataset.videoFile || '_fps-25_render.mp4';
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
      slidesToScroll: 1,
      slidesToShow: 3,
      loop: true,
      infinite: true,
      autoplay: false,
      autoplaySpeed: 3000,
    }

    // Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for (var i = 0; i < carousels.length; i++) {
      carousels[i].on('before:show', function() {});
    }

    var interpolationSlider = $('#interpolation-slider');
    var interpolationWrapper = $('#interpolation-image-wrapper');
    if (interpolationSlider.length && interpolationWrapper.length) {
      preloadInterpolationImages();

      interpolationSlider.on('input', function() {
        setInterpolationImage(this.value);
      });
      setInterpolationImage(0);
      interpolationSlider.prop('max', NUM_INTERP_FRAMES - 1);
    }

    bulmaSlider.attach();
    initMapOverlayPlayer();

})
