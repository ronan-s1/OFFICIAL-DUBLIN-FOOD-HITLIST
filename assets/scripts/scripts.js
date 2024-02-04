document.addEventListener("DOMContentLoaded", function () {
    // Fetch data from the JSON file
    fetch("assets/data/data.json")
        .then(response => response.json())
        .then(data => {
            // Call a function to display the data
            displayFoodList(data);
        })
        .catch(error => console.error("Error fetching data:", error));

    // Function to display the food list
    function displayFoodList(foodList) {
        const container = document.getElementById("foodList");

        // Loop through the foodList array and create HTML elements for each item
        for (let i = 0; i < foodList.length; i += 2) {
            // Create a row container for each pair of cards
            const row = document.createElement("div");
            row.className = "row row-cols-1 row-cols-md-2 g-4"; // Bootstrap classes for a grid with two columns

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
                    img.src = `assets/img/${image}`;
                    img.className = "d-block w-100";

                    carouselItem.appendChild(img);
                    carouselInner.appendChild(carouselItem);
                });

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

                carouselContainer.appendChild(carouselInner);

                // Display information such as place, rating, category, description
                const cardBody = document.createElement("div");
                cardBody.className = "card-body";

                // Add a badge for the category
                const categoryBadge = document.createElement("span");
                categoryBadge.className = "badge badge-warning";
                categoryBadge.textContent = item.category;

                // Style the rating to make it stand out
                const ratingText = document.createElement("p");
                ratingText.className = "card-text";
                // ratingText.innerHTML = `<strong>Rating:</strong> ${item.rating}`;

                cardBody.innerHTML += `<h5 class="card-title">${item.place} ⇝ <span class="rating">${item.rating}/10</span></h5>`;
                // cardBody.appendChild(ratingText);
                cardBody.appendChild(categoryBadge);
                cardBody.innerHTML += `<p class="card-text">${item.description}</p>`;

                card.appendChild(carouselContainer);
                card.appendChild(cardBody);
                col.appendChild(card);
                row.appendChild(col);
            }

            container.appendChild(row);
        }
    }
});
