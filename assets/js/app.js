var model = {
  // For local storage use
  // setItem, getItem, removeItem, key, length
  // ex. localStorage.setItem('color', 'red')

  // function taken from MDN docs. It checks if local or session storage is
  // available
  storageAvailable: function(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
  }
}

var octopus = {
  // connection between model and view
  init: function() {

  }

}

var receipeView = {
  init: function() {
    this.render()
  },

  render: function() {
    // Get elements from cookies/local storage

    // Render the receipe
  }
}


$(document).ready(function () {
  views.init();
  new WOW().init();
});
