var model = {
  elements: {},
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
    receipeView.render();
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

  setIngredientPercentage: function(key){
    if (key in model.elements) {
      if (model.elements[key] === ""){
        model.elements[key] = 0;
        return 0;
      } else return parseInt(model.elements[key]);
    } else return 0;
  },

  getSavedSettings: function() {
    // This function gets the saved settings from localStorage

    if (localStorage.length > 0) {
      var keys = receipeView.getObjectProperties();
      var elements = $.map(keys, function(elem) {
        var savedValue = localStorage.getItem(elem.name);
        if (savedValue) {
          model.elements[elem.name] = savedValue;
          elem.value = savedValue;
          receipeView.updateSetting(elem);
          return elem;
        }
      });
      if (elements.length > 0) {
        // Add warning to the user that a receipe has been found
        console.log('We found some settings');
      }
      return elements;
    }
  },

  populateStorage: function() {
    try {
      // Clear all values previously saved
      localStorage.clear();

      //Check if localStorage is available
      if (this.storageAvailable("localStorage")) {
        var elements = receipeView.getObjectProperties();
        $.each(elements, function(index, elem){
          localStorage.setItem(elem.name, elem.value);
        });
        return true;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  },

  getYeastPercentage: function(type){
    switch (type) {
      case 'motherYeast':
        return model.default_motherYeast;
        break;
      case 'freshYeast':
        return model.default_freshYeast;
        break;
      case 'dryYeast':
        return model.default_dryYeast;
        break;
    }
  }
}

var receipeView = {

  getObjectProperties: function() {
    var $inputs = $('.input, .checkbox-input');
    var properties = [];
    var elements = {};
    $.each($inputs, function(index, elem) {
      var obj = {};
      obj.name = elem.name;
      if (elem.type === 'checkbox'){
        obj.value = elem.checked;
        elements[elem.name] = elem.checked;
      } else {
        obj.value = elem.value;
        elements[elem.name] = elem.value;
      }
      properties.push(obj);
    });
    octopus.updateModelElements(elements);
    return properties;
  },

  updateSetting: function(elem) {
    var $domInput = $("[name='" + elem.name + "']");
    if ($domInput.is(':checkbox')) {
      $domInput.prop('checked', elem.value);
    } else {
      $("[name='" + elem.name + "']").val(elem.value);
    }
  },

  calculateReceipe: function(elems) {
    var totalPercent = 100;
    var results = {};
    if (elems.balls_total !== "" && elems.balls_weight !== "" &&
        elems.hydration !== "") {
      totalPercent += parseInt(elems.hydration);
      totalPercent += octopus.getYeastPercentage(elems.yeast_type);
      if(elems.oil && elems.oil_quantity){
        totalPercent += parseInt(elems.oil_quantity);
      }
    }
    results.total_percent = totalPercent;
    return results;
  },

  render: function() {

    // Add event listener on the submit button
    $('#settings-form').submit(function(event) {
      event.preventDefault();
    });

    //Get saved settins and update the DOM
    octopus.getSavedSettings();
    this.calculateReceipe(model.elements);
  }
}


$(document).ready(function () {
  octopus.init();
  new WOW().init();
});
