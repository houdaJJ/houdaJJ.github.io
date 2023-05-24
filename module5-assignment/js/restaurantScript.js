$(function () { //same as document.addEventListener ("domcontentloaded"...
	//same as document.querySleector("#navbarToggle").addEventListener("blur", functio...")
	//dollar sign also serves as querySelector
	$(".navbar-toggler").blur(function (event) {
		var screenWidth = window.innerWidth;
		if (screenWidth < 768) {
			$(".navbar-collapse").collapse('hide');
		}
	});
});


(function (global) {
	var dc = {} //dc = david chu's - connects to function we invoked in home-snippet
	//loadMenuItems will be a property of dc, and will be a function

	var homeHtml = "snippets/home-snippet.html";
	//url to return all this information as a JSON string
	var allCategoriesUrl = 
	"https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
	var categoriesTitleHtml = "snippets/categories-title-snippet.html";
	var categoryHtml = "snippets/category-snippet.html";
	var menuItemsUrl = 
		"https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
	var menuItemsTitleHtml = "snippets/menu-items-title.html";
	var menuItemHtml = "snippets/menu-item.html";

	//convenience function for inserting innerHtml for 'select'
	var insertHtml = function (selector, html) {
		var targetElem = document.querySelector(selector);
		targetElem.innerHTML = html;
	};//when you pass selector and html u want to insert, it will insert that html for it

	//show loading icon inside element identified by 'selector'.
	var showLoading = function (selector) {
		var html = "<div class = 'text-center'>";
		html += "<img src = 'Images/ajax-loader.gif'></div>";
		insertHtml(selector, html); //the html will now work to display the ajax loader icon into the selector u pick
	};

	//substitues every property name that was in curly braces
	//with the actual property given in the json string with all the info
	//when we first retrieve the snippet, everything will be a string
	var insertProperty = function (string, propName, propValue) {
		var propToReplace = "{{" + propName + "}}";
		//"g" tells it to replace every single {{name or anything here}},
		//not just the first one it sees (we have {{name}} writen multiple times)
		string = string
			.replace(new RegExp(propToReplace, "g"), propValue);
		return string;
	}
		//make menu button active and switch from home button being active
	var switchMenuToActive = function () {
		//remove 'active' from home button
		var classes = document.querySelector("#navHomeButton").className; //gets classes on this element
		classes = classes.replace(new RegExp("active", "g"), "");//replaces 'active class with empty string'
		document.querySelector("#navHomeButton").className = classes; //classes var now has no 'active prop'
		//add active to menu button if not already there
		classes = document.querySelector("#navMenuButton").className;
		if (classes.indexOf("active") == -1) {
			classes += " active";
			document.querySelector("#navMenuButton").className = classes;
		}
	};


	//On page load (before images or css) - when the page loads, this will execute
	//module 5 assignment
	document.addEventListener ("DOMContentLoaded", function (event) {
		//on first load, show home view
		showLoading("#main-content"); //applies the loading gif to the main content section
		$ajaxUtils.sendGetRequest(
			allCategoriesUrl, //url where snippet is sitting
			buildAndShowHomeHtml, true); //process categories url as object
	});

	//builds html for home page based on categories array
	//returned from the server
	function buildAndShowHomeHtml (categories) {
		//load home snippet page
		$ajaxUtils.sendGetRequest(
			homeHtml,
			function (homeHtml) {
				var chosenCategoryShortName = chooseRandomCategory(categories).short_name;
				var homeHtmlToInsertIntoMainPage =
					insertProperty(homeHtml, "randomCategoryShortName", "'"+chosenCategoryShortName+"'");

				insertHtml("#main-content", homeHtmlToInsertIntoMainPage);
			},
		false);
	}

	// Given array of category objects, returns a random category object.
	function chooseRandomCategory (categories) {
  	// Choose a random index into the array (from 0 inclusively until array length (exclusively))
  		var randomArrayIndex = Math.floor(Math.random() * categories.length);

 	 // return category object with that randomArrayIndex
 		return categories[randomArrayIndex];
	}


	//load the menu categories view
	dc.loadMenuCategories = function () {
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(
			allCategoriesUrl,
			buildAndShowCategoriesHTML, true);
	}; //will get the categories info database as an object

	//load the menu items view
	//categoryShort is a short_name for a category
	dc.loadMenuItems = function (categoryShort) {
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(
			menuItemsUrl + categoryShort + ".json",
			buildAndShowMenuItemsHTML
		);
	};
	//builds html for single category page based on data from server
	function buildAndShowMenuItemsHTML (categoryMenuItems) { //uses url for the specific category
		//load title snippet of menu items page
		$ajaxUtils.sendGetRequest(
			menuItemsTitleHtml, //retrieves title snippet
			function (menuItemsTitleHtml) {
				//retrieve single menu item snippet
				$ajaxUtils.sendGetRequest(
					menuItemHtml,
					function (menuItemHtml) {
						switchMenuToActive();
						var menuItemsViewHtml =
							buildMenuItemsViewHtml(categoryMenuItems, //builds page with inserting
													menuItemsTitleHtml,//data from category into
													menuItemHtml);//title and item snippet
						insertHtml("#main-content", menuItemsViewHtml); //inserts built page into maincontent
					},
				false);
			},
		false);
	}

	function buildMenuItemsViewHtml(categoryMenuItems,
									menuItemsTitleHtml,
									menuItemHtml) {

		menuItemsTitleHtml =
			insertProperty(menuItemsTitleHtml,
							"name",
							categoryMenuItems.category.name);
		menuItemsTitleHtml =
			insertProperty(menuItemsTitleHtml,
							"special_instructions",
							categoryMenuItems.category.special_instructions);
		var finalHtml = menuItemsTitleHtml;
		finalHtml += "<section class='row'>";

		//loop over categories
		var menuItems = categoryMenuItems.menu_items;
		var catShortName = categoryMenuItems.short_name;
		for (var i = 0; i < menuItems.length; i++) {
			//insert menu item values
			var html = menuItemHtml;
			html =
				insertProperty(html, "short_name", menuItems[i].short_name); //replace short name
			html =
				insertProperty(html, "catShortName", catShortName); //with actual short name from data
			html = 
				insertItemPrice(html, "price_small", menuItems[i].price_small);
			html =
				insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
			html =
				insertItemPrice(html, "price_large", menuItems[i].price_large);
			html =
				insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
			html =
				insertProperty(html, "name", menuItems[i].name);
			html =
				insertProperty(html, "description", menuItems[i].description);

			//add clearfix after evrey second menu item
			if (i % 2 != 0) {
				html +=
					"<div class='clearfix d-md-block'></div>"
			}

			finalHtml += html;
		}//all values finihsed inserting into html, new setcion is added with them

		finalHtml += "</section>";
		return finalHtml;
	}
	function insertItemPrice(html, priceName, priceValue) {
		if (!priceValue) {//if not specified, replace with empty string
			return insertProperty(html, priceName, "");
		}

		priceValue = "$" + priceValue.toFixed(2);
		html = insertProperty(html, priceName, priceValue);
		return html;
	}

	function insertItemPortionName(html, portionName, portionValue) {
		if (!portionValue) {
			return insertProperty(html, portionName, "");
		}
		portionValue = "(" + portionValue + ")";
		html = insertProperty(html, portionName, portionValue);
		return html;
	}
	//builds HTML for categories page based on data from server
	function buildAndShowCategoriesHTML (categories) {
		//load title snippet of categories page
		$ajaxUtils.sendGetRequest(
			categoriesTitleHtml, //can only make second get request after the first one,
			//so nested get request is needed
			//url for categories title gets passed into function
			function (categoriesTitleHtml) {//returns content in categories title as a string
				//retrieve single category snippet
				$ajaxUtils.sendGetRequest(
					categoryHtml, //url to single category
					function (categoryHtml) { //returns conent in single categories as a string
						switchMenuToActive();
						var categoriesViewHtml =
							buildCategoriesViewHtml(categories,
													categoriesTitleHtml,
													categoryHtml);
						insertHtml("#main-content", categoriesViewHtml);
					}, //categoriesViewHtml is all the html created with the info from the database
					//and ur inserting that into main-content
					false); //html shud not be returned as json if u want content
			},
			false); //dont process html snippets as JSON
	}

	function buildCategoriesViewHtml(categories, //takes the object with all the info that JSON parsed
									categoriesTitleHtml, //takes string format of all data in here
									categoryHtml) { //takes string format of all data in here

		var finalHtml = categoriesTitleHtml; //content in categories-title snippet
		finalHtml += "<section class='row'>"; //inserting row to the title

		//loop over categories
		for (var i = 0; i < categories.length; i++) {//categories turned into object, so loops over
			//insert category values
			var html = categoryHtml; //copies content in category snippet,
			//each time it loops
			var name = "" + categories[i].name;
			var short_name = categories[i].short_name;
			html =
				insertProperty(html, "name", name); //replaces name
				//with actual name value from info database
			html = 
				insertProperty(html,
								"short_name",
								short_name);
			finalHtml += html;
		}

		finalHtml += "</section>";
		return finalHtml;
	}

global.$dc = dc;

})(window);