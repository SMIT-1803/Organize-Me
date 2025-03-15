document.addEventListener("DOMContentLoaded", () => {
    let apiKeyElement = document.getElementById("apiKey");
    let loginBtn = document.querySelector(".loginBtn");

    loginBtn.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent form from refreshing the page

        let apiKey = apiKeyElement.value.trim();
        if (apiKey) {
            window.localStorage.setItem("theAPI", apiKey);
            window.location.href = "main.html"; // Redirect only if API key is entered
        } else {
            alert("Please enter a valid API Key.");
        }
    });
});
