"use strict";

// Below is a recipe function. This one would be accessed via a database or other storage system
//-----------------------------------------------------------------------------------
function RecipeData() {
  const originalRecipe = {
    name: "Paleo Sponge",
    ingredients: {
      "Coconut flour": 3000,
      "Tapioca flour": 3000,
      "Cocoa Powder": 5000,
      "Baking Soda": 192,
      "Baking Powder": 192,
      "Coconut Sugar": 12800,
      "Coconut Milk": 15000,
      "Coconut Oil": 5000,
      "Raspberry Puree": 5000,
    },
    method:
      "All in method. Add all the dry ingredients in a mixing bowl. " +
      "Slowly add melted Raspberry puree and coconut oil while mixing " +
      "Slowly add coconut milk while mixing. " +
      "Scrape the bowl and make sure there are no lumps in the mix. " +
      "Bake at 170C 15-30min depending on the mould.",
  };
  // Creates a copy of the ingredients object for scaling recipe
  let scaledIngredients = structuredClone(originalRecipe.ingredients);

  return {
    // Adds the weight of the total mix to the original ingredients list (for easy of presenting data)
    init: function () {
      if (!Object.keys(originalRecipe.ingredients).includes("Total mix")) {
        let totalMix = 0;
        Object.values(originalRecipe.ingredients).forEach((amount) => {
          totalMix += amount;
        });
        originalRecipe.ingredients["Total mix"] = totalMix;
        this.resetIngredients();
      }
    },
    // Resets ingredients to the original recipe amounts
    resetIngredients: function () {
      scaledIngredients = structuredClone(originalRecipe.ingredients);
    },
    // Returns the name of the recipe
    getRecipeName: function () {
      return originalRecipe.name;
    },
    // Returns the method of the recipe
    getRecipeMethod: function () {
      return originalRecipe.method;
    },
    // Returns the ingredients object in a 2 dimensional array format
    getRecipeIngredients: function () {
      return Object.entries(scaledIngredients);
    },
    // Takes one parameter called multiplyFactor and scales the recipe according to that
    scaleRecipe: function (multiplyFactor) {
      // This array function checks if once the whole recipe is calculated, if there are any amounts
      // less than 5g. Which can be tricky to weigh up.
      let lessThanFive = Object.entries(scaledIngredients).some((ingredient) => {
        // Grabs the current amount of the ingredient
        let currentAmount = ingredient[1];
        // Calculates the new amount of that ingredient
        let calculatedAmount = currentAmount * multiplyFactor;
        // Checks if new amount is less than 5g
        return calculatedAmount < 5;
      });
      if (lessThanFive) {
        return false;
      } else {
        for (let ingredient of Object.entries(scaledIngredients)) {
          let ingredientName = ingredient[0];
          let currentAmount = ingredient[1];
          let calculatedAmount = currentAmount * multiplyFactor;
          scaledIngredients[ingredientName] = calculatedAmount;
        }
        return true;
      }
    },
  };
}

//---------------------------------------------------------------------------------
// This function updates the HTML on the recipeDiv Div
function updateRecipeDiv(html) {
  const recipeDiv = document.getElementById("recipeDetails");
  recipeDiv.innerHTML = "";
  recipeDiv.innerHTML = html;
}

//---------------------------------------------------------------------------------
// Initialize Event Listeners for the buttons and RecipeData function
function initializeEventListenersAndOthers() {
  // Links the 2 buttons to JS
  const resetButton = document.getElementById("resetButton");
  const printButton = document.getElementById("printButton");
  // Adding EventListeners for the buttons
  resetButton.addEventListener("click", resetPage);
  printButton.addEventListener("click", printRecipe);
  // init function adds 'Total mix' to ingredients list of the recipe
  recipe.init();
}

//---------------------------------------------------------------------------------
// This function displays the recipe in a printable format
function printRecipe(event) {
  // prevents the default behavior
  event.preventDefault();
  // This variable stores the HTML to be displayed
  let recipePrint = "";
  // Sets the title of the recipe
  recipePrint =
    `<h2 style="font-weight:normal"><span style="text-decoration:underline;font-weight:bold">` +
    `Recipe Name</span>: ${recipe.getRecipeName()}</h2><ul style="font-size: 1.2em">`;
  // Finds ingredients and amounts and adds them to the variable as list items
  recipe.getRecipeIngredients().forEach((ingredient) => {
    // Makes the 'Total mix' item bold and rest of them normal
    if (ingredient[0] === "Total mix") {
      recipePrint += `<li style="font-weight: bold">${ingredient[0]
        } - ${Math.round(ingredient[1])}</li>`;
    } else {
      recipePrint += `<li>${ingredient[0]} - ${Math.round(ingredient[1])}</li>`;
    }
  });
  // Adds the method of the recipe to HTML
  recipePrint +=
    `</ul><p><span style="font-weight:bold; text-decoration:underline">Method</span>: ` +
    `${recipe.getRecipeMethod()}</p>`;
  // Prints the recipe on the Div
  updateRecipeDiv(recipePrint);
}

//---------------------------------------------------------------------------------
// This function loads the page again with original recipe details
function resetPage(event) {
  event.preventDefault();
  recipe.resetIngredients();
  console.log("Reset button is pressed");
  displayRecipe(recipe);
}

//---------------------------------------------------------------------------------
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
  let recipePrint = "";
  recipePrint = `<h2>${recipe.getRecipeName()}</h2>` +
    `<h5>(Double click on the quantity to adjust quantity. ` +
    `Everything is in Grams)</h5>`;
  recipePrint += `<table class="recipeCalc">`; // This stores the HTML to be sent to recipeDiv
  // Cycles through the ingredients list
  let ingredients = recipe.getRecipeIngredients();
  ingredients.forEach((ingredient) => {
    let name = ingredient[0]; // grabs the name of the ingredient
    let amount = ingredient[1]; // grabs the amount of the ingredient
    let index = ingredients.indexOf(ingredient); // finds the index of the ingredient
    /* Displays ingredients and amounts in table format. Also adds an ID to input elements
       with 'amount' and index, so that index can be extracted from the ID when events are called.
       2 events are called on the input element. They are 'ondblClick' and 'onkeydown'.
       Also the input elements are set to be readonly. */
    recipePrint +=
      `<tr><td><label for="amount${index}">${name}</label></td><td>` +
      `<input type="number" id="amount${index}" readonly ` +
      `ondblClick="enableInput(this.id)" value="${Math.round(amount)}"` +
      `onkeydown="scaleRecipe(event, this)"></td></tr>`;
  });
  // adds the closing tag of table to html
  recipePrint += "</table>";
  // displays HTML on the div
  updateRecipeDiv(recipePrint);
}

//---------------------------------------------------------------------------------
// This function is called when the input element is double clicked.
// It just removes the readonly attribute from the input element.
function enableInput(id) {
  const input = document.getElementById(id);
  input.removeAttribute("readonly");
}

//---------------------------------------------------------------------------------
// This functions is called when something is being typed in the input element.
function scaleRecipe(event, element) {
  // Checks if the 'Enter' key has been pressed.
  if (event.keyCode === 13) {
    // First argument removes the 'amount' from the 'amount'+'index' of input ID and converts
    // it to integer to use it as the index.
    // Second argument sends the value of the input element to be used as the new amount in the calculation.
    calculateRecipe(parseInt(element.id.slice(6)), element.value);
  }
}

//---------------------------------------------------------------------------------
// This function scales the recipe and stores the new ingredient amount in the 'recipe' object
// by calling 'scaleRecipe()' function
function calculateRecipe(index, newAmount) {
  // Grabs the original ingredient amount of the index location
  let previousAmount = recipe.getRecipeIngredients()[index][1];
  // Calculates the factor in which the whole recipe has to be multiplied by
  let multiplyFactor = newAmount / previousAmount;
  // If there is even one amount that is less than 5g. Reload the last recipe and
  // display a warning message and exit the function.
  if (!recipe.scaleRecipe(multiplyFactor)) {
    alert(
      "Sorry, the amount you entered is too small to be accurately calculated. Please try again."
    );
  }
  displayRecipe(recipe);
}
//---------------------------------------------------------------------------------


// Creates an instance of RecipeData for displaying and scaling ingredient amounts
const recipe = RecipeData();

// Initialize Event Listeners for buttons and recipe object
initializeEventListenersAndOthers();

// Displays the recipe on the page at the start.
displayRecipe(recipe);
