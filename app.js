
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome) * 100;
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(current, index, array) {
            sum += current.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
          exp: 0,
          inc: 0  
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, description, val) {
            var newItem, ID;

            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }     

            if(type === 'exp') {
                newItem = new Expense(ID, description, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, description, val);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },
        deleteItem: function(type, id) {
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');
            
            if(data.totals.inc > 0) {
                data.budget = data.totals.inc - data.totals.exp;
            } else {
                data.percentage = -1;
            }

            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        },
        calculatePercentages: function() {

            data.allItems.exp.forEach((curr) => {
                current.calculatePercentage();
            })
        },
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            })

            return allPerc;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function() {
            console.log(data);
        }
    }

})();

var UIController = (function() {

    var DOMstrings = {
        inputTypes: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        container: '.container',
        budgetIncome: '.budget__income--value',
        budgetPercentageIncome: '.budget__income--percentage',
        budgetExpense: '.budget__expenses--value',
        budgetpercentageExpenses: '.budget__expenses--percentage',
        budgetValue: '.budget__value',
        itemPercentage: '.item__percentage'
    }

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputTypes).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        getDomstring: function() {
            return DOMstrings;
        },
        addItemToUi: function(obj, type) {
            var html, newHtml, element;

            if(type ==='inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%">';
                html    +='<div class="item__description">%description%</div>';
                html    +='<div class="right clearfix">';
                html    +='<div class="item__value">%value%</div>';
                html    +='<div class="item__delete">';
                html    +='<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>';
                html    +='</div>';
                html    +='</div>';
                html    +='</div>';
            }
            else if(type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%">';
                html    +='<div class="item__description">%description%</div>';
                html    +='<div class="right clearfix">';
                html    +='<div class="item__value">%value%</div>';
                html    +='<div class="item__percentage">21%</div>';
                html    +='<div class="item__delete">';
                html    +='<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>';
                html    +='</div>';
                html    +='</div>';
                html    +='</div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteItemToUi: function(selectorId) {
            var el = document.getElementById(selectorId);

            el.parentNode.removeChild(el);
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.itemPercentage);

            nodeListForeach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '----';
                }
            })
        },
        clearFields: function() {
            var fields;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetValue).textContent = obj.budget;
            document.querySelector(DOMstrings.budgetIncome).textContent = obj.totalInc;
            document.querySelector(DOMstrings.budgetExpense).textContent = obj.totalExp;
            document.querySelector(DOMstrings.budgetpercentageExpenses).textContent = obj.percentage;
        }
    };
})();



var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var dom = UICtrl.getDomstring();

        document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);
    }

    var updateBudget = function() {
        var dom = UICtrl.getDomstring();

        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget();

        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {
        
        budgetCtrl.calculatePercentages();

        var percentages = budgetCtrl.getPercentages();

        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;

        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {

            newItem = budgetController.addItem(input.type, input.description, input.value);

            UICtrl.addItemToUi(newItem, input.type);

            UICtrl.clearFields();
        }

        updateBudget();

    }

    var ctrlDeleteItem = function(event) {
        var itemId, splitId;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            budgetCtrl.deleteItem(type, id);

            UICtrl.deleteItemToUi(itemId);

            updateBudget();

        }
    }

    return {
        init: function() {
            console.log('Application has started');
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();
