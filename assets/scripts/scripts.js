document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("foodList");
    const emptyListDiv = document.getElementById("emptyList");
    const cursorElement = document.querySelector(".cursor");
    const footer = document.querySelector("footer");
    const catGifContainer = document.getElementById("catGifContainer");
    const paginationContainer = document.getElementById("paginationContainer");
    const paginationControls = document.getElementById("paginationControls");

    // Pagination variables
    let currentPage = 1;
    const itemsPerPage = 10;
    let currentFoodList = [];

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
            updateAverageRating(data);
            setupAIPrompt(data);
        })
        .catch(error => console.error("Error fetching data:", error));


    // Function to display the food list with pagination
    function displayFoodList(foodList, page = 1) {
        currentFoodList = foodList;
        currentPage = page;
        
        const ratingSort = document.getElementById("ratingSort").value;
        if (ratingSort === "asc") {
            foodList.sort((a, b) => a.rating - b.rating);
        } else if (ratingSort === "desc") {
            foodList.sort((a, b) => b.rating - a.rating);
        }

        // Calculate pagination
        const totalItems = foodList.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
        const paginatedList = foodList.slice(startIndex, endIndex);

        // Clear container
        container.innerHTML = "";

        // Loop through the paginated foodList array and create HTML elements for each item
        for (let i = 0; i < paginatedList.length; i += 2) {
            // Create a row container for each pair of cards
            const row = document.createElement("div");
            row.className = "row row-cols-1 row-cols-md-2 g-4";

            for (let j = 0; j < 2 && i + j < paginatedList.length; j++) {
                const item = paginatedList[i + j];

                // Create the card column
                const col = document.createElement("div");
                col.className = "col-md-6";

                // Create the card
                const card = document.createElement("div");
                card.className = "card h-100";

                // Display images in a carousel
                const carouselContainer = document.createElement("div");
                carouselContainer.id = "carouselExampleControls" + Math.floor(Math.random() * 1000); // Unique ID for each carousel
                carouselContainer.className = "carousel slide card-img-top";

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
                            <span class="visually-hidden">Prev</span>
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

        // Generate pagination controls
        generatePaginationControls(totalPages);
    }


    // Function to generate pagination controls
    function generatePaginationControls(totalPages) {
        paginationControls.innerHTML = "";
        
        if (totalPages <= 1) {
            paginationContainer.style.display = "none";
            return;
        }
        
        paginationContainer.style.display = "block";

        // Previous button
        const prevLi = document.createElement("li");
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        const prevLink = document.createElement("a");
        prevLink.className = "page-link";
        prevLink.href = "#";
        prevLink.textContent = "Prev";
        prevLink.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                displayFoodList(currentFoodList, currentPage - 1);
            }
        });
        prevLi.appendChild(prevLink);
        paginationControls.appendChild(prevLi);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            const link = document.createElement("a");
            link.className = "page-link";
            link.href = "#";
            link.textContent = i;
            link.addEventListener("click", (e) => {
                e.preventDefault();
                displayFoodList(currentFoodList, i);
            });
            li.appendChild(link);
            paginationControls.appendChild(li);
        }

        // Next button
        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        const nextLink = document.createElement("a");
        nextLink.className = "page-link";
        nextLink.href = "#";
        nextLink.textContent = "Next";
        nextLink.addEventListener("click", (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                displayFoodList(currentFoodList, currentPage + 1);
            }
        });
        nextLi.appendChild(nextLink);
        paginationControls.appendChild(nextLi);
    }

    function noFoodData(filteredFoodList) {
        if (filteredFoodList.length === 0) {
            emptyListDiv.style.display = "block";
            catGifContainer.style.display = "none";
            footer.style.display = "none";
            paginationContainer.style.display = "none";
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
        paginationContainer.style.display = "none";
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

                displayFoodList(filteredFoodList, 1);
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

            displayFoodList(filteredFoodList, 1);
        });


        // Add an event listener to the rating sort dropdown
        document.getElementById("ratingSort").addEventListener("change", function () {
            container.innerHTML = "";
            displayFoodList(currentFoodList.length > 0 ? currentFoodList : foodList, 1);
        });


        document.getElementById("clearButton").addEventListener("click", function() {
            checkboxes.forEach(checkbox => {
                checkbox.style.backgroundColor = "#fff";
                checkbox.checked = false;
            });
        
            document.getElementById("searchBar").value = "";
            document.getElementById("ratingSort").value = "";
        
            container.innerHTML = "";
            displayFoodList(foodList, 1);
        });
    }

    function updatePlacesReviewed(foodList) {
        const placesReviewedSpan = document.getElementById("placesReviewed");
        placesReviewedSpan.textContent = countReviewedPlaces(foodList);
    }

    function updateAverageRating(foodList) {
        const averageRatingSpan = document.getElementById("averageRating");
    
        const validRatings = foodList
            .map(item => Number(item.rating))
            .filter(rating => !isNaN(rating));
    
        const totalRating = validRatings.reduce((total, rating) => total + rating, 0);
        const averageRating = validRatings.length > 0 ? totalRating / validRatings.length : 0;
    
        averageRatingSpan.textContent = averageRating.toFixed(2);
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

    // AI Prompt functionality
    function setupAIPrompt(foodList) {
        const aiPromptButton = document.getElementById("aiPromptButton");
        const aiPromptModal = new bootstrap.Modal(document.getElementById("aiPromptModal"));
        const aiPromptText = document.getElementById("aiPromptText");
        const copyPromptBtn = document.getElementById("copyPromptBtn");

        // Generate the AI prompt with all restaurant data
        function generateAIPrompt() {
            const reviewedPlaces = foodList.filter(item => !item.category.includes("PENDING"));
            
            let prompt = `I'm looking for restaurant recommendations in Dublin! Here's a comprehensive list of ${reviewedPlaces.length} restaurants with detailed reviews and ratings (out of 10). Please analyse this data and recommend the best places based on my preferences and make sure to be concise. Include the Google Maps link for each restaurant and if you suggest a restaurant not from this list, please mention it.

RESTAURANT DATA:
================

`;

            reviewedPlaces.forEach((restaurant, index) => {
                const mapsLink = `https://www.google.com/maps/search/${encodeURIComponent(restaurant.place)}`;
                prompt += `${index + 1}. ${restaurant.place}
   Rating: ${restaurant.rating}/10
   Categories: ${restaurant.category.join(", ")}
   Google Maps: ${mapsLink}
   Review: ${restaurant.description.replace(/<[^>]*>/g, '')}
   
`;
            });

            prompt += `
INSTRUCTIONS:
=============
Based on the data above, please help me choose where to eat by:

1. Asking me about my preferences (cuisine type, budget, atmosphere, dietary restrictions, etc.)
2. Explaining why each recommendation fits my preferences
3. Mentioning any special deals or standout dishes mentioned in the reviews
4. Considering the ratings and review quality in your recommendations

Please start by asking me what kind of dining experience I'm looking for today!`;

            return prompt;
        }

        // Show modal and populate prompt when AI button is clicked
        aiPromptButton.addEventListener("click", function() {
            const prompt = generateAIPrompt();
            aiPromptText.value = prompt;
            aiPromptModal.show();
        });

        // Copy to clipboard functionality
        copyPromptBtn.addEventListener("click", function() {
            aiPromptText.select();
            aiPromptText.setSelectionRange(0, 99999); // For mobile devices
            
            try {
                navigator.clipboard.writeText(aiPromptText.value).then(function() {
                    // Success feedback
                    const originalText = copyPromptBtn.innerHTML;
                    copyPromptBtn.innerHTML = "Copied!";
                    copyPromptBtn.style.backgroundColor = "#28a745";
                    
                    setTimeout(function() {
                        copyPromptBtn.innerHTML = originalText;
                        copyPromptBtn.style.backgroundColor = "#f38200";
                    }, 2000);
                }).catch(function() {
                    // Fallback for older browsers
                    document.execCommand('copy');
                    const originalText = copyPromptBtn.innerHTML;
                    copyPromptBtn.innerHTML = "Copied!";
                    copyPromptBtn.style.backgroundColor = "#28a745";
                    
                    setTimeout(function() {
                        copyPromptBtn.innerHTML = originalText;
                        copyPromptBtn.style.backgroundColor = "#f38200";
                    }, 2000);
                });
            } catch (err) {
                // Final fallback
                document.execCommand('copy');
                const originalText = copyPromptBtn.innerHTML;
                copyPromptBtn.innerHTML = "Copied!";
                copyPromptBtn.style.backgroundColor = "#28a745";
                
                setTimeout(function() {
                    copyPromptBtn.innerHTML = originalText;
                    copyPromptBtn.style.backgroundColor = "#f38200";
                }, 2000);
            }
        });
    }
});