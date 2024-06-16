// Arguments
const SEARCH_QUERY_MIN_COUNT = 3; // Minimum number of characters in a search query

// All Search Input Elements
const allSearchElems = document.querySelectorAll(
  ".search_on_type-container[data-identifier='search-speakers-data-elem']"
);
let last_active_input_index = 0; // Track the index of the last active search input element

// Each Search Input Element
allSearchElems.forEach((searchElem, searchElemIndex) => {
  // Search Input Element
  const searchInput = searchElem.querySelector(".search_input > input");

  // Search Button Element
  const searchBtn = searchElem.querySelector(".search_input-anim-btn > button");

  // Searching Loading Element
  const loadingAnimElem = searchElem.querySelector(".search_input-anim-btn");

  // Results Showing Element
  const resultsShowElem = searchElem.querySelector(".input_typed-results > ol");

  let user_still_waiting = false; // Flag to track if user is still waiting for results
  let currentAbortController = null; // AbortController for cancelling ongoing fetch requests

  // Removing Previous results
  removePreviousResults(resultsShowElem);

  // Stop other Search elements from working when this input is clicked
  searchInput.addEventListener("click", () => {
    last_active_input_index = searchElemIndex;
    allSearchElems.forEach((_SE, _i) => {
      if (_i !== searchElemIndex) {
        const input = _SE.querySelector(".search_input > input");
        input.value = "";
        const res = _SE.querySelector(".input_typed-results > ol");
        removePreviousResults(res);
        const btn = _SE.querySelector(".search_input-anim-btn");
        hideLoading(btn);
      }
    });
  });

  let searchQuery = ""; // Track the current search query

  // Start Searching on input event
  searchInput.addEventListener("input", async () => {
    user_still_waiting = true;
    // Searched Query
    searchQuery = searchInput.value.trim();

    // Start Searching
    if (searchQuery.length > 0) {
      // Start Searching Animation
      ShowLoading(loadingAnimElem);

      // If Query qualifies for Search based on minimum character count
      if (searchQuery.length >= SEARCH_QUERY_MIN_COUNT) {
        removePreviousResults(resultsShowElem);

        // Abort the previous request if it exists
        if (currentAbortController) {
          currentAbortController.abort();
        }

        // Create a new AbortController for the current request
        currentAbortController = new AbortController();
        const signal = currentAbortController.signal;

        try {
          // Call Search Function and Get Results asynchronously
          const results = await Search_Query_n_Get_Results(searchQuery, signal);

          // Display the results if the user is still waiting for them
          if (user_still_waiting) {
            updateResults(resultsShowElem, results);
          }

          // Hide Loading Animation on Search Button
          hideLoading(loadingAnimElem);
        } catch (error) {
          if (error.name === "AbortError") {
            // console.log("Previous query aborted");
          } else {
            console.error("Fetch error:", error);
          }
        }
      } else {
        removePreviousResults(resultsShowElem);
      }
    }
    // Stop Searching Animation if query length is 0
    else {
      searchInput.value = "";
      hideLoading(loadingAnimElem);
      removePreviousResults(resultsShowElem);
    }
  });

  // Click event listener on document to clear input and results if clicked outside
  document.addEventListener("click", (event) => {
    if (!allSearchElems[last_active_input_index].contains(event.target)) {
      searchInput.value = "";
      removePreviousResults(resultsShowElem);
      hideLoading(loadingAnimElem);
    }
  });

  // Focusout event listener on input to indicate user is no longer waiting for results
  searchInput.addEventListener("focusout", (e) => {
    user_still_waiting = false;
    e.preventDefault();
  });

  // Click event listener on loading animation to focus input again
  loadingAnimElem.addEventListener("click", () => {
    searchInput.focus();
  });
});

// Function to Remove Previous Results from DOM
function removePreviousResults(resultsShowElem) {
  resultsShowElem.innerHTML = "";
  resultsShowElem.classList.remove("show");
}

// Function to Update Results on DOM
function updateResults(resultsShowElem, results) {
  // Render Results on DOM Element
  resultsShowElem.innerHTML = results;
  resultsShowElem.classList.add("show");
}

// Function to Show Loading Animation
function ShowLoading(btn) {
  if (!btn.classList.contains("loading")) btn.classList.add("loading");
}

// Function to Hide Loading Animation
function hideLoading(btn) {
  btn.classList.remove("loading");
}

// ######
// ######
// ######

// Below is your own Tahir Bai

// ######
// ######
// ######

// Function to Search Queries and Get Results
function Search_Query_n_Get_Results(searchQuery, signal) {
  // Simulated data for speakers, cities, and other parameters
  const speakers = `
    <li>
      <p>Speakers</p>
      <ul>
        <li><a href="#">${searchQuery}</a></li>
        <li><a href="#">${searchQuery}</a></li>
        <li><a href="#">${searchQuery}</a></li>
      </ul>
    </li>
  `;

  const cities = `
    <li>
      <p>Cities</p>
      <ul>
        <li><a href="#">${searchQuery}</a></li>
        <li><a href="#">${searchQuery}</a></li>
        <li><a href="#">${searchQuery}</a></li>
      </ul>
    </li>
  `;

  const others = `
    <li>
      <p>Others</p>
      <ul>
        <li><a href="#">${searchQuery}</a></li>
        <li><a href="#">${searchQuery}</a></li>
        <li><a href="#">${searchQuery}</a></li>
      </ul>
    </li>
  `;

  const result = speakers + cities + others;

  // Simulate asynchronous fetching with a random delay
  return new Promise((resolve, reject) => {
    const delay = Math.random() * 1000;
    const timeoutId = setTimeout(() => {
      resolve(result);
    }, delay);

    // Handle cancellation of the fetch request
    signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
