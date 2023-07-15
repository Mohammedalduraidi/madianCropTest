async function fetchData() {
  try {
    const response = await fetch(
      "http://filltext.com/?rows=50&fname={firstName}&Iname={lastName}&category=[%22cat1%22,%22cat2%22,%22cat3%22]&pretty=true"
    );
    const data = await response.json();
    console.log({ data });
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

const itemsPerPage = 5;
let currentPage = 1;
let data = [];

// Fetch filtered data based on the current filter
let filteredData = [];
let currentFilter = "cat1"; // Default filter category

async function renderCards(items) {
  const cardsContainer = document.getElementById("cardsContainer");

  const cardsMarkup = items
    .map(
      (item) => `
        <div class="card">
          <i class="icon"></i>
          <div class="name">${item.fname} ${item.Iname}</div>
          <div class="category">${item.category}</div>
        </div>
      `
    )
    .join("");

  cardsContainer.innerHTML = cardsMarkup;
}

async function renderPage(pageNumber, items) {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = items.slice(startIndex, endIndex);

  renderCards(currentPageItems);
}

async function handlePaginationClick(event) {
  const pageNumber = parseInt(event.target.textContent);

  if (!isNaN(pageNumber)) {
    currentPage = pageNumber;
    renderPage(currentPage, data);

    // Remove 'active' class from all pagination buttons
    const paginationButtons = document.querySelectorAll(
      "#paginationButtons button"
    );
    paginationButtons.forEach((button) => button.classList.remove("active"));

    // Add 'active' class to the clicked pagination button
    event.target.classList.add("active");
  }
}

document
  .getElementById("paginationButtons")
  .addEventListener("click", handlePaginationClick);

function renderPaginationButtons() {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginationButtons = [];

  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      // Set the current page button as active
      paginationButtons.push(`<button class="active">${i}</button>`);
    } else {
      paginationButtons.push(`<button>${i}</button>`);
    }
  }

  document.getElementById("paginationButtons").innerHTML =
    paginationButtons.join("");
}

function renderFilterTabs() {
  const categorySet = new Set(data.map((item) => item.category));
  const filterTabs = document.getElementById("filterTabs");

  const filterTabsMarkup = [...categorySet]
    .map(
      (category) => `
        <button data-category="${category}" ${
        category === currentFilter ? 'class="active"' : ""
      }>${category}</button>
      `
    )
    .join("");

  filterTabs.innerHTML = filterTabsMarkup;
}

async function handleFilterTabClick(event) {
  const selectedCategory = event.target.getAttribute("data-category");
  console.log({ selectedCategory, currentFilter });

  if (selectedCategory && selectedCategory !== currentFilter) {
    currentFilter = selectedCategory;

    // Reset current page to 1
    currentPage = 1;

    // Fetch filtered data based on the current filter
    filteredData = data.filter((item) => item.category === currentFilter);

    if (filteredData.length > 0) {
      renderCards(filteredData);
    } else {
      // Render a message or clear the cards container
      const cardsContainer = document.getElementById("cardsContainer");
      cardsContainer.innerHTML = "<p>No items found.</p>";
      // Remove pagination buttons
      document.getElementById("paginationButtons").innerHTML = "";
    }

    // Remove 'active' class from all filter buttons
    const filterButtons = document.querySelectorAll("#filterTabs button");
    filterButtons.forEach((button) => button.classList.remove("active"));

    // Add 'active' class to the clicked filter button
    event.target.classList.add("active");

    // Update filter tabs
    renderFilterTabs();
    renderPaginationButtons(); // reset pagination
    renderPage(currentPage, filteredData);
  }
}

document
  .getElementById("filterTabs")
  .addEventListener("click", handleFilterTabClick);

(async function () {
  data = await fetchData();
  currentFilter = data[0]?.category ?? "cat1";
  renderFilterTabs();

  // Fetch filtered data based on the current filter
  filteredData = data.filter((item) => item.category === currentFilter);

  renderPaginationButtons();

  renderPage(currentPage, filteredData);
})();
