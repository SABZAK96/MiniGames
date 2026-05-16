// easy mode button
const easyMode = document.getElementById("easy");
easyMode.addEventListener("click", () => {
  document.getElementById("options").classList.remove("hidden");
  document.getElementById("start").addEventListener(
    "click",
    async () => {
      let win = false;
      let matchedCards = [];
      let easyTime = 45;
      document.getElementById("easyTime").innerHTML = easyTime;
      let timer = setInterval(() => {
        easyTime--;
        document.getElementById("easyTime").innerHTML = easyTime;
        if (easyTime == 0 && win === false) {
          clearInterval(timer);
          clearInterval(popup);
          window.alert("you lost!");
        }
      }, 1000);

      document.getElementById("reset").addEventListener(
        "click",
        () => {
          clearInterval(timer);
          clearInterval(popup);
        },
        { once: true },
      ); // avoid stacking listeners
      const Response = await (await fetch("/easy")).json();
      const container = document.getElementById("pokeContainer");
      // concat is a method that duplicate an array
      const newResponse = Response.concat(Response);
      container.className =
        "grid grid-cols-3 gap-2 mx-auto justify-items-center max-w-7xl";
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
        element.className = "card relative w-60 h-60";
        element.dataset.id = img; // data-id='${img}' assigning our own attribute
        element.innerHTML = `<img src="${img}" class="back w-full h-full object-contain" />
    <img src="/pokeball-seeklogo.png" class="front absolute inset-0 w-full h-full object-contain" />`;
        container.appendChild(element);
      });




      let firstCard = undefined;
      let secondCard = undefined;
      let matched = 0;

            let popup = setInterval(() => {
        document.querySelectorAll(".card").forEach((element) => {
          if (!matchedCards.includes(element.dataset.id) && element !== firstCard && element !== secondCard) {
              element.classList.add("flip");
            setTimeout(() => {
              element.classList.remove("flip");
            }, 2000)
          }
        });
      }, 10000);

      document.getElementById("matched").innerHTML = matched;
      let unmatched = 3;
      document.getElementById("unmatched").innerHTML = unmatched;
      document.getElementById("total").innerHTML = unmatched;

      let clicks = 0;
      document.getElementById("clicks").innerHTML = clicks;
      // clicking the front face
      const cards = document.querySelectorAll(".card");
      cards.forEach((card) => {
        card.addEventListener("click", function (e) {
          clicks++;
          document.getElementById("clicks").innerHTML = clicks;
          // ignore same card clicked twice
          if (card === firstCard) return;

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
                setTimeout(()=>{
                    window.alert("you won!");
                },1002)
              }
              unmatched--;
              document.getElementById("unmatched").innerHTML = unmatched;
              firstCard = undefined;
              secondCard = undefined;
            } else {
              // no match — flip both back after 1 second
              // we should save a reference for the firstcard and second card before setting them to undefined because of set time out
              const first = firstCard;
              const second = secondCard;
              firstCard = undefined;
              secondCard = undefined;
              setTimeout(() => {
                first.classList.remove("flip");
                second.classList.remove("flip");
              }, 1000);
            }
          }
        });
      });
    },
    { once: true },
  ); // prevent stacking listeners everytime easy is clicked
});

// medium mode button
const mediumMode = document.getElementById("medium");
mediumMode.addEventListener("click", async () => {
  const Response = await (await fetch("/medium")).json();
  // concat is a method that duplicate an array
  const newResponse = Response.concat(Response);
  // shuffling cards using Fisher-Yates
  newResponse.sort(() => Math.random() - 0.5);
  const container = document.getElementById("pokeContainer");
  container.className =
    "grid grid-cols-4 gap-2 mx-auto justify-items-center max-w-7xl";
  container.innerHTML = "";
  newResponse.forEach((img) => {
    const element = document.createElement("div");
    element.className = "card relative w-48 h-48";
    element.dataset.id = img;
    element.innerHTML = `<img src="${img}" class="back w-full h-full object-contain" />
    <img src="/pokeball-seeklogo.png" class="front absolute inset-0 w-full h-full object-contain" />`;
    container.appendChild(element);
  });
  // clicking the front face
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.addEventListener("click", function (e) {
      // e stands for event
      // also toggle means if flip is inside the class list of not remove it
      this.classList.toggle("flip"); // this means we want the parent element, since the front image is overlaying, it would be the "target"
    });
  });
});

// hard mode button
const hardMode = document.getElementById("hard");
hardMode.addEventListener("click", async () => {
  const Response = await (await fetch("/hard")).json();
  // concat is a method that duplicate an array
  const newResponse = Response.concat(Response);
  const container = document.getElementById("pokeContainer");
  // shuffling cards using Fisher-Yates
  newResponse.sort(() => Math.random() - 0.5);
  container.className =
    "grid grid-cols-6 gap-2 mx-auto justify-items-center max-w-7xl";
  container.innerHTML = "";
  newResponse.forEach((img) => {
    const element = document.createElement("div");
    element.className = "card relative w-40 h-40";
    element.dataset.id = img;
    element.innerHTML = `<img src="${img}" class="back w-full h-full object-contain" />
    <img src="/pokeball-seeklogo.png" class="front absolute inset-0 w-full h-full object-contain" />`;
    container.appendChild(element);
  });
  // clicking the front face
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.addEventListener("click", function (e) {
      // e stands for event
      this.classList.toggle("flip"); // this means we want the parent element, since the front image is overlaying, it would be the "target"
    });
  });
});
