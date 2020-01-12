//------------------------------------------------------------------
// This is were all the math happens
var budgetController = (function () {

  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
    this.percentage = Math.round((this.value/totalIncome) * 100);
    }else{
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
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

    // This Method is to delete an Item from the data
    // It will be called by the Budget controller
    deleteItem : function (type, id) {
      var ids, index;
      
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);

      }
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

    calculatePercentages: function () {
      data.allItems.exp.forEach(function(cur){
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPerc;
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
    percentageLabel : '.budget__expenses--percentage',
    container : '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber= function(num,type) {
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    
    numSplit = num.split('.');
    
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
     }
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int +'.'+ dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
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
      html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
      }else if (type === 'exp') {
            element = DOMStrings.expenseContainer; 
      html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
      };
      // Replace the placeholder test with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      
      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
    },

    deleteItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
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
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage +'%';
      }else{
        document.querySelector(DOMStrings.percentageLabel).textContent = '--';
      };
      
    },
    displayPercentages : function (percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);



      nodeListForEach(fields, function(current, index){
        if (percentages[index] > 0) {
        current.textContent = percentages[index] + '%';
        }else{
          current.textContent = ' ';
        }
      });
    },

      displayMonth: function () {
        var now,months, month, year;
        var now = new Date();

        months = ['January', 'February', 'March', 'April', 'May', 'June', 'June', 'July', 'August','September', 'October', 'November', 'December'];
        month = now.getMonth();
        year = now.getFullYear();
        document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
      },

      changedType: function () {
        var fields = document.querySelectorAll(
          DOMStrings.inputType + ',' +
          DOMStrings.inputDescription + ',' +
          DOMStrings.inputValue);
        
          nodeListForEach(fields, function(cur){
            cur.classList.toggle('red-focus');
          });

          document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        
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
      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

      document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };



  var updateBudget = function() {

    //1. Calculate the budget
    budgetCtrl.calculateBudget();
    //2. Return the budget
    var budget = budgetCtrl.getBudget();
    //3. Display the Budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {

    //1. Calculate percentages
    budgetCtrl.calculatePercentages();

    //2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    //3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
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

        // 6. Calculate and update percentages
          updatePercentages();
    };
    
  };


    // This function is for deleting the INCOME or Expense Item on the UI 
    // When the x button net to the item is clicked
    var ctrlDeleteItem = function (event) {
      var itemID, splitID, ID;
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
      // In this HTML there no ID anywhere else in the page so 
      // the following If statement works if we return an ID
      if (itemID) {
        //inc-1
        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        //1. Delete the item from the data structure 
        budgetCtrl.deleteItem(type, ID);

        //2. Delete the item from the UI
        UICtrl.deleteItem(itemID);

        //3. Update and show the new budget
        updateBudget();

        //4  Calculate and update percentages
        updatePercentages();
      };

    };

  return {
    init: function () {
      console.log('Application Started');
      UICtrl.displayMonth();
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