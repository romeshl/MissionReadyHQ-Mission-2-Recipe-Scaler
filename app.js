// Below is a recipe object. This one would be accessed via a database or other storage system
const cakeRecipe = {
  name: "Paleo Sponge",
  ingredients: [
    { "Coconut flour": 3000 },
    { "Tapioca flour": 3000 },
    { "Cocoa Powder": 5000 },
    { "Baking Soda": 192 },
    { "Baking Powder": 192 },
    { "Coconut Sugar": 12800 },
    { "Coconut Milk": 15000 },
    { "Coconut Oil": 5000 },
    { "Raspberry Puree": 5000 },
    { "Total mix": 49184 },
  ],
  method:
    "All in method. Add all the dry ingredients in a mixing bowl. " +
    "Slowly add melted Raspberry puree and coconut oil while mixing " +
    "Slowly add coconut milk while mixing. " +
    "Scrape the bowl and make sure there are no lumps in the mix. " +
    "Bake at 170C 15-30min depending on the mould.",
};

// Creates a copy of the recipe for storing scaled ingredient amounts
const recipe = structuredClone(cakeRecipe);

// Grabs the recipeDiv Div for displaying html
const recipeDiv = document.getElementById("recipeDetails");

// Links the 2 buttons to JS
const resetButton = document.getElementById("resetButton");
const printButton = document.getElementById("printButton");

// Adding EventListeners for the buttons
resetButton.addEventListener("click", resetPage);
printButton.addEventListener("click", printRecipe);

// This function displays the recipe in a printable format
function printRecipe(event) {
  // prevents the default behavior
  event.preventDefault();
  // This variable stores the HTML to be displayed
  let recipePrint = "";
  // Sets the title of the recipe
  recipePrint =
    `<h2 style="font-weight:normal"><span style="text-decoration:underline;font-weight:bold">` +
    `Recipe Name</span>: ${recipe.name}</h2><ul style="font-size: 1.2em">`;

  // Finds ingredients and amounts and adds them to the variable as list items
  recipe.ingredients.forEach((ingredient) => {
    // Makes the 'Total mix' item bold and rest of them normal
    if (Object.keys(ingredient)[0] === "Total mix") {
      recipePrint += `<li style="font-weight: bold">${
        Object.keys(ingredient)[0]
      } - ${Math.round(Object.values(ingredient)[0])}</li>`;
    } else {
      recipePrint += `<li>${Object.keys(ingredient)[0]} - ${Math.round(
        Object.values(ingredient)[0]
      )}</li>`;
    }
  });

  // Adds the method of the recipe to HTML
  recipePrint +=
    `</ul><p><span style="font-weight:bold; text-decoration:underline">Method</span>: ` +
    `${recipe.method}</p>`;
  // Clears the Div
  recipeDiv.innerHTML = "";
  // Prints the recipe on the Div
  recipeDiv.innerHTML = recipePrint;
}

// This function loads the page again with original recipe details
function resetPage(event) {
  event.preventDefault();
  displayRecipe(cakeRecipe);
}

// Displays the recipe object data on the web page inside "recipeDetails" Div
// Displays data in the following format
/*
    <h2>recipe name</h2>
    <table>
      <tr>
        <td>ingredient name</td>
        <td>ingredient amount</td>
      </tr>
      .
      .
      .
      <tr>
        <td>Total mix</td>
        <td>Total mix amount</td>
      </tr>
    </table>
*/
function displayRecipe(recipe) {
  // Displays the html
  recipeDiv.innerHTML = "";
  recipeDiv.innerHTML =
    `<h2>${recipe.name}</h2>` +
    `<h5>(Double click on the quantity to adjust quantity. ` +
    `Everything is in Grams)</h5>`;
  let recipeDataHTML = `<table class="recipeCalc">`; // This stores the HTML to be sent to recipeDiv

  // Cycles through the ingredients list
  recipe.ingredients.forEach((ingredient) => {
    let name = Object.keys(ingredient)[0]; // grabs the name of the ingredient
    let amount = ingredient[name]; // grabs the amount of the ingredient
    let index = recipe.ingredients.indexOf(ingredient); // finds the index of the ingredient

    /* Displays ingredients and amounts in table format. Also adds an ID to input elements
       with 'amount' and index, so that index can be extracted from the ID when events are called.
       2 events are called on the input element. They are 'ondblClick' and 'onkeydown'.
       Also the input elements are set to be readonly. */
    recipeDataHTML +=
      `<tr><td><label for="amount${index}">${name}</label></td><td>` +
      `<input type="number" id="amount${index}" readonly ` +
      `ondblClick="enableInput(this.id)" value="${Math.round(amount)}"` +
      `onkeydown="scaleRecipe(event, this)"></td></tr>`;
  });

  // adds the closing tag of table to html
  recipeDataHTML += "</table>";

  // displays HTML on the div
  recipeDiv.innerHTML += recipeDataHTML;
}

// This function is called when the input element is double clicked.
// It just removes the readonly attribute from the input element.
function enableInput(id) {
  const input = document.getElementById(id);
  input.removeAttribute("readonly");
}

// This functions is called when something is being typed in the input element.
function scaleRecipe(e, id) {
  // Checks if the 'Enter' key has been pressed.
  if (e.keyCode === 13) {
    // First argument removes the 'amount' from the 'amount'+'index' of input ID and converts
    // it to integer to use it as the index.
    // Second argument sends the value of the input element to be used as the new amount in the calculation.
    calculateRecipe(parseInt(id.id.slice(6)), id.value);
  }
}

// This function scales the recipe and stores the new ingredient amount in the 'recipe' object
function calculateRecipe(index, newAmount) {
  // Grabs the original ingredient amount of the index location
  let previousAmount = Number(Object.values(recipe.ingredients[index]));
  // Calculates the factor in which the whole recipe has to be multiplied by
  let multiplyFactor = newAmount / previousAmount;
  // This variable is used in checking if any newly calculated amounts is less the 5g
  let lessThanFive = false;

  // This array function checks if once the whole recipe is calculated, if there are any amounts
  // less than 5g. Which can be tricky to weight up.
  lessThanFive = recipe.ingredients.some((ingredient) => {
    // Grabs the current amount of the ingredient
    let currentAmount = Object.values(ingredient)[0];
    // Calculates the new amount of that ingredient
    let calculatedAmount = currentAmount * multiplyFactor;
    // Checks if new amount is less than 5g
    return calculatedAmount < 5;
  });

  // If there is even one amount that is less than 5g. Reload the original recipe and
  // display a warning message and exit the function.
  if (lessThanFive) {
    displayRecipe(cakeRecipe);
    alert(
      "Sorry, the amount you entered is too small to be accurately calculated. Please try again."
    );
    return;
  }
  // Otherwise calculate the new amounts, store them in the recipe.ingredients and display them.
  else {
    recipe.ingredients.forEach((ingredient) => {
      let currentAmount = Object.values(ingredient)[0];
      let calculatedAmount = currentAmount * multiplyFactor;
      // In the []s below grabs the key name from the ingredient and converts it to a string.
      ingredient[Object.keys(ingredient)[0]] = calculatedAmount;
    });
    displayRecipe(recipe);
  }
}

// Displays the recipe on the page.
displayRecipe(recipe);
