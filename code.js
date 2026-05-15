
// easy mode button
const easyMode = document.getElementById("easy");
easyMode.addEventListener("click", async () => {
const Response = await (await fetch("/easy")).json();
const container = document.getElementById("pokeContainer");
// concat is a method that duplicate an array
const newResponse = Response.concat(Response);
container.className = "grid grid-cols-3 gap-2 mx-auto justify-items-center max-w-7xl";
container.innerHTML = '';
// Fisher-Yates shuffle for shuffling the array
// Shuffle the array randomly before rendering so cards appear in a different order each game.
// .sort() compares two elements (a, b) and uses the return value to decide their order:
//   - negative → a stays before b
//   - positive → b comes before a
//   - zero     → order unchanged
// Math.random() produces a number between 0 and 1, so subtracting 0.5 gives a result
// between -0.5 and 0.5. Since it's random, either element can win each comparison,
// making the final order unpredictable — effectively shuffling the array.
newResponse.sort(()=> Math.random() - 0.5 );
newResponse.forEach(img => {
    const element = document.createElement("div");
    element.className = "card relative w-60 h-60"
    element.dataset.id = img; // data-id='${img}' assigning our own attribute
    element.innerHTML = `<img src="${img}" class="back w-full h-full object-contain" />
    <img src="/pokeball-seeklogo.png" class="front absolute inset-0 w-full h-full object-contain" />`;
    container.appendChild(element)
});
// clicking the front face
const cards = document.querySelectorAll(".card")
cards.forEach((card)=>{card.addEventListener("click", function(e){ // e stands for event
    this.classList.toggle("flip"); // this means we want the parent element, since the front image is overlaying, it would be the "target"
})
})
});

// medium mode button
const mediumMode = document.getElementById("medium");
mediumMode.addEventListener("click", async () => {
const Response = await (await fetch("/medium")).json();
// concat is a method that duplicate an array
const newResponse = Response.concat(Response);
// shuffling cards using Fisher-Yates 
newResponse.sort(()=> Math.random() - 0.5 );
const container = document.getElementById("pokeContainer");
container.className = "grid grid-cols-4 gap-2 mx-auto justify-items-center max-w-7xl";
container.innerHTML = '';
newResponse.forEach(img => {
    const element = document.createElement("div");
    element.className = "card relative w-48 h-48"
    element.dataset.id = img;
    element.innerHTML = `<img src="${img}" class="back w-full h-full object-contain" />
    <img src="/pokeball-seeklogo.png" class="front absolute inset-0 w-full h-full object-contain" />`;
    container.appendChild(element)
});
// clicking the front face
const cards = document.querySelectorAll(".card")
cards.forEach((card)=>{card.addEventListener("click", function(e){ // e stands for event
    // also toggle means if flip is inside the class list of not remove it
    this.classList.toggle("flip"); // this means we want the parent element, since the front image is overlaying, it would be the "target"
})
})
});

// hard mode button
const hardMode = document.getElementById("hard");
hardMode.addEventListener("click", async () => {
const Response = await (await fetch("/hard")).json();
// concat is a method that duplicate an array
const newResponse = Response.concat(Response);
const container = document.getElementById("pokeContainer");
// shuffling cards using Fisher-Yates 
newResponse.sort(()=> Math.random() - 0.5 );
container.className = "grid grid-cols-6 gap-2 mx-auto justify-items-center max-w-7xl";
container.innerHTML = '';
newResponse.forEach(img => {
    const element = document.createElement("div");
    element.className = "card relative w-40 h-40"
    element.dataset.id = img;
    element.innerHTML = `<img src="${img}" class="back w-full h-full object-contain" />
    <img src="/pokeball-seeklogo.png" class="front absolute inset-0 w-full h-full object-contain" />`;
    container.appendChild(element);
});
// clicking the front face
const cards = document.querySelectorAll(".card")
cards.forEach((card)=>{card.addEventListener("click", function(e){ // e stands for event
    this.classList.toggle("flip"); // this means we want the parent element, since the front image is overlaying, it would be the "target"
})
})
});

