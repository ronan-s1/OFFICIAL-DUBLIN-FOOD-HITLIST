document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("foodList");
    const emptyListDiv = document.getElementById("emptyList");
    const cursorElement = document.querySelector(".cursor");
    const footer = document.querySelector("footer");
    const catGifContainer = document.getElementById("catGifContainer")

    const foodEmojis = ["🍕", "🌮", "🌯", "🍣", "🌭", "🍜", "🍪", "🍦", "🥪", "🍩", "🍝", "🍔", "🥐", "🥞", "🍟", "🍖"];
    foodEmojis.push("🍔")
    let currentIndex = 0;

    // Function to change the cursor emoji
    function changeCursor() {
        const newEmoji = foodEmojis[currentIndex];
        const newCursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:25px;'><text y='50%'>${newEmoji}</text></svg>") 16 0, auto`;
        cursorElement.style.cursor = newCursor;
        currentIndex = (currentIndex + 1) % foodEmojis.length;
    }
    cursorElement.addEventListener("click", changeCursor);


    // switch gif on click
    let gifIndex = 0;
    const gifs = [
        "cat_1.gif",
        "cat_2.gif",
        "cat_3.gif",
        "cat_4.gif",
        "cat_5.gif",
        "cat_6.gif",
        "cat_7.gif",
        "cat_8.gif",
        "cat_9.gif"
    ];

    // Set the src of the catGif element
    let catGif = document.getElementById("catGif")
    catGif.src = "https://foodindublin.com/assets/img/cats/" + gifs[gifIndex];

    catGif.addEventListener("click", function() {
        gifIndex = (gifIndex + 1) % gifs.length;
        catGif.src = "https://foodindublin.com/assets/img/cats/" + gifs[gifIndex];
    });


    // Fetch data from the JSON file
    fetch("assets/data/data.json")
        .then(response => response.json())
        .then(data => {
            // Call a function to display the data
            displayFoodList(data);
            populateCategoryFilter(data);
            updatePlacesReviewed(data);
        })
        .catch(error => console.error("Error fetching data:", error));


    // Function to display the food list
    function displayFoodList(foodList) {
        // const container = document.getElementById("foodList");
        const ratingSort = document.getElementById("ratingSort").value;
        if (ratingSort === "asc") {
            foodList.sort((a, b) => a.rating - b.rating);
        } else if (ratingSort === "desc") {
            foodList.sort((a, b) => b.rating - a.rating);
        }

        // Loop through the foodList array and create HTML elements for each item
        for (let i = 0; i < foodList.length; i += 2) {
            // Create a row container for each pair of cards
            const row = document.createElement("div");
            row.className = "row row-cols-1 row-cols-md-2 g-4";

            for (let j = 0; j < 2 && i + j < foodList.length; j++) {
                const item = foodList[i + j];

                // Create the card column
                const col = document.createElement("div");
                col.className = "col-md-6"; // Bootstrap class for half-width columns

                // Create the card
                const card = document.createElement("div");
                card.className = "card h-100"; // Set height to 100% to fill the row height

                // Display images in a carousel
                const carouselContainer = document.createElement("div");
                carouselContainer.id = "carouselExampleControls" + Math.floor(Math.random() * 1000); // Unique ID for each carousel
                carouselContainer.className = "carousel slide card-img-top";
                carouselContainer.setAttribute("data-bs-ride", "carousel");

                const carouselInner = document.createElement("div");
                carouselInner.className = "carousel-inner";

                item.images.forEach((image, index) => {
                    const carouselItem = document.createElement("div");
                    carouselItem.className = index === 0 ? "carousel-item active" : "carousel-item";

                    const img = document.createElement("img");
                    img.src = `assets/img/food/${image}`;
                    img.className = "d-block w-100";

                    carouselItem.appendChild(img);
                    carouselInner.appendChild(carouselItem);
                });

                if (item.images.length > 1) {
                    // Add previous and next buttons for the carousel
                    carouselContainer.innerHTML += `
                        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselContainer.id}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#${carouselContainer.id}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    `;
                }

                carouselContainer.appendChild(carouselInner);

                // Display information such as place, rating, category, description
                const cardBody = document.createElement("div");
                cardBody.className = "card-body";

                const ratingText = document.createElement("p");
                ratingText.className = "card-text";

                const mapButton = document.createElement("a");
                mapButton.href = "https://www.google.com/maps/search/" + item.place;
                mapButton.className = "map-button btn btn-sm mt-auto";
                mapButton.textContent = "Maps";
                mapButton.target = "_blank";
                mapButton.style.backgroundColor = "#f2992c";
                mapButton.style.color = "white";


                cardBody.innerHTML += `
                    <h5 class="card-title">
                        <span class="place-title">${item.place}</span>
                        <span class="silly-arrow">➟</span>
                        <span class="rating-title">${item.rating}/10</span>
                    </h5>`;

                // Add a badge for each category
                item.category.forEach(cat => {
                    const categoryBadge = document.createElement("span");
                    categoryBadge.className = "badge badge-warning";
                    categoryBadge.textContent = cat;
                    cardBody.appendChild(categoryBadge);
                });

                cardBody.innerHTML += `<p class="card-text">${item.description}</p>`;
                cardBody.appendChild(mapButton);

                card.appendChild(carouselContainer);
                card.appendChild(cardBody);
                col.appendChild(card);
                row.appendChild(col);
            }

            container.appendChild(row);
        }
    }


    function noFoodData(filteredFoodList) {
        if (filteredFoodList.length === 0) {
            emptyListDiv.style.display = "block";
            catGifContainer.style.display = "none";
            footer.style.display = "none";
            return true;
        }
    
        emptyListDiv.style.display = "none";
        catGifContainer.style.display = "block";
        footer.style.display = "block";
        return false;
    }

    function catsOnDemand() {
        emptyListDiv.style.display = "none";
        catGifContainer.style.display = "block";
        footer.style.display = "none";
    }

    // Function to populate the filter dropdown with unique category values
    function populateCategoryFilter(foodList) {
        const categoryDropdownMenu = document.getElementById("categoryDropdownMenu");
        const categories = Array.from(new Set(foodList.flatMap(item => item.category))).sort((a, b) => a.localeCompare(b));

        // console.log(categories)
        categories.forEach(category => {
            const checkboxId = `category-${category}`;
            const listItem = document.createElement("li");
            listItem.className = "dropdown-item";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = "category";
            checkbox.value = category;
            checkbox.id = checkboxId;
            checkbox.className = "form-check-input";
            checkbox.style.marginRight = "5px";
            checkbox.style.padding = "4px";

            const label = document.createElement("label");
            label.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            label.htmlFor = checkboxId;
            label.className = "form-check-label";

            checkbox.addEventListener("click", function() {
                if (this.checked) {
                    this.style.backgroundColor = "#c5761b";
                } else {
                    this.style.backgroundColor = "";
                }
            });

            listItem.appendChild(checkbox);
            listItem.appendChild(label);
            categoryDropdownMenu.appendChild(listItem);
        });

        // Add an event listener to the checkboxes
        const checkboxes = categoryDropdownMenu.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("change", function () {
                // Get all checked checkboxes with the class .form-check-input
                let selectedCategories = Array.from(checkboxes)
                    .filter(checkbox => checkbox.checked)
                    .map(checkbox => checkbox.value);

                // If no checkboxes are checked, default to "all"
                if (selectedCategories.length === 0) {
                    selectedCategories = ["all"];
                }

                // Filter and display the food list based on the selected categories
                const filteredFoodList = selectedCategories.includes("all")
                    ? foodList
                    : foodList.filter(item => {
                        return item.category.some(category => selectedCategories.includes(category));
                    });

                container.innerHTML = "";

                if (noFoodData(filteredFoodList)) {
                    return;
                }

                displayFoodList(filteredFoodList);
            });
            categoryDropdownMenu.addEventListener("click", function(event) {
                event.stopPropagation();
            });
        });


        // Add an event listener to the search bar
        document.getElementById("searchBar").addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            const filteredFoodList = foodList.filter(item => item.place.toLowerCase().includes(searchTerm));
            container.innerHTML = "";

            if (searchTerm === "cats!") {
                catsOnDemand();
                return;
            }

            if (noFoodData(filteredFoodList)) {
                return;
            }

            displayFoodList(filteredFoodList);
        });


        // Add an event listener to the rating sort dropdown
        document.getElementById("ratingSort").addEventListener("change", function () {
            container.innerHTML = "";
            displayFoodList(foodList);
        });


        document.getElementById("clearButton").addEventListener("click", function() {
            checkboxes.forEach(checkbox => {
                checkbox.style.backgroundColor = "#fff";
                checkbox.checked = false;
            });
        
            document.getElementById("searchBar").value = "";
        
            container.innerHTML = "";
            displayFoodList(foodList);
        });
    }

    function updatePlacesReviewed(foodList) {
        const placesReviewedSpan = document.getElementById("placesReviewed");
        placesReviewedSpan.textContent = countReviewedPlaces(foodList);
    }

    // Function to count the reviewed places
    function countReviewedPlaces(foodList) {
        return foodList.reduce((count, item) => {
            if (!item.category.includes("PENDING")) {
                count++;
            }
            return count;
        }, 0);
    }
});