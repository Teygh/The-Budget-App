//------------------------------------------------------------------
// This is were all the math happens
var budgetController = (function () {

  var Expense = function (id, description, value) {
    this.id = id,
    this.description = description,
    this.value = value
  };

  var Income = function (id, description, value) {
    this.id = id,
    this.description = description,
    this.value = value
  };

  var data = {
    allItems : {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    }
  };

  }
}) ();


//-------------------------------------------------------------
// Controls the UI (Interface)
// The UI controller will basically capture the data that has been input. To have these inputs available and usable in the COntroller module, we need it to be returned as an object
var UIController = (function () {
  // We create an Object in here where we have all the strings (ID's & Classes)
  var DOMStrings = {
    inputType: '.add__type',
    inputDescription : '.add__description',
    inputValue : '.add__value',
    inputBtn: '.add__btn'

  }

  return {
    getInput: function () {
      return{
        type        : document.querySelector(DOMStrings.inputType).value, //will be either inc or exp
        description : document.querySelector(DOMStrings.inputDescription).value,
        value       : document.querySelector(DOMStrings.inputValue).value
      };
    },
    getDOMStrings: function () {
      return DOMStrings;
    }
  };

}) ();



//------------------------------------------------------------------
// The overall App Controller
// In the controller Module we call the methods from the other two controllers and basically we tell it what to do.
var controller = (function (budgetCtrl, UICtrl) {
 
  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMStrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
    document.addEventListener('keypress', function (event){
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
      });
  };

  

  var ctrlAddItem = function () { 

    // 1. Get the Field Input Data
    var input = UICtrl.getInput();
    console.log(input);

    // 2. Add the item to the budget controller

    // 3. Add item to the UI


    // 4. Calculate the budget

    // 5. Display the budget on the UI
  };

  return {
    init: function () {
      console.log('Application Started');
      setupEventListeners();
    }
  };
}) (budgetController, UIController);

controller.init();