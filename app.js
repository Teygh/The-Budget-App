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

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur){
     sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems : {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget : 0,
    percentage :0

  };
  return {
    addItem : function (type, des, val) {
      var newItem, ID;
      //Create New ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }else{
        ID = 0;
      };
      // Create new item based on 'inc' or 'exp' type
      if(type === 'exp'){
        newItem = new Expense(ID, des, val);
      }else if (type === 'inc') {
        newItem = new Income (ID, des, val)
      } 
      
      //Push it into our data structure
      data.allItems[type].push(newItem);

      //Return the new element
      return newItem;
    },

    calculateBudget : function () {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of income that we spent 
      if (data.totals.inc > 0) {
      data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }else{
        data.percentage = -1;
      }
    },

    getBudget : function () {
      return {
        budget: data.budget,
        totalInc : data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
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
    inputBtn: '.add__btn',
    incomeContainer: '.income__list', 
    expenseContainer: '.expenses__list',
    budgetLabel : '.budget__value',
    incomeLabel : '.budget__income--value',
    expenseLabel : '.budget__expenses--value',
    percentageLabel : '.budget__expenses--percentage'
  };

  return {
    getInput: function () {
      return{
        type        : document.querySelector(DOMStrings.inputType).value, //will be either inc or exp
        description : document.querySelector(DOMStrings.inputDescription).value,
        value       : parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },
    // We need to add the Data (Income & Expense) to the DOM so that it's seen by the user
    addListItem: function (obj, type) {
      var html, newHtml, element;
      if (type === 'inc') {
          element = DOMStrings.incomeContainer;
      // Create HTML Strings with placeholder text
      html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
      }else if (type === 'exp') {
            element = DOMStrings.expenseContainer; 
      html = '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
      };
      // Replace the placeholder test with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);
      
      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
    },

    // We need a method that will clear the placeholders
    clearFields : function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMStrings.inputDescription+ ', ' + DOMStrings.inputValue);

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });

      //We need to set the focus back to Add description once they are all cleared
      fieldsArr[0].focus();
    },

    displayBudget : function (obj) {
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExp;
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage +'%';
      }else{
        document.querySelector(DOMStrings.percentageLabel).textContent = '--';
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

  var updateBudget = function() {

    //1. Calculate the budget
    budgetCtrl.calculateBudget();
    //2. Return the budget
    var budget = budgetCtrl.getBudget();
    //3. Display the Budget on the UI
    UICtrl.displayBudget(budget);
  };

  var ctrlAddItem = function () { 

    // 1. Get the Field Input Data
    var input = UICtrl.getInput();
    
    if (input.description !== "" && !isNaN(input.value) && input.value >0 ) {
        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3. Add item to the U
        UICtrl.addListItem(newItem, input.type);

        // 4. Clear The fields
        UICtrl.clearFields();

        // 5.calculate and update budget
        updateBudget();
    };
    
  };

  return {
    init: function () {
      console.log('Application Started');
      UICtrl.displayBudget({
        budget: 0,
        totalInc : 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventListeners();
    }
  };
}) (budgetController, UIController);

controller.init();