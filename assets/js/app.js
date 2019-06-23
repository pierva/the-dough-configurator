var model = {
  "elements": {},
  "default_settings": [
    {
      "name": "balls_total",
      "value": ""
    },
    {
      "name": "balls_weight",
      "value": ""
    },
    {
      "name": "hydration",
      "value": ""
    },
    {
      "name": "yeast_type",
      "value": "motherYeast"
    },
    {
      "name": "salt",
      "value": 3
    },
    {
      "name": "oil",
      "value": false
    },
    {
      "name": "oil_quantity",
      "value": 1
    },
    {
      "name": "allowance",
      "value": true
    },
    {
      "name": "allowance_quantity",
      "value": 20
    },
    {
      "name": "user_motherYeast",
      "value": ""
    },
    {
      "name": "user_freshYeast",
      "value": ""
    },
    {
      "name": "user_dryYeast",
      "value": ""
    },
  ],
  "default_motherYeast": 3,
  "default_freshYeast": 0.03,
  "default_dryYeast": 0.01,
  "user_motherYeast": null,
  "user_freshYeast": null,
  "user_dryYeast":null
}

var octopus = {
  // connection between model and view
  init: function() {
    settingsView.init();
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

  getDefaultSettings: function() {
    return model.default_settings;
  },

  updateModelElements: function(elements) {
    model.elements = elements;
  },

  clearStorage: function(){
    localStorage.clear();
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
            if (elem.name in model){
              model[elem.name] = parseFloat(savedValue);
            }
          }
          settingsView.updateSetting(elem);
          return elem;
        }
      });
      if (this.checkForUserSettings()) {
        settingsView.warnForUserSettings('[name="yeast_type"]', true);
      }
      return elements;
    }
    return false;
  },

  checkForUserSettings: function() {
    if (model.user_motherYeast || model.user_freshYeast || model.user_dryYeast){
      return true;
    } else return false;
  },

  populateStorage: function(elements) {
    // elements is the result of getObjectProperties and it is an array of objs
    try {
      // Clear all values previously saved
      localStorage.clear();

      //Check if localStorage is available
      if (this.storageAvailable("localStorage")) {
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

  setUserYeastConcentration: function(arr) {
    // arr is an array of objects with keys: name and value
    if (arr.length) {
      $.each(arr, function(index, elem) {
        model[elem.name] = elem.value ? parseFloat(elem.value) : null;
      });
      settingsView.showFeedback('#setYeastConc');
      return true;
    }
    settingsView.showFeedback('#setYeastConc', 'failure');
    return false;
  },

  getYeastPercentage: function(type) {
    switch (type) {
      case 'motherYeast':
        if (model.user_motherYeast){
          return model.user_motherYeast;
        }
        return model.default_motherYeast;
        break;
      case 'freshYeast':
        if (model.user_freshYeast){
          return model.user_freshYeast;
        }
        return model.default_freshYeast;
        break;
      case 'dryYeast':
        if (model.user_dryYeast){
          return model.user_dryYeast;
        }
        return model.default_dryYeast;
        break;
    }
  }
}

var settingsView = {

  init: function() {
    // Add event listener on the submit button
    $('#settings-form').submit(function(event) {
      event.preventDefault();
      var elements = settingsView.getObjectProperties();
      var receipe = settingsView.calculateReceipe(octopus.getModelElements());
      settingsView.validator();
      receipeView.render(receipe);
      octopus.populateStorage(elements);
    });

    $('#default').click(function(event) {
      settingsView.restoreDefaultSettings();
      settingsView.validator();
      octopus.clearStorage();
      settingsView.warnForUserSettings('[name="yeast_type"]', false);
    });

    $('.modal-form').on('submit', function(event) {
      event.preventDefault();
      octopus.setUserYeastConcentration(
        settingsView.getUserYeastConcentrations());

      var userSettings = octopus.checkForUserSettings();
      settingsView.warnForUserSettings('[name="yeast_type"]', userSettings);

      // Save in the localStorage
      var elements = settingsView.getObjectProperties();
      octopus.populateStorage(elements);
    });

    this.render();
  },

  showFeedback: function(domElement, type) {
    // this function toggles the success class to the passed domElement
    // domElement must be a valid jQuery selector
    // type is either 'success' or anything else for failure
    type = (typeof type === 'undefined') ? 'success' : type.toLowerCase();
    var className = type === 'success' ? 'bg-success' : 'bg-danger';
    $(domElement).addClass(className).delay(1000).queue(function(next) {
      $(this).removeClass(className);
      next();
    });
  },

  warnForUserSettings: function(domSelector, addOrRemove) {
    // this function will change the border color and width of the input
    if(addOrRemove){
      $(domSelector).addClass('user-settings');
    } else {
      $(domSelector).removeClass('user-settings');
    }
  },

  getUserYeastConcentrations: function() {
    var values = $('.user-yeast').find('input').serialize().split('&');
    var results = [];
    $.each(values, function(index, elem){
      var obj = {}
      var keyVal = elem.split('=');
      obj.name = keyVal[0];
      keyVal[1] !== "" ? obj.value = keyVal[1] : obj.value = null;
      results.push(obj);
    });
    return results;
  },

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

  validator: function(){
    var valid;
    $('.checkbox-input').each(function(){
      var selector = $(this).prop('name') + '_quantity';
      var quantitySpan = $("[name='" + selector + "']");
      if ($(this).prop('checked')) {
        if(quantitySpan.val() === "") {
            quantitySpan.addClass('invalid');
            valid = false;
        } else {
          quantitySpan.removeClass('invalid');
          valid = false;
        }
        return;
      }
      // If it is not checked remove the invalid class
      quantitySpan.removeClass('invalid');
    });
    if (valid){
      $('.invalid').removeClass('invalid');
    }
  },

  updateSetting: function(elem) {
    var $domInput = $("[name='" + elem.name + "']");
    if ($domInput.is(':checkbox')) {
      $domInput.prop('checked', elem.value);
    } else {
      $("[name='" + elem.name + "']").val(elem.value);
    }
  },

  restoreDefaultSettings: function() {
    var elements = octopus.getDefaultSettings();
    $.each(elements, function(index, elem) {
      settingsView.updateSetting(elem);
    });
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
    //Get saved settins and update the DOM
    var settingsAvailable = octopus.getSavedSettings();
    if (settingsAvailable) {
      var receipe = this.calculateReceipe(octopus.getModelElements());
      receipeView.render(receipe);
    }
  }
}


var receipeView = {
  render: function(receipe) {
    var $row, $span1, $span2;
    var $receipeWrapper = $('.receipe-wrapper');
    $receipeWrapper.empty();
    if (!$.isEmptyObject(receipe)) {
      $receipeWrapper.append(
        '<span class="receipe-header col-12">(' +
        receipe.balls_total + ' x ' + receipe.balls_weight + ' / ' +
        'Tot. ' + receipe.total_weight + 'gr)</span>'
      );
    };
    for (var key in receipe){
      if(key!=='balls_total' && key!=='balls_weight' && key!=='total_weight'){
        if (key === 'total_flour'){
          $span1 = $('<span class="col-8 text-capitalize"></span>')
                      .text('Total Flour:');
        } else {
          $span1 = $('<span class="col-8 text-capitalize"></span>')
                      .text(key + ":");
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
});
