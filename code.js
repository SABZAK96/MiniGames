// toggle daiseyUI theme component and add it to localstorage
const theme = document.querySelector(".theme-controller");
const element = document.getElementById("page");

// get preferences from local storage, if there's nothing there, use light
const savePreference = localStorage.getItem("themePreference") || "light";
element.setAttribute("data-theme", savePreference);

// save visual toggle upon reload as well
if (savePreference === "dark") {
  theme.checked = true;
} else {
  theme.checked = false;
}

// change the preference on toggle
theme.addEventListener("change", () => {
  if (theme.checked) {
    const newPreference = "dark";
    element.setAttribute("data-theme", newPreference);
    localStorage.setItem("themePreference", newPreference);
  } else {
    const newPreference = "light";
    element.setAttribute("data-theme", newPreference);
    localStorage.setItem("themePreference", newPreference);
  }
});

// define all timers here so that they wont stack up when changib difficulties
let timer = undefined;
let popup = undefined;

// easy mode button
const easyMode = document.getElementById("easy");
easyMode.addEventListener("click", () => {
  clearInterval(timer); //clear timers
  clearInterval(popup);

  const container = document.getElementById("pokeContainer");
  container.innerHTML = "";
  document.getElementById("info").classList.add("hidden");

  // clear button container and build them
  const buttonContainer = document.getElementById("options");
  buttonContainer.innerHTML = "";
  buttonContainer.innerHTML = `<button id="start" class="btn btn-accent">Start Easy!</button>
    <button id="reset" class="btn btn-accent">Reset</button>`;
  document.getElementById("options").classList.remove("hidden");

  document.getElementById("start").addEventListener("click", async () => {
    document.getElementById("start").classList.add("hidden");
    document.getElementById("info").classList.remove("hidden");

    let win = false;
    let matchedCards = [];
    let gameTime = 45;
    document.getElementById("timeLimit").innerHTML = gameTime;
    document.getElementById("easyTime").innerHTML = gameTime;

    timer = setInterval(() => {
      gameTime--;
      document.getElementById("easyTime").innerHTML = gameTime;
      if (gameTime == 0 && win === false) {
        clearInterval(timer);
        clearInterval(popup);
        window.alert("you lost!");
      }
    }, 1000);

    document.getElementById("reset").addEventListener(
      "click",
      () => {
        document.getElementById("start").classList.remove("hidden");
        document.getElementById("info").classList.add("hidden");
        document.getElementById("pokeContainer").classList.add("hidden");
        clearInterval(timer);
        clearInterval(popup);
      },
      { once: true },
    ); // avoid stacking listeners

    const Response = await (await fetch("/easy")).json();

    // concat is a method that duplicate an array
    const newResponse = Response.concat(Response);

    container.className =
      "grid grid-cols-3 gap-2 mx-auto justify-items-center max-w-3xl mb-20";
    container.innerHTML = "";

    // Fisher-Yates shuffle for shuffling the array
    // Shuffle the array randomly before rendering so cards appear in a different order each game.
    // .sort() compares two elements (a, b) and uses the return value to decide their order:
    //   - negative → a stays before b
    //   - positive → b comes before a
    //   - zero     → order unchanged
    // Math.random() produces a number between 0 and 1, so subtracting 0.5 gives a result
    // between -0.5 and 0.5. Since it's random, either element can win each comparison,
    // making the final order unpredictable — effectively shuffling the array.
    newResponse.sort(() => Math.random() - 0.5);

    newResponse.forEach((img) => {
      const element = document.createElement("div");
      element.className = "card relative md:w-60 md:h-60 w-25 h-25";
      element.dataset.id = img; // data-id='${img}' assigning our own attribute
      element.innerHTML = `<img src="${img}" class="back w-full h-full object-contain" />
    <img src="/pokeball-seeklogo.png" class="front absolute inset-0 w-full h-full object-contain" />`;
      container.appendChild(element);
    });

    let firstCard = undefined;
    let secondCard = undefined;
    let matched = 0;

    popup = setInterval(() => {
      window.alert("Power Up!");
      document.querySelectorAll(".card").forEach((element) => {
        if (
          !matchedCards.includes(element.dataset.id) &&
          element !== firstCard &&
          element !== secondCard
        ) {
          element.classList.add("flip");
          setTimeout(() => {
            element.classList.remove("flip");
          }, 1000);
        }
      });
    }, 20000);

    document.getElementById("matched").innerHTML = matched;

    let unmatched = 3;
    document.getElementById("unmatched").innerHTML = unmatched;
    document.getElementById("total").innerHTML = unmatched;

    let clicks = 0;
    document.getElementById("clicks").innerHTML = clicks;

    //locking the cards to avoid clicking when w unmatched cards are shown
    let locked = false;

    // clicking the front face
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("click", function (e) {
        document.getElementById("clicks").innerHTML = clicks;

        // ignore same card clicked twice
        if (card === firstCard) return; // not allowing clicking the same card to count as matched
        if (matchedCards.includes(card.dataset.id)) return; // same as removing the matched cards from the game
        if (locked) return; //in locked phase avoid clicking

        clicks++; // claculate the clicks for permitted cards, not the ones that should be skipped

        card.classList.add("flip");

        if (!firstCard) {
          // first click — store it and wait for second click
          firstCard = card;
        } else {
          // second click — compare the two cards
          secondCard = card;

          if (firstCard.dataset.id === secondCard.dataset.id) {
            // match — reset the variables
            matchedCards.push(firstCard.dataset.id);
            matched++;
            document.getElementById("matched").innerHTML = matched;

            if (matched === 3) {
              win = true;
              clearInterval(timer);
              clearInterval(popup);
              setTimeout(() => {
                window.alert("you won!");
              }, 802);
            }

            unmatched--;
            document.getElementById("unmatched").innerHTML = unmatched;
            firstCard = undefined;
            secondCard = undefined;
          } else {
            // no match — flip both back after 1 second
            // we should save a reference for the firstcard and second card before setting them to undefined because of set time out
            locked = true; // locking cards for clicking
            const first = firstCard;
            const second = secondCard;
            firstCard = undefined;
            secondCard = undefined;

            setTimeout(() => {
              first.classList.remove("flip");
              second.classList.remove("flip");
              locked = false;
            }, 800);
          }
        }
      });
    });
  });
});

// medium mode button
const mediumMode = document.getElementById("medium");
mediumMode.addEventListener("click", () => {
  clearInterval(timer);
  clearInterval(popup);

  const container = document.getElementById("pokeContainer");
  container.innerHTML = "";
  document.getElementById("info").classList.add("hidden");

  // clear button container and build them
  const buttonContainer = document.getElementById("options");
  buttonContainer.innerHTML = "";
  buttonContainer.innerHTML = `<button id="start" class="btn btn-accent">Start Medium!</button>
    <button id="reset" class="btn btn-accent">Reset</button>`;
  document.getElementById("options").classList.remove("hidden");

  document.getElementById("start").addEventListener("click", async () => {
    document.getElementById("start").classList.add("hidden");
    document.getElementById("info").classList.remove("hidden");

    let win = false;
    let matchedCards = [];
    let mediumTime = 100;
    document.getElementById("timeLimit").innerHTML = mediumTime;
    document.getElementById("easyTime").innerHTML = mediumTime;

    timer = setInterval(() => {
      mediumTime--;
      document.getElementById("easyTime").innerHTML = mediumTime;
      if (mediumTime == 0 && win === false) {
        clearInterval(timer);
        clearInterval(popup);
        window.alert("you lost!");
      }
    }, 1000);

    document.getElementById("reset").addEventListener(
      "click",
      () => {
        document.getElementById("start").classList.remove("hidden");
        document.getElementById("info").classList.add("hidden");
        document.getElementById("pokeContainer").classList.add("hidden");
        clearInterval(timer);
        clearInterval(popup);
      },
      { once: true },
    ); // avoid stacking listeners

    const Response = await (await fetch("/medium")).json();

    // concat is a method that duplicate an array
    const newResponse = Response.concat(Response);

    container.className =
      "grid md:grid-cols-4 grid-cols-3  gap-2 mx-auto justify-items-center md:max-w-4xl max-w-3xl mb-20 ";
    container.innerHTML = "";

    // Shuffle the array randomly before rendering so cards appear in a different order each game.
    // .sort() compares two elements (a, b) and uses the return value to decide their order:
    //   - negative → a stays before b
    //   - positive → b comes before a
    //   - zero     → order unchanged
    // Math.random() produces a number between 0 and 1, so subtracting 0.5 gives a result
    // between -0.5 and 0.5. Since it's random, either element can win each comparison,
    // making the final order unpredictable — effectively shuffling the array.
    newResponse.sort(() => Math.random() - 0.5);

    newResponse.forEach((img) => {
      const element = document.createElement("div");
      element.className = "card relative md:w-48 md:h-48 w-25 h-25 ";
      element.dataset.id = img; // data-id assigned as our own attribute for pair matching
      element.innerHTML = `<img src="${img}" class="back w-full h-full object-contain" />
    <img src="/pokeball-seeklogo.png" class="front absolute inset-0 w-full h-full object-contain" />`;
      container.appendChild(element);
    });

    let firstCard = undefined;
    let secondCard = undefined;
    let matched = 0;

    popup = setInterval(() => {
      window.alert("Power Up!");
      document.querySelectorAll(".card").forEach((element) => {
        if (
          !matchedCards.includes(element.dataset.id) &&
          element !== firstCard &&
          element !== secondCard
        ) {
          element.classList.add("flip");
          setTimeout(() => {
            element.classList.remove("flip");
          }, 1000);
        }
      });
    }, 15000);

    document.getElementById("matched").innerHTML = matched;

    let unmatched = 6;
    document.getElementById("unmatched").innerHTML = unmatched;
    document.getElementById("total").innerHTML = unmatched;

    let clicks = 0;
    document.getElementById("clicks").innerHTML = clicks;

    let locked = false;

    // clicking the front face
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("click", function (e) {
        document.getElementById("clicks").innerHTML = clicks;

        if (card === firstCard) return;
        if (matchedCards.includes(card.dataset.id)) return;
        if (locked) return;

        clicks++;
        document.getElementById("clicks").innerHTML = clicks;

        card.classList.add("flip");

        if (!firstCard) {
          firstCard = card;
        } else {
          secondCard = card;

          if (firstCard.dataset.id === secondCard.dataset.id) {
            matchedCards.push(firstCard.dataset.id);
            matched++;
            document.getElementById("matched").innerHTML = matched;

            if (matched === 6) {
              win = true;
              clearInterval(timer);
              clearInterval(popup);
              setTimeout(() => {
                window.alert("you won!");
              }, 802);
            }

            unmatched--;
            document.getElementById("unmatched").innerHTML = unmatched;
            firstCard = undefined;
            secondCard = undefined;
          } else {
            locked = true;
            const first = firstCard;
            const second = secondCard;
            firstCard = undefined;
            secondCard = undefined;

            setTimeout(() => {
              first.classList.remove("flip");
              second.classList.remove("flip");
              locked = false;
            }, 800);
          }
        }
      });
    });
  });
});

// hard mode button
const hardMode = document.getElementById("hard");
hardMode.addEventListener("click", () => {
  clearInterval(timer);
  clearInterval(popup);

  const container = document.getElementById("pokeContainer");
  container.innerHTML = "";
  document.getElementById("info").classList.add("hidden");

  // clear button container and build them
  const buttonContainer = document.getElementById("options");
  buttonContainer.innerHTML = "";
  buttonContainer.innerHTML = `<button id="start" class="btn btn-accent">Start Hard!</button>
    <button id="reset" class="btn btn-accent">Reset</button>`;
  document.getElementById("options").classList.remove("hidden");

  document.getElementById("start").addEventListener("click", async () => {
    document.getElementById("start").classList.add("hidden");
    document.getElementById("info").classList.remove("hidden");

    let win = false;
    let matchedCards = [];
    let hardTime = 200;
    document.getElementById("timeLimit").innerHTML = hardTime;

    document.getElementById("easyTime").innerHTML = hardTime;

    timer = setInterval(() => {
      hardTime--;
      document.getElementById("easyTime").innerHTML = hardTime;
      if (hardTime == 0 && win === false) {
        clearInterval(timer);
        clearInterval(popup);
        window.alert("you lost!");
      }
    }, 1000);

    document.getElementById("reset").addEventListener(
      "click",
      () => {
        document.getElementById("start").classList.remove("hidden");
        document.getElementById("info").classList.add("hidden");
        document.getElementById("pokeContainer").classList.add("hidden");
        clearInterval(timer);
        clearInterval(popup);
      },
      { once: true },
    ); // avoid stacking listeners

    let firstCard = undefined;
    let secondCard = undefined;
    let matched = 0;

    popup = setInterval(() => {
      window.alert("Power Up!");
      document.querySelectorAll(".card").forEach((element) => {
        if (
          !matchedCards.includes(element.dataset.id) &&
          element !== firstCard &&
          element !== secondCard
        ) {
          element.classList.add("flip");
          setTimeout(() => {
            element.classList.remove("flip");
          }, 1000);
        }
      });
    }, 15000);

    const Response = await (await fetch("/hard")).json();

    // concat is a method that duplicate an array
    const newResponse = Response.concat(Response);

    container.className =
      "grid md:grid-cols-6 grid-cols-4 gap-2 mx-auto justify-items-center max-w-6xl mb-20";
    container.innerHTML = "";

    // Shuffle the array randomly before rendering so cards appear in a different order each game.
    // .sort() compares two elements (a, b) and uses the return value to decide their order:
    //   - negative → a stays before b
    //   - positive → b comes before a
    //   - zero     → order unchanged
    // Math.random() produces a number between 0 and 1, so subtracting 0.5 gives a result
    // between -0.5 and 0.5. Since it's random, either element can win each comparison,
    // making the final order unpredictable — effectively shuffling the array.
    newResponse.sort(() => Math.random() - 0.5);

    newResponse.forEach((img) => {
      const element = document.createElement("div");
      element.className = "card relative md:w-35 md:h-35 h-20 w-20";
      element.dataset.id = img; // data-id assigned as our own attribute for pair matching
      element.innerHTML = `<img src="${img}" class="back w-full h-full object-contain" />
    <img src="/pokeball-seeklogo.png" class="front absolute inset-0 w-full h-full object-contain" />`;
      container.appendChild(element);
    });

    document.getElementById("matched").innerHTML = matched;

    let unmatched = 8;
    document.getElementById("unmatched").innerHTML = unmatched;
    document.getElementById("total").innerHTML = unmatched;

    let clicks = 0;
    document.getElementById("clicks").innerHTML = clicks;

    let locked = false;

    // clicking the front face
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("click", function (e) {
        document.getElementById("clicks").innerHTML = clicks;

        if (card === firstCard) return;
        if (matchedCards.includes(card.dataset.id)) return;
        if (locked) return;

        clicks++;
        document.getElementById("clicks").innerHTML = clicks;

        card.classList.add("flip");

        if (!firstCard) {
          firstCard = card;
        } else {
          secondCard = card;

          if (firstCard.dataset.id === secondCard.dataset.id) {
            matchedCards.push(firstCard.dataset.id);
            matched++;
            document.getElementById("matched").innerHTML = matched;

            if (matched === 8) {
              win = true;
              clearInterval(timer);
              clearInterval(popup);
              setTimeout(() => {
                window.alert("you won!");
              }, 802);
            }

            unmatched--;
            document.getElementById("unmatched").innerHTML = unmatched;
            firstCard = undefined;
            secondCard = undefined;
          } else {
            locked = true;
            const first = firstCard;
            const second = secondCard;
            firstCard = undefined;
            secondCard = undefined;

            setTimeout(() => {
              first.classList.remove("flip");
              second.classList.remove("flip");
              locked = false;
            }, 800);
          }
        }
      });
    });
  });
});
