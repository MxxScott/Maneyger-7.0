const spinnerWrapperEl = document.querySelector('.spinner-wrapper');
const expenditure_filter = document.getElementById('filter-expenditures');
const income_filter = document.getElementById('filter-incomes');

function updateFilterStates(inc_count, exp_count) {
  income_filter.disabled = inc_count === 0;
  expenditure_filter.disabled = exp_count === 0;
}

// intro
let intro = document.querySelector('.intro');
let logo = document.querySelector('.logo-header');
let logoSpan = document.querySelectorAll('.logo');

window.addEventListener(`DOMContentLoaded`, ()=>{

    setTimeout(()=>{
        
        logoSpan.forEach((span, idx)=>{
            setTimeout(()=>{
                span.classList.add('active');
            }, (idx + 1) * 400)
        })

        setTimeout(()=>{
            logoSpan.forEach((span, idx)=>{
            
                setTimeout(()=>{
                    span.classList.remove('active');
                    span.classList.add('fade');
                }, (idx + 1) * 50)
            })
        },2000)

        setTimeout(()=>{
            intro.style.opacity = '0';
        },2400)
        
        setTimeout(()=>{
          intro.style.display = 'none';
       },3000)
    },)
    

})

let inc_count = 0;
let exp_count = 0;
updateFilterStates(inc_count, exp_count);

// window.addEventListener('load', () => {
//   setTimeout(() => {
//     spinnerWrapperEl.style.opacity = '0';
//   }, 1000);
  

//   setTimeout(() => {
//     spinnerWrapperEl.style.display = 'none';
//   }, 1300);
// })

class BudgetTracker
{
  
  constructor()
  {
    this._budgetLimit = Storage.getBudgetLimit(1000);
    this._totalBudget = Storage.getTotalBudget(0);
    this._expenditures = Storage.getExpenditures();
    this._incomes = Storage.getIncomes();
    
    //constructor runs immediately when you instantiate the class//

    this._displayBudgetLimit();
    this._displayBudgetTotal();
    this._displayBudgetSpent();
    this._displayBudgetGained();
    this._displayBudgetBalance();
    this._displayBudgetProgress();


    document.getElementById('limit').value = this._budgetLimit;

  }


  //these are public methods//
  
  addExpenditure(expenditure)
  {
    expenditure.date = new Date(); // Set current date
    this._expenditures.push(expenditure);
    this._totalBudget -= expenditure.amount;
    Storage.updateTotalBudget(this._totalBudget);
    Storage.saveExpenditure(expenditure);
    this._displayNewExpenditure(expenditure);
    this._render()
    exp_count++;
    updateFilterStates(inc_count, exp_count);
  }

  addIncome(income)
  {
    income.date = new Date(); // Set current date
    this._incomes.push(income);
    this._totalBudget += income.amount;
    Storage.updateTotalBudget(this._totalBudget);
    Storage.saveIncome(income);
    this._displayNewIncome(income);
    this._render();
    inc_count++;
    updateFilterStates(inc_count, exp_count);
  }

  
  _getLast7Days()
   {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return { today, sevenDaysAgo };
  }

  _calculateWeeklyExpenditure()
 {
    const { sevenDaysAgo } = this._getLast7Days();

    return this._expenditures

      .filter((exp) => new Date(exp.date) >= sevenDaysAgo)

      .reduce((sum, exp) => sum + exp.amount, 0);

  }

  _calculateWeeklyIncome() 
  {
    const { sevenDaysAgo } = this._getLast7Days();

    return this._incomes

      .filter((inc) => new Date(inc.date) >= sevenDaysAgo)

      .reduce((sum, inc) => sum + inc.amount, 0);
  }

  updateWeeklySummary()
   {
    const weeklyExpenditure = this._calculateWeeklyExpenditure();

    const weeklyIncome = this._calculateWeeklyIncome();

    document.getElementById('daily-expenditure').textContent = weeklyExpenditure;

    document.getElementById('daily-income').textContent = weeklyIncome;

    this.updateChart(weeklyExpenditure, weeklyIncome);
  }


  updateDailySummary() 
  {
    const dailyExpenditure = this._expenditures.reduce((sum, exp) => sum + exp.amount, 0);
    const dailyIncome = this._incomes.reduce((sum, inc) => sum + inc.amount, 0);

    document.getElementById('daily-expenditure').textContent = dailyExpenditure;
    document.getElementById('daily-income').textContent = dailyIncome;

    this.updateChart(dailyExpenditure, dailyIncome);
  }

  updateChart(expenditure, income)
  {
    const ctx = document.getElementById('myChart').getContext('2d');
    if (this.myChart) {
        this.myChart.destroy(); // Destroy existing chart before creating a new one
    }
    this.myChart = new Chart(ctx, {
        type: 'bar', // Or 'pie', 'doughnut', etc.
        data: {
            labels: ['Expenditure', 'Income'],
            datasets: [{
                label: 'Daily Summary',
                data: [expenditure, income],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)', // Red for expenditure
                    'rgba(54, 162, 235, 0.8)', // Blue for income
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
  }


  removeExpenditure(id)
  {
    const index = this._expenditures.findIndex((expenditure) => expenditure.id === id);

    if(index !== -1)
    {
      const expenditure = this._expenditures[index];
      this._totalBudget += expenditure.amount;
      Storage.updateTotalBudget(this._totalBudget);
      this._expenditures.splice(index, 1);
      Storage.removeExpenditure(id);
      this._render()
      exp_count--;
      updateFilterStates(inc_count, exp_count);
    }
  }

 

  removeIncome(id)
  {
    const index = this._incomes.findIndex((income) => income.id === id);

    if(index !== -1)
    {
      const income = this._incomes[index];
      this._totalBudget -= income.amount;
      Storage.updateTotalBudget(this._totalBudget);
      Storage.removeIncome(id)
      this._incomes.splice(index, 1);
      this._render()
      inc_count--;
      updateFilterStates(inc_count, exp_count);
    }
  }


  reset()
  {
    this._totalBudget = 0;
    this.expenditures = [];
    this.incomes = [];
    Storage.clearAll();
    this._render();
    location.reload();
  }

  setLimit(budgetLimit)
  {
    this._budgetLimit = budgetLimit;
    Storage.setBudgetLimit(budgetLimit)
    this._displayBudgetLimit();
    this._render();
  }


  loadItems()
  {
    this._expenditures.forEach(expenditure => this._displayNewExpenditure(expenditure));
    this._incomes.forEach(income => this._displayNewIncome(income));
  }


  //private methods//

  _displayBudgetTotal()
  {
    const totalBudgetEl = document.getElementById('budget-total') //el for element
    // totalBudgetEl.innerHTML = this._totalBudget;
    const gainLossTextEl = document.getElementById('gain-loss-text'); // Use the ID

    totalBudgetEl.textContent = this._totalBudget; // Use textContent for better performance here
    totalBudgetEl.style.color = this._totalBudget < 0 ? 'red' : '#1A461A';

    if (this._totalBudget < 0) {
      totalBudgetEl.textContent = `-${Math.abs(this._totalBudget)}`;
      gainLossTextEl.innerText = 'Loss';
    } 
    else if( this._totalBudget > 0 ){
      totalBudgetEl.textContent = `${this._totalBudget}`;
      gainLossTextEl.innerText = 'Gain';
    }
    else{
      totalBudgetEl.textContent = `${this._totalBudget}`;
      totalBudgetEl.style.color = 'white';
      gainLossTextEl.innerText = 'Gain/Loss';
    }
  }


  _displayBudgetLimit()
  {
    const budgetLimitEl = document.getElementById('budget-limit') //el for element
    budgetLimitEl.textContent = this.formatNumber(this._budgetLimit); // Call formatNumber here
  }

  formatNumber(number)
  {
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M'; // Millions
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'K'; // Thousands
    } else {
        return number; // No abbreviation
    }
  }

  _displayBudgetSpent()
  {
    const budgetSpentEl = document.getElementById('budget-spent');

    const spent = this._expenditures.reduce((total,expenditure) => total + expenditure.amount, 0);

    budgetSpentEl.innerHTML = spent;
  }


  _displayBudgetGained()
  {
    const budgetGainedEl = document.getElementById('budget-gained');

    const gained = this._incomes.reduce((total,income) => total + income.amount, 0);

    budgetGainedEl.innerHTML = gained;
  }


  _displayBudgetBalance()
  {
    const budgetBalanceEl = document.getElementById('budget-balance');

    const progressEl = document.getElementById('budget-progress');

    const balance = this._budgetLimit - (this._expenditures.reduce((total,expenditure) => total + expenditure.amount, 0));

    budgetBalanceEl.textContent = this.formatNumber(balance); // Apply formatting here


    if(balance <= 0)
    {
      budgetBalanceEl.parentElement.parentElement.classList.remove('bg-light');//trying to access the parent elements based on the html
      budgetBalanceEl.parentElement.parentElement.classList.add('bg-danger');


      progressEl.classList.add('bg-danger');
      progressEl.classList.remove('bg-sucess');

    }
    else
    {
      budgetBalanceEl.parentElement.parentElement.classList.remove('bg-danger');
      budgetBalanceEl.parentElement.parentElement.classList.add('bg-light');

      progressEl.classList.remove('bg-danger');
      progressEl.classList.add('bg-success');
    }
  }


  _displayBudgetProgress()

  {
    const progressEl = document.getElementById('budget-progress');
    const totalSpent = this._expenditures.reduce((total, expenditure) => total + expenditure.amount, 0);
    const percentage = (totalSpent / this._budgetLimit) * 100;
    const width = Math.min(percentage, 100); // Limit the width to 100%
    
    progressEl.style.width = `${width}%`;
  
    // Change progress bar color based on percentage
    if ( percentage >= 100 ) {
      progressEl.classList.add('bg-danger');
      progressEl.classList.remove('bg-orange');
      progressEl.classList.remove('yellow-green');
      progressEl.classList.remove('bg-success');
      progressEl.classList.remove('bg-yellow');
    } else if( percentage >= 75 ) {
      progressEl.classList.add('bg-orange');
      progressEl.classList.remove('bg-danger');
      progressEl.classList.remove('bg-yellow-green');
      progressEl.classList.remove('bg-yellow');
      progressEl.classList.remove('bg-success');
    } else if( percentage >= 50 ) {
      progressEl.classList.add('bg-yellow');
      progressEl.classList.remove('bg-danger');
      progressEl.classList.remove('bg-orange');
      progressEl.classList.remove('bg-yellow-green');
      progressEl.classList.remove('bg-success');
    } else if ( percentage >= 25 ){
      progressEl.classList.add('bg-yellow-green');
      progressEl.classList.remove('bg-danger');
      progressEl.classList.remove('bg-orange');
      progressEl.classList.remove('bg-yellow');
      progressEl.classList.remove('bg-success');
    } else {
      progressEl.classList.add('bg-success');
      progressEl.classList.remove('bg-danger');
      progressEl.classList.remove('bg-orange');
      progressEl.classList.remove('bg-yellow-green');
      progressEl.classList.remove('bg-yellow');
    }
  }

  _displayNewExpenditure(expenditure)
  {
    const expendituresEl = document.getElementById('expenditure-items');
    const expenditureEl = document.createElement('div');
    expenditureEl.classList.add('card', 'my-2', 'bg-dark' );
    expenditureEl.setAttribute('data-id', expenditure.id);
    expenditureEl.innerHTML = `
      <div class="card-body">
        <div class="d-flex align-items-center justify-content-between">
          <h4 class="mx-1">${expenditure.name}</h4>
                 <div
                   class="fs-1 bg-primary text-white text-center rounded-2 px-2 px-sm-5"
                 >
                  ${expenditure.amount}
                 </div>
                    <button class="delete btn btn-danger btn-sm mx-2">
                      <i class="material-icons">delete</i>
                    </button>
        </div>
      </div>
    `;
    expendituresEl.appendChild(expenditureEl);
  }

  _displayNewIncome(income)
  {
    const incomesEl = document.getElementById('income-items');
    const incomeEl = document.createElement('div');
    incomeEl.classList.add('card', 'my-2', 'bg-dark');
    incomeEl.setAttribute('data-id', income.id);
    incomeEl.innerHTML = `
      <div class="card-body">
        <div class="d-flex align-items-center justify-content-between">
          <h4 class="mx-1">${income.name}</h4>
                 <div
                   class="fs-1 bg-secondary text-white text-center rounded-2 px-2 px-sm-5"
                 >
                  ${income.amount}
                 </div>
                    <button class="delete btn btn-danger btn-sm mx-2">
                      <i class="material-icons">delete</i>
                    </button>
        </div>
      </div>
    `;
    incomesEl.appendChild(incomeEl);
  }
  _render() 
  {
    this._displayBudgetTotal();
    this._displayBudgetSpent();
    this._displayBudgetGained();
    this._displayBudgetBalance();
    this._displayBudgetProgress();
    this.updateDailySummary();
  }
}

  class Expenditure 
{ 
    constructor(name,amount)

    {
      this.id = Math.random().toString(16).slice(2);
      this.name = name;
      this.amount = amount;
      this.date = new Date(); // Store the creation date
    }  
    
}

  class Income 
{ 
    constructor(name,amount)

    {
      this.id = Math.random().toString(16).slice(2);
      this.name = name;
      this.amount = amount;
      this.date = new Date(); // Store the creation date
    }  


}

class Storage
{
  //not static cause it is not one entity
  static getBudgetLimit(defaultLimit = 200)
  {
    let budgetLimit;
    if(localStorage.getItem('budgetLimit') === null)
    {
      budgetLimit = defaultLimit;
    }
    else
    {
      budgetLimit = +localStorage.getItem('budgetLimit');
    }
    return budgetLimit;
  }
  static setBudgetLimit(budgetLimit)
  {
    localStorage.setItem('budgetLimit', budgetLimit);
  }

  static getTotalBudget(defaultBudget = 0)
  {
    let totalBudget;
    if(localStorage.getItem('totalBudget') === null)
    {
      totalBudget = defaultBudget;
    }
    else
    {
      totalBudget = +localStorage.getItem('totalBudget');
    }
    return totalBudget;
  }

  static updateTotalBudget(budget)
  {
    localStorage.setItem('totalBudget',budget)
  }

  static getExpenditures()
  {
    let expenditures;
    if(localStorage.getItem('expenditures') === null)
    {
      expenditures = [];
    }
    else
    {
      expenditures = JSON.parse(localStorage.getItem('expenditures'));
    }
    return expenditures;
  }


  static saveExpenditure(expenditure)
  {
    const expenditures = Storage.getExpenditures();
    expenditures.push(expenditure);
    localStorage.setItem('expenditures', JSON.stringify(expenditures));
  }

  static removeExpenditure(id)
  {
    const expenditures = Storage.getExpenditures();
    expenditures.forEach((expenditure, index) =>
    {
      if (expenditure.id=== id)
      {
        expenditures.splice(index, 1)
      }
    });

    //we are going outside the forEach to save to the local storage without that meal
    localStorage.setItem('expenditures', JSON.stringify(expenditures))
  }

  static getIncomes()
  {
    let incomes;
    if(localStorage.getItem('incomes') === null)
    {
      incomes = [];
    }
    else
    {
      incomes = JSON.parse(localStorage.getItem('incomes'));
    }
    return incomes;
  }

  static saveIncome(income)
  {
    const incomes = Storage.getIncomes();
    incomes.push(income);
    localStorage.setItem('incomes', JSON.stringify(incomes));
  }

  static  removeIncome(id)
  {
    const incomes = Storage.getIncomes();
    incomes.forEach((income, index) =>
    {
      if (income.id=== id)
      {
        incomes.splice(index, 1)
      }
    });

    //we are going outside the forEach to save to the local storage without that Workout
    localStorage.setItem('incomes', JSON.stringify(incomes));
  }

  static clearAll()
  {
    
    localStorage.removeItem('totalBudget');
    localStorage.removeItem('expenditures');
    localStorage.removeItem('incomes');

    //if you want to clear the limit
    // localStorage.clear();
  }

}


class App
{
  constructor()
  
   {
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'block'; // Show spinner immediately

    this._tracker  = new BudgetTracker();
    this._loadEventListeners()
    this._tracker.loadItems();
    spinner.style.display = 'none';

    setTimeout(() => {
      spinner.classList.remove('show');
    }, 500); // Adjust delay as needed
  }


  _loadEventListeners()
  {

    document.getElementById('expenditure-form')
    .addEventListener('submit', this._newExpenditure.bind(this)); //with bind, we can create parameters and pass in arguments

    document.getElementById('income-form')
    .addEventListener('submit', this._newIncome.bind(this, ));

    document.getElementById('expenditure-items')
    .addEventListener('click', this._removeItem.bind(this, 'expenditure'));


    document.getElementById('income-items')
    .addEventListener('click', this._removeItem.bind(this, 'income'));


    
    document.getElementById('filter-expenditures')
    .addEventListener('keyup', this._filterItems.bind(this, 'expenditure'));

    document.getElementById('filter-incomes')
    .addEventListener('keyup', this._filterItems.bind(this, 'income'));


    document.getElementById('reset')
    .addEventListener('click', this._reset.bind(this));


    document.getElementById('limit-form')
    .addEventListener('submit', this._setLimit.bind(this));

    document.getElementById('summaryType').addEventListener('change', (e) =>
      {
        const selectedType = e.target.value;
      
        if (selectedType === 'daily') 
        {
          app._tracker.updateDailySummary();
        } else if (selectedType === 'weekly')
         {
          app._tracker.updateWeeklySummary();
        }
      });

    document.querySelector('[data-bs-target="#collapse-expenditure"]').addEventListener('click', this._scrollToBottom.bind(this));

    document.querySelector('[data-bs-target="#collapse-income"]').addEventListener('click', this._scrollToBottom.bind(this));
  }

    _newExpenditure(e)
    {
      e.preventDefault();

     

      const name = document.getElementById('expenditure-name');

      const amount = document.getElementById('expenditure-amount');

      //validate input

      if (name.value === '' || amount.value === '')
      {
        alert('Please fill in all fields');
        return;
      }
      if( amount.value <= 0 ){
        alert( 'Please input an amount greater than 0' );
        return;
      }


      // Check if name contains a number
      if (/\d/.test(name.value)) 
      {
        alert('Item name should not contain numbers');
       return;
      }


      const expenditure = new Expenditure(name.value, parseInt(amount.value));

      this._tracker.addExpenditure(expenditure);
    
      name.value = '';
      amount.value = '';

      //collapsing the section

      const collapseExpenditure = document.getElementById('collapse-expenditure');

      const bsCollapse = new bootstrap.Collapse(collapseExpenditure, 
        {
          toggle: true
        }
      )
      this._tracker.updateDailySummary(); // Add here
    }


  
    _newIncome(e)
    {
      e.preventDefault();

     

      const name = document.getElementById('income-name');

      const amount = document.getElementById('income-amount');

      //validate input

      if (name.value === '' || amount.value === '')
      {
        alert('Please fill in all fields');
        
        return;
      }
      if( amount.value <= 0 ){
        alert( 'Please input an amount greater than 0' );
        return;
      }

       // Check if name contains a number
       if (/\d/.test(name.value))
      {
      alert('Item name should not contain numbers');

      return;
      }

      const income = new Income(name.value, parseInt(amount.value));

      this._tracker.addIncome(income);
    
      name.value = '';
      amount.value = '';

  
      const collapseIncome = document.getElementById('collapse-income');

      const bsCollapse = new bootstrap.Collapse(collapseIncome, 
        {
          toggle: true
        }
      )
      this._tracker.updateDailySummary(); // Add here
    }

    _removeItem(type, e) {
      //More efficient selector, targets the closest ancestor with the card class.
      const closestCard = e.target.closest(`#${type}-items > .card`); 

      if (closestCard) { //Check if it's actually a card element.
        if (confirm('Are you sure?')) {
          const id = closestCard.dataset.id; //More efficient way to get dataset.
          type === 'expenditure'
            ? this._tracker.removeExpenditure(id)
            : this._tracker.removeIncome(id);
          closestCard.remove();
        }
      }
      this._tracker.updateDailySummary(); // Add here
    }

    _filterItems(type, e)
    {
      const text = e.target.value.toLowerCase();
      document.querySelectorAll(`#${type}-items .card`).forEach(item =>
      {
        const name = item.firstElementChild.firstElementChild.textContent;

        if (name.toLowerCase().indexOf(text) !== -1)
        {
          item.style.display = 'block';
        }
        else
        {
          item.style.display = 'none'
        }
      }
      )
    }


    _reset()
    {
     


      this._tracker.reset();
      document.getElementById('expenditure-items').innerHTML = '';

      document.getElementById('income-items').innerHTML = '';

      document.getElementById('filter-expenditures').value = '';

      document.getElementById('filter-incomes').value = '';
    }



    _setLimit(e) {
      e.preventDefault();
    
      const limitInput = document.getElementById('limit'); // Use more descriptive variable name
    
      if (limitInput.value === '') {
        alert('Please add a limit');
        return;
      }
    
      const newLimit = parseFloat(limitInput.value); // Parse as float for potential decimal values
    
      if (isNaN(newLimit) || newLimit <= 0) { // Validate input further
        alert('Please enter a valid positive number for the budget limit.');
        return;
      }
    
      this._tracker.setLimit(newLimit);
      limitInput.value = ''; // Clear the input field
    
      const modalEl = document.getElementById('limit-modal');
      const modal = bootstrap.Modal.getInstance(modalEl); // Get instance correctly
      modal.hide(); // Hide the modal
    }

    _scrollToBottom() {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
}

const app = new App()
/*
const tracker = new BudgetTracker();

const breakfast = new Expenditure('Breakfast', 500);

const lunch = new Expenditure('lunch', 5550);
tracker.addExpenditure(breakfast);
tracker.addExpenditure(lunch);

const run = new Income('Morning Run', 400);


tracker.addIncome(run);

console.log(tracker._expenditures);

console.log(tracker._incomes);

console.log(tracker._totalBudget);

//console.log(Math.random()).toString(16).slice(2);


*/


//Just some notes:: we add, we add, we display, we load, and then we reuse"*/