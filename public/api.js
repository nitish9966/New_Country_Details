document.addEventListener("DOMContentLoaded", () => {
    const countryInput = document.getElementById("country-input");
    const searchButton = document.getElementById("search-button");
    const countryDetails = document.getElementById("country-details");

    searchButton.addEventListener("click", () => {
        const countryName = countryInput.value.trim();

        if (countryName !== "") {
            fetch(`https://restcountries.com/v3.1/name/${countryName}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Invalid request");
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.status === 404) {
                        countryDetails.innerHTML = `<p>Country not found</p>`;
                    } else {
                        const country = data[0];
                        const currencies = Object.values(country.currencies).map(currency => currency.name).join(", ");
                        const languages = Object.values(country.languages).join(", ");
                        const html = `
                            <h2>${country.name.common}</h2>
                            <p>Capital: ${country.capital}</p>
                            <p>Population: ${country.population}</p>
                            <p>Region: ${country.region}</p>
                            <p>Currencies: ${currencies}</p>
                            <p>Languages: ${languages}</p>
                            <!-- Add more details as needed -->
                        `;
                        countryDetails.innerHTML = html;
                    }

                    countryDetails.style.display = "block";
                })
                .catch((error) => {
                    console.error(error);
                    countryDetails.innerHTML = `<p>Invalid country name</p>`;
                    countryDetails.style.display = "block";
                });
        }
    });
});
