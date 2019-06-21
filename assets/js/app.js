var model = {
  elements: [],
  default_salt: 3,
  default_motherYeast: 3,
  default_freshYeast: 0.03,
  default_dryYeast: 0.01,
  default_oil: 1,
  default_allowance: true,
  default_allowance_quantity: 20
}

var octopus = {
  // connection between model and view
  init: function() {

  },

  // For local storage use
  // setItem, getItem, removeItem, key, length, Storage.clear()
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
  },

  getObjectProperties: function() {
    var inputs = $('.input, .checkbox-input');
    var properties = [];
    $.each(inputs, function(index, elem) {
      var obj = {}
      obj.name = elem.name;
      if (elem.type === 'checkbox'){
        obj.value = elem.checked;
      } else {
        obj.value = elem.value;
      }
      // obj[elem.name] = elem.value;
      properties.push(obj);
    });
    model.elements = properties;
    return properties;
  },

  getSettings: function() {
    // Use this function to get previous settings from localStorage

    // Check if there is something in the storage
    if (localStorage.length > 0) {

    }
  },

  populateStorage: function() {
    // Use this function to save settings in local storage
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
  receipeView.init();
  new WOW().init();
});
