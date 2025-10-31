document.addEventListener("DOMContentLoaded", function () {
    // XSS Protection: Escape HTML special characters
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

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
                        <span class="place-title">${escapeHtml(item.place)}</span>
                        <span class="silly-arrow">➟</span>
                        <span class="rating-title">${escapeHtml(item.rating)}/10</span>
                    </h5>`;

                // Add a badge for each category
                item.category.forEach(cat => {
                    const categoryBadge = document.createElement("span");
                    categoryBadge.className = "badge badge-warning";
                    categoryBadge.textContent = cat;
                    cardBody.appendChild(categoryBadge);
                });

                cardBody.innerHTML += `<p class="card-text">${escapeHtml(item.description)}</p>`;
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








    // ============================================
    // ADMIN INTERFACE FUNCTIONALITY
    // ============================================
    






    // Check if admin mode is enabled via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === 'true';
    
    if (isAdminMode) {
        initializeAdminInterface();
    }
    
    function initializeAdminInterface() {
        const adminInterface = document.getElementById('adminInterface');
        const tokenSetup = document.getElementById('tokenSetup');
        const restaurantForm = document.getElementById('restaurantForm');
        const exitAdminBtn = document.getElementById('exitAdminBtn');
        const saveTokenBtn = document.getElementById('saveTokenBtn');
        const githubTokenInput = document.getElementById('githubToken');
        const filterContainer = document.querySelector('.filter-container');
        const heading = document.querySelector('.heading h1');
        
        // Show admin interface
        adminInterface.style.display = 'block';
        
        // Change heading to ADMIN
        if (heading) {
            heading.textContent = 'ADMIN';
        }
        
        // Hide main content when in admin mode
        container.style.display = 'none';
        emptyListDiv.style.display = 'none';
        catGifContainer.style.display = 'none';
        paginationContainer.style.display = 'none';
        
        // Hide filter/navigation bar
        if (filterContainer) {
            filterContainer.style.display = 'none';
        }
        
        // Check if token exists
        const savedToken = localStorage.getItem('github_token');
        if (savedToken) {
            tokenSetup.style.display = 'none';
            restaurantForm.style.display = 'block';
            setupRestaurantForm(savedToken);
        }
        
        // Save GitHub token
        saveTokenBtn.addEventListener('click', function() {
            const token = githubTokenInput.value.trim();
            if (token) {
                localStorage.setItem('github_token', token);
                showStatus('Token saved successfully!', 'success');
                tokenSetup.style.display = 'none';
                restaurantForm.style.display = 'block';
                setupRestaurantForm(token);
            } else {
                showStatus('Please enter a valid token', 'danger');
            }
        });
        
        // Exit admin mode
        exitAdminBtn.addEventListener('click', function() {
            window.location.href = window.location.origin + window.location.pathname;
        });
    }
    
    function setupRestaurantForm(token) {
        // Fetch current data to populate categories
        fetch('assets/data/data.json')
            .then(response => response.json())
            .then(data => {
                populateCategoriesForAdmin(data);
                setupFormHandlers(token, data);
                setupEditMode(token, data);
            })
            .catch(error => {
                showStatus('Error loading restaurant data: ' + error.message, 'danger');
            });
    }
    
    function setupEditMode(token, currentData) {
        const addNewBtn = document.getElementById('addNewBtn');
        const editExistingBtn = document.getElementById('editExistingBtn');
        const searchRestaurant = document.getElementById('searchRestaurant');
        const restaurantSearch = document.getElementById('restaurantSearch');
        const searchResults = document.getElementById('searchResults');
        const restaurantFormContent = document.getElementById('restaurantFormContent');
        const formTitle = document.getElementById('formTitle');
        const submitBtnText = document.getElementById('submitBtnText');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        const form = document.getElementById('addRestaurantForm');
        
        let editingRestaurantIndex = -1;
        
        // Toggle between add and edit modes
        addNewBtn.addEventListener('click', function() {
            searchRestaurant.style.display = 'none';
            restaurantFormContent.style.display = 'block';
            formTitle.textContent = 'Add New Restaurant';
            submitBtnText.textContent = 'Add Restaurant';
            cancelEditBtn.style.display = 'none';
            deleteBtn.style.display = 'none';
            editingRestaurantIndex = -1;
            form.reset();
            document.getElementById('imagePreview').innerHTML = '';
            document.querySelectorAll('.category-check').forEach(cb => cb.checked = false);
            addNewBtn.classList.add('btn-warning');
            addNewBtn.classList.remove('btn-outline-warning');
            editExistingBtn.classList.remove('btn-warning');
            editExistingBtn.classList.add('btn-outline-warning');
        });
        
        editExistingBtn.addEventListener('click', function() {
            searchRestaurant.style.display = 'block';
            restaurantFormContent.style.display = 'none';
            restaurantSearch.value = '';
            searchResults.innerHTML = '';
            editExistingBtn.classList.add('btn-warning');
            editExistingBtn.classList.remove('btn-outline-warning');
            addNewBtn.classList.remove('btn-warning');
            addNewBtn.classList.add('btn-outline-warning');
        });
        
        // Search functionality
        restaurantSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            searchResults.innerHTML = '';
            
            if (searchTerm.length < 2) return;
            
            const matches = currentData.filter(r => 
                r.place.toLowerCase().includes(searchTerm)
            ).slice(0, 10); // Limit to 10 results
            
            if (matches.length === 0) {
                searchResults.innerHTML = '<p class="text-muted">No restaurants found</p>';
                return;
            }
            
            matches.forEach(restaurant => {
                const index = currentData.indexOf(restaurant);
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
                        <div>
                            <strong>${restaurant.place}</strong>
                            <span class="badge badge-warning ms-2">${restaurant.rating}/10</span>
                            <br>
                            <small class="text-muted">${restaurant.category.join(', ')}</small>
                        </div>
                        <button type="button" class="btn btn-sm btn-warning edit-restaurant-btn" data-index="${index}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                `;
                searchResults.appendChild(resultItem);
            });
            
            // Add click handlers to edit buttons
            document.querySelectorAll('.edit-restaurant-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    loadRestaurantForEdit(index, currentData);
                });
            });
        });
        
        function loadRestaurantForEdit(index, data) {
            const restaurant = data[index];
            editingRestaurantIndex = index;
            
            // Switch to form view
            searchRestaurant.style.display = 'none';
            restaurantFormContent.style.display = 'block';
            formTitle.textContent = `Edit: ${restaurant.place}`;
            submitBtnText.textContent = 'Update Restaurant';
            cancelEditBtn.style.display = 'block';
            deleteBtn.style.display = 'block';
            
            // Populate form
            document.getElementById('placeName').value = restaurant.place;
            document.getElementById('rating').value = parseFloat(restaurant.rating);
            document.getElementById('description').value = restaurant.description;
            
            // Check categories
            document.querySelectorAll('.category-check').forEach(cb => {
                cb.checked = restaurant.category.includes(cb.value);
            });
            
            // Show existing images with preview, delete, and reorder options
            displayExistingImages(restaurant.images);
            
            // Store data for update
            form.setAttribute('data-editing-index', index);
        }
        
        function displayExistingImages(images) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.innerHTML = `
                <div class="col-12 mb-3">
                    <strong>Current Images:</strong>
                    <small class="text-muted d-block">Click × to remove, drag to reorder</small>
                </div>
            `;
            
            images.forEach((filename, index) => {
                const col = document.createElement('div');
                col.className = 'col-md-3 col-sm-6 col-6 image-preview-item';
                col.setAttribute('draggable', 'true');
                col.setAttribute('data-image-index', index);
                col.innerHTML = `
                    <img src="assets/img/food/${filename}" class="image-preview-img" alt="${filename}" onerror="this.src='assets/img/food/placeholder.png'">
                    <button type="button" class="image-preview-remove" data-filename="${filename}">×</button>
                    <small class="image-filename">${filename}</small>
                `;
                imagePreview.appendChild(col);
                
                // Remove image handler
                col.querySelector('.image-preview-remove').addEventListener('click', function() {
                    const filenameToRemove = this.getAttribute('data-filename');
                    const updatedImages = images.filter(img => img !== filenameToRemove);
                    displayExistingImages(updatedImages);
                    // Store updated images array
                    window.currentEditingImages = updatedImages;
                });
                
                // Drag and drop handlers
                col.addEventListener('dragstart', handleDragStart);
                col.addEventListener('dragover', handleDragOver);
                col.addEventListener('drop', handleDrop);
                col.addEventListener('dragend', handleDragEnd);
            });
            
            // Store current images array
            window.currentEditingImages = [...images];
        }
        
        let draggedElement = null;
        
        function handleDragStart(e) {
            draggedElement = this;
            this.style.opacity = '0.4';
            e.dataTransfer.effectAllowed = 'move';
        }
        
        function handleDragOver(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            return false;
        }
        
        function handleDrop(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            
            if (draggedElement !== this) {
                const allItems = Array.from(document.querySelectorAll('.image-preview-item[data-image-index]'));
                const draggedIndex = allItems.indexOf(draggedElement);
                const targetIndex = allItems.indexOf(this);
                
                // Reorder the images array
                const images = window.currentEditingImages;
                const [movedItem] = images.splice(draggedIndex, 1);
                images.splice(targetIndex, 0, movedItem);
                
                // Redisplay
                displayExistingImages(images);
            }
            
            return false;
        }
        
        function handleDragEnd(e) {
            this.style.opacity = '1';
        }
        
        cancelEditBtn.addEventListener('click', function() {
            addNewBtn.click(); // Reset to add mode
        });
        
        // Delete functionality
        deleteBtn.addEventListener('click', async function() {
            const restaurant = currentData[editingRestaurantIndex];
            
            if (!confirm(`Are you sure you want to delete "${restaurant.place}"? This cannot be undone!`)) {
                return;
            }
            
            // Double confirmation for safety
            if (!confirm(`FINAL WARNING: Permanently delete "${restaurant.place}"?`)) {
                return;
            }
            
            const originalBtnText = deleteBtn.innerHTML;
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Deleting...';
            
            showStatus('Deleting restaurant...', 'info');
            
            try {
                await deleteRestaurantFromData(token, currentData, editingRestaurantIndex);
                showStatus('✅ Restaurant deleted successfully! Redirecting...', 'success');
                
                // Reload page after 2 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
            } catch (error) {
                showStatus('❌ Error: ' + error.message, 'danger');
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = originalBtnText;
            }
        });
        
        // Return editing index for form submission
        window.getEditingRestaurantIndex = () => editingRestaurantIndex;
        window.setEditingRestaurantIndex = (index) => { editingRestaurantIndex = index; };
    }
    
    function populateCategoriesForAdmin(data) {
        const categoryCheckboxes = document.getElementById('categoryCheckboxes');
        const allCategories = new Set();
        
        // Extract all unique categories
        data.forEach(restaurant => {
            restaurant.category.forEach(cat => {
                if (cat !== 'PENDING') {
                    allCategories.add(cat);
                }
            });
        });
        
        const sortedCategories = Array.from(allCategories).sort();
        
        // Create checkboxes
        sortedCategories.forEach(category => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-sm-12';
            col.innerHTML = `
                <div class="form-check category-checkbox">
                    <input class="form-check-input category-check" type="checkbox" value="${category}" id="cat_${category.replace(/\s+/g, '_')}">
                    <label class="form-check-label" for="cat_${category.replace(/\s+/g, '_')}">
                        ${category}
                    </label>
                </div>
            `;
            categoryCheckboxes.appendChild(col);
        });
        
        // Add new category button handler
        document.getElementById('addCategoryBtn').addEventListener('click', function() {
            const newCategory = document.getElementById('newCategory').value.trim();
            if (newCategory) {
                const col = document.createElement('div');
                col.className = 'col-md-6 col-sm-12';
                col.innerHTML = `
                    <div class="form-check category-checkbox">
                        <input class="form-check-input category-check" type="checkbox" value="${newCategory}" id="cat_${newCategory.replace(/\s+/g, '_')}" checked>
                        <label class="form-check-label" for="cat_${newCategory.replace(/\s+/g, '_')}">
                            ${newCategory}
                        </label>
                    </div>
                `;
                categoryCheckboxes.appendChild(col);
                document.getElementById('newCategory').value = '';
                showStatus('Category added! Make sure to check it.', 'info');
            }
        });
    }
    
    function setupFormHandlers(token, currentData) {
        const form = document.getElementById('addRestaurantForm');
        const imagesInput = document.getElementById('images');
        const imagePreview = document.getElementById('imagePreview');
        let selectedImages = [];
        
        // Image preview handler
        imagesInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            selectedImages = files;
            displayImagePreviews(files);
        });
        
        function displayImagePreviews(files) {
            imagePreview.innerHTML = '';
            files.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const col = document.createElement('div');
                    col.className = 'col-md-3 col-sm-6 col-6 image-preview-item';
                    col.innerHTML = `
                        <img src="${e.target.result}" class="image-preview-img" alt="Preview">
                        <button type="button" class="image-preview-remove" data-index="${index}">×</button>
                    `;
                    imagePreview.appendChild(col);
                    
                    // Remove image handler
                    col.querySelector('.image-preview-remove').addEventListener('click', function() {
                        const idx = parseInt(this.getAttribute('data-index'));
                        selectedImages.splice(idx, 1);
                        displayImagePreviews(selectedImages);
                    });
                };
                reader.readAsDataURL(file);
            });
        }
        
        // Form submission handler
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            const editingIndex = window.getEditingRestaurantIndex ? window.getEditingRestaurantIndex() : -1;
            const isEditing = editingIndex >= 0;
            
            const placeName = document.getElementById('placeName').value.trim();
            const rating = document.getElementById('rating').value;
            const description = document.getElementById('description').value.trim();
            
            // Get selected categories
            const selectedCategories = Array.from(document.querySelectorAll('.category-check:checked'))
                .map(cb => cb.value);
            
            if (selectedCategories.length === 0) {
                showStatus('Please select at least one category', 'danger');
                return;
            }
            
            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Uploading...';
            
            showStatus('Uploading... Please wait.', 'info');
            
            try {
                // Handle images
                let imageFilenames = [];
                
                // Get existing images if editing (use managed images if available)
                const existingImages = isEditing && window.currentEditingImages 
                    ? [...window.currentEditingImages] 
                    : (isEditing ? [...currentData[editingIndex].images] : []);
                
                if (selectedImages.length > 0) {
                    // New images uploaded
                    showStatus(`Uploading ${selectedImages.length} image(s)...`, 'info');
                    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Uploading images (0/${selectedImages.length})`;
                    
                    // Start with existing images if editing
                    if (isEditing && existingImages.length > 0) {
                        imageFilenames = [...existingImages];
                    }
                    
                    // Upload and add new images
                    for (let i = 0; i < selectedImages.length; i++) {
                        const file = selectedImages[i];
                        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Uploading images (${i + 1}/${selectedImages.length})`;
                        const filename = await uploadImageToGitHub(token, file, placeName);
                        imageFilenames.push(filename);
                    }
                } else if (isEditing) {
                    // Keep existing images if editing and no new images uploaded
                    imageFilenames = existingImages;
                } else {
                    // New restaurant with no images
                    imageFilenames.push('placeholder.png');
                }
                
                console.log('Final images array:', imageFilenames); // Debug log
                
                // Create restaurant object
                const restaurantData = {
                    place: placeName,
                    rating: parseFloat(rating).toString(),
                    category: selectedCategories,
                    images: imageFilenames,
                    description: description
                };
                
                // Save to database
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving to database...';
                
                if (isEditing) {
                    showStatus('Updating restaurant in database...', 'info');
                    await updateRestaurantInData(token, restaurantData, currentData, editingIndex);
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Updated!';
                    showStatus('✅ Restaurant updated successfully! Redirecting...', 'success');
                } else {
                    showStatus('Adding restaurant to database...', 'info');
                    await addRestaurantToData(token, restaurantData, currentData);
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
                    showStatus('✅ Restaurant added successfully! Redirecting...', 'success');
                }
                
                // Reset form
                form.reset();
                imagePreview.innerHTML = '';
                selectedImages = [];
                document.querySelectorAll('.category-check').forEach(cb => cb.checked = false);
                
                // Reload page after 2 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
            } catch (error) {
                showStatus('❌ Error: ' + error.message, 'danger');
                // Re-enable button on error
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
    
    // GitHub API Functions
    async function uploadImageToGitHub(token, file, placeName) {
        const timestamp = Date.now();
        const sanitizedName = placeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const extension = file.name.split('.').pop();
        const filename = `${sanitizedName}-${timestamp}.${extension}`;
        
        // Convert file to base64
        const base64 = await fileToBase64(file);
        const content = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        
        const url = `https://api.github.com/repos/ronan-s1/OFFICIAL-DUBLIN-FOOD-HITLIST/contents/assets/img/food/${filename}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Add image for ${placeName}`,
                content: content,
                branch: 'main'
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to upload image: ${error.message}`);
        }
        
        return filename;
    }
    
    async function addRestaurantToData(token, newRestaurant, currentData) {
        // Get current file SHA
        const getUrl = 'https://api.github.com/repos/ronan-s1/OFFICIAL-DUBLIN-FOOD-HITLIST/contents/assets/data/data.json';
        
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        
        if (!getResponse.ok) {
            throw new Error('Failed to fetch current data.json');
        }
        
        const fileData = await getResponse.json();
        const sha = fileData.sha;
        
        // Add new restaurant to data
        currentData.push(newRestaurant);
        
        // Convert to JSON with proper formatting
        const updatedContent = JSON.stringify(currentData, null, 4);
        const base64Content = btoa(unescape(encodeURIComponent(updatedContent)));
        
        // Update file
        const putResponse = await fetch(getUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Add ${newRestaurant.place} to restaurant list`,
                content: base64Content,
                sha: sha,
                branch: 'main'
            })
        });
        
        if (!putResponse.ok) {
            const error = await putResponse.json();
            throw new Error(`Failed to update data.json: ${error.message}`);
        }
        
        return true;
    }
    
    async function updateRestaurantInData(token, restaurantData, currentData, index) {
        // Get current file SHA
        const getUrl = 'https://api.github.com/repos/ronan-s1/OFFICIAL-DUBLIN-FOOD-HITLIST/contents/assets/data/data.json';
        
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        
        if (!getResponse.ok) {
            throw new Error('Failed to fetch current data.json');
        }
        
        const fileData = await getResponse.json();
        const sha = fileData.sha;
        
        // Update restaurant at index
        currentData[index] = restaurantData;
        
        // Convert to JSON with proper formatting
        const updatedContent = JSON.stringify(currentData, null, 4);
        const base64Content = btoa(unescape(encodeURIComponent(updatedContent)));
        
        // Update file
        const putResponse = await fetch(getUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Update ${restaurantData.place} details`,
                content: base64Content,
                sha: sha,
                branch: 'main'
            })
        });
        
        if (!putResponse.ok) {
            const error = await putResponse.json();
            throw new Error(`Failed to update data.json: ${error.message}`);
        }
        
        return true;
    }
    
    async function deleteRestaurantFromData(token, currentData, index) {
        // Get current file SHA
        const getUrl = 'https://api.github.com/repos/ronan-s1/OFFICIAL-DUBLIN-FOOD-HITLIST/contents/assets/data/data.json';
        
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        
        if (!getResponse.ok) {
            throw new Error('Failed to fetch current data.json');
        }
        
        const fileData = await getResponse.json();
        const sha = fileData.sha;
        
        // Store restaurant name before deleting
        const deletedRestaurantName = currentData[index].place;
        
        // Remove restaurant from array
        currentData.splice(index, 1);
        
        // Convert to JSON with proper formatting
        const updatedContent = JSON.stringify(currentData, null, 4);
        const base64Content = btoa(unescape(encodeURIComponent(updatedContent)));
        
        // Update file
        const putResponse = await fetch(getUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Delete ${deletedRestaurantName} from restaurant list`,
                content: base64Content,
                sha: sha,
                branch: 'main'
            })
        });
        
        if (!putResponse.ok) {
            const error = await putResponse.json();
            throw new Error(`Failed to update data.json: ${error.message}`);
        }
        
        return true;
    }
    
    // Utility Functions
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }
    
    function showStatus(message, type) {
        const statusDiv = document.getElementById('statusMessage');
        statusDiv.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // Auto-dismiss after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.innerHTML = '';
            }, 5000);
        }
    }
});