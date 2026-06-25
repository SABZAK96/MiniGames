let firstCard = undefined;
let secondCard = undefined;
let matchedCards = [];

//js confetti
const jsConfetti = new JSConfetti();

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

// show a message using the same modal style as tictactoe instead of window.alert
function showMessage(message) {
  document.getElementById("messageTitle").innerHTML = message;
  document.getElementById("my_modal").showModal();
}

// easy mode button
const easyMode = document.getElementById("easy");
easyMode.addEventListener("click", () => {
  clearInterval(timer); //clear timers
  firstCard = undefined;
  secondCard = undefined;

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
    firstCard = undefined;
    secondCard = undefined;
    document.getElementById("start").classList.add("hidden");
    document.getElementById("info").classList.remove("hidden");
    document.getElementById("pop").classList.remove("hidden");
    document.getElementById("powerUpBtn").disabled = false;
    popCounter = 3;
    document.getElementById("remainingPower").innerHTML = popCounter;

    let win = false;
    let lost = false;
    matchedCards = [];
    let gameTime = 45;
    document.getElementById("timeLimit").innerHTML = gameTime;
    document.getElementById("easyTime").innerHTML = gameTime;

    timer = setInterval(() => {
      gameTime--;
      document.getElementById("easyTime").innerHTML = gameTime;
      if (gameTime == 0 && win === false) {
        clearInterval(timer);
              showMessage("you lost! Maybe next time?");
              lost = true;
      }
    }, 1000);

    document.getElementById("reset").addEventListener(
      "click",
      () => {
        document.getElementById("start").classList.remove("hidden");
        document.getElementById("info").classList.add("hidden");
        document.getElementById("pokeContainer").classList.add("hidden");
        document.getElementById("pop").classList.add("hidden");
        firstCard = undefined;
        secondCard = undefined;
        popCounter = 3;
        clearInterval(timer);
            },
      { once: true },
    ); // avoid stacking listeners

    const Response = await (await fetch("/easy")).json();

    // concat is a method that duplicate an array
    const newResponse = Response.concat(Response);

    container.className =
      "grid grid-cols-3 gap-2 mx-auto justify-items-center max-w-3xl mb-4";
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
    <img src="./images/pokeball-seeklogo.png" class="front absolute inset-0 w-full h-full object-contain" />`;
      container.appendChild(element);
    });

    let matched = 0;

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
        //exiting the game if time is finished and they lost
        if(lost) return;
        if (win) return;
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
              lost = false;
              clearInterval(timer);
                          setTimeout(() => {
                jsConfetti.addConfetti({
                  emojis: ["🌈", "🎉", "💥", "✨", "🎊"],
                  confettiNumber: 50,
                });

                showMessage("you won! 🎉");
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
  firstCard = undefined;
  secondCard = undefined;
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
    firstCard = undefined;
    secondCard = undefined;
    document.getElementById("start").classList.add("hidden");
    document.getElementById("info").classList.remove("hidden");
    document.getElementById("pop").classList.remove("hidden");
    document.getElementById("powerUpBtn").disabled = false;
    popCounter = 3;
    document.getElementById("remainingPower").innerHTML = popCounter;

    let win = false;
    let lost = false;
    matchedCards = [];
    let mediumTime = 100;
    document.getElementById("timeLimit").innerHTML = mediumTime;
    document.getElementById("easyTime").innerHTML = mediumTime;

    timer = setInterval(() => {
      mediumTime--;
      document.getElementById("easyTime").innerHTML = mediumTime;
      if (mediumTime == 0 && win === false) {
        clearInterval(timer);
              showMessage("you lost!");
              lost = true;
      }
    }, 1000);

    document.getElementById("reset").addEventListener(
      "click",
      () => {
        document.getElementById("start").classList.remove("hidden");
        document.getElementById("info").classList.add("hidden");
        document.getElementById("pokeContainer").classList.add("hidden");
        document.getElementById("pop").classList.add("hidden");
        firstCard = undefined;
        secondCard = undefined;
        popCounter = 3;
        clearInterval(timer);
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
    <img src="./images/pokeball-seeklogo.png" class="front absolute inset-0 w-full h-full object-contain" />`;
      container.appendChild(element);
    });

    let matched = 0;

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
        if (lost) return;
        if (win) return;
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
              lost = false;
              clearInterval(timer);
                          setTimeout(() => {
                jsConfetti.addConfetti({
                  emojis: ["🌈", "🎉", "💥", "✨", "🎊"],
                  confettiNumber: 50,
                });

                showMessage("you won!");
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
  firstCard = undefined;
  secondCard = undefined;

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
    firstCard = undefined;
    secondCard = undefined;
    document.getElementById("start").classList.add("hidden");
    document.getElementById("info").classList.remove("hidden");
    document.getElementById("pop").classList.remove("hidden");
    document.getElementById("powerUpBtn").disabled = false;
    popCounter = 3;
    document.getElementById("remainingPower").innerHTML = popCounter;

    let win = false;
    let lost = false;
    matchedCards = [];
    let hardTime = 200;
    document.getElementById("timeLimit").innerHTML = hardTime;

    document.getElementById("easyTime").innerHTML = hardTime;

    timer = setInterval(() => {
      hardTime--;
      document.getElementById("easyTime").innerHTML = hardTime;
      if (hardTime == 0 && win === false) {
        lost = true;
        clearInterval(timer);
              showMessage("you lost!");
      }
    }, 1000);

    document.getElementById("reset").addEventListener(
      "click",
      () => {
        document.getElementById("start").classList.remove("hidden");
        document.getElementById("info").classList.add("hidden");
        document.getElementById("pokeContainer").classList.add("hidden");
        document.getElementById("pop").classList.add("hidden");
        firstCard = undefined;
        secondCard = undefined;
        popCounter = 3;
        clearInterval(timer);
            },
      { once: true },
    ); // avoid stacking listeners

    let matched = 0;

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
    <img src="./images/pokeball-seeklogo.png" class="front absolute inset-0 w-full h-full object-contain" />`;
      container.appendChild(element);
    });

    document.getElementById("matched").innerHTML = matched;

    let unmatched = 12;
    document.getElementById("unmatched").innerHTML = unmatched;
    document.getElementById("total").innerHTML = unmatched;

    let clicks = 0;
    document.getElementById("clicks").innerHTML = clicks;

    let locked = false;

    // clicking the front face
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      card.addEventListener("click", function (e) {
        if (lost) return;
        if (win) return;
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

            if (matched === 12) {
              win = true;
              lost = false;
              clearInterval(timer);
                          setTimeout(() => {
                jsConfetti.addConfetti({
                  emojis: ["🌈", "🎉", "💥", "✨", "🎊"],
                  confettiNumber: 50,
                });

                showMessage("you won!");
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

let popCounter = 3;
document.getElementById("remainingPower").innerHTML = popCounter;
document.getElementById("powerUpBtn").addEventListener("click", () => {
  if (popCounter === 0) return;
  popCounter--;
  document.getElementById("remainingPower").innerHTML = popCounter;

  // flip the cards right now, once - no setInterval/setTimeout wrapper
  // needed here, only the per-card 1s "flip back" timeout below
  document.querySelectorAll(".card").forEach((element) => {
    if (
      !matchedCards.includes(element.dataset.id) &&
      element !== firstCard &&
      element !== secondCard
    ) {
      element.classList.add("flip");
      setTimeout(() => {
        element.classList.remove("flip");
      }, 1500);
    }
  });

  if (popCounter === 0) {
    document.getElementById("powerUpBtn").disabled = true;
   
  }
});
