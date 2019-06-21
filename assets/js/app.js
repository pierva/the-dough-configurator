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

  updateModelElements: function(elements) {
    model.elements = elements;
  },

  getSavedSettings: function() {
    // This function gets the saved settings from localStorage

    if (localStorage.length > 0) {
      var keys = receipeView.getObjectProperties();
      var elements = $.map(keys, function(elem) {
        var savedValue = localStorage.getItem(elem.name);
        if (savedValue) {
          elem.value = savedValue;
          receipeView.updateSetting(elem);
          return elem;
        }
      });
      model.elements = elements;
      return elements;
    }
  },

  populateStorage: function() {
    // Clear all values previously saved
    localStorage.clear();

    try {
      var elements = receipeView.getObjectProperties();
      $.each(elements, function(index, elem){
        localStorage.setItem(elem.name, elem.value);
      });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

}

var receipeView = {
  init: function() {
    this.render()
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
      properties.push(obj);
    });
    octopus.updateModelElements(properties);
    return properties;
  },

  updateSetting: function(elem) {

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
