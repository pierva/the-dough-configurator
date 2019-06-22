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
    settingsView.render();
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

  getModelElements: function() {
    return model.elements;
  },

  updateModelElements: function(elements) {
    model.elements = elements;
  },

  setIngredientPercentage: function(key) {
    if (key in model.elements) {
      if (model.elements[key] === ""){
        model.elements[key] = 0;
        return 0;
      } else return parseInt(model.elements[key]);
    } else return 0;
  },

  castToBoolean: function(value){
    if (value.toLowerCase() === 'true'){
      return true;
    } else if (value.toLowerCase() === 'false'){
      return false;
    } return false;
  },

  getIngredientPercentage: function(key) {
    if (key in model.elements) {
      return parseInt(model.elements[key]);
    }
  },

  getSavedSettings: function() {
    // This function gets the saved settings from localStorage

    if (localStorage.length > 0) {
      var keys = settingsView.getObjectProperties();
      var elements = $.map(keys, function(elem) {
        var savedValue = localStorage.getItem(elem.name);
        if (savedValue) {
          if (savedValue === 'true' || savedValue === 'false'){
            model.elements[elem.name] = octopus.castToBoolean(savedValue);
            elem.value = octopus.castToBoolean(savedValue);
          } else {
            model.elements[elem.name] = savedValue;
            elem.value = savedValue;
          }
          settingsView.updateSetting(elem);
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
        var elements = settingsView.getObjectProperties();
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

var settingsView = {

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
      results.balls_total = elems.balls_total;
      results.balls_weight = elems.balls_weight;
      totalPercent += parseInt(elems.hydration);
      totalPercent += octopus.getYeastPercentage(elems.yeast_type);
      results.total_weight = parseInt(elems.balls_total) *
                              parseInt(elems.balls_weight);
      if (elems.allowance) {
        results.total_weight += octopus.setIngredientPercentage('allowance_quantity');
      }
      totalPercent += octopus.setIngredientPercentage('salt');

      results.total_flour = Math.round(results.total_weight*100/totalPercent);
      // this must be last because we need the quantity in gr
      if(elems.oil){
        var oilPercent = octopus.setIngredientPercentage('oil_quantity');
        results.oil = Math.round(results.total_weight * oilPercent/
                                             totalPercent);
      }
      // results

      results.yeast = (results.total_weight *
                       octopus.getYeastPercentage(elems.yeast_type)/
                       totalPercent).toFixed(1);
      var tot_liquids = Math.round(results.total_weight *
                                       parseInt(elems.hydration) / totalPercent);
      results.water = elems.oil ? tot_liquids - results.oil : tot_liquids;
      results.salt = Math.round(results.total_weight *
                                octopus.getIngredientPercentage('salt') /
                                totalPercent);
    }
    return results;
  },

  render: function() {

    // Add event listener on the submit button
    $('#settings-form').submit(function(event) {
      event.preventDefault();
      settingsView.getObjectProperties();
      var receipe = settingsView.calculateReceipe(octopus.getModelElements());
      receipeView.render(receipe);
    });

    //Get saved settins and update the DOM
    octopus.getSavedSettings();
    var receipe = this.calculateReceipe(octopus.getModelElements());
  }
}

var receipeView = {
  render: function(receipe) {
    var $row, $span1, $span2;
    var $receipeWrapper = $('.receipe-wrapper');
    $receipeWrapper.empty();
    $receipeWrapper.append(
      '<span class="receipe-header col-12">(' +
        receipe.balls_total + ' x ' + receipe.balls_weight + ' / ' +
        'Tot.' + receipe.total_weight + 'gr)</span>'
      );
    for (var key in receipe){
      if(key!=='balls_total' && key!=='balls_weight' && key!=='total_weight'){
        if (key === 'total_flour'){
          $span1 = $('<span class="col-8"></span>').text('Total Flour');
        } else {
          $span1 = $('<span class="col-8"></span>').text(key);
        }
        $row = $('<div class="receipe-row row"></div>');
        $span2 = $('<span class="ingredient-quantity"></span>')
        .text(receipe[key] + ' gr');
        $row.append($span1, $span2);
        $receipeWrapper.append($row);
      }
    }
  }
};


$(document).ready(function () {
  octopus.init();
  new WOW().init();
});
