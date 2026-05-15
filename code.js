

// easy mode button
const easyMode = document.getElementById("easy");
easyMode.addEventListener("click", async () => {
const Response = await (await fetch("/easy")).json();
const container = document.getElementById("pokeContainer");
container.innerHTML = '';
Response.forEach(img => {
    const element = document.createElement("div");
    element.innerHTML = `<img src="${img}" />`;
    container.appendChild(element)
});
});

// medium mode button
const mediumMode = document.getElementById("medium");
mediumMode.addEventListener("click", async () => {
const Response = await (await fetch("/medium")).json();
const container = document.getElementById("pokeContainer");
container.innerHTML = '';
Response.forEach(img => {
    const element = document.createElement("div");
    element.innerHTML = `<img src="${img}" />`;
    container.appendChild(element)
});
});

// hard mode button
const hardMode = document.getElementById("hard");
hardMode.addEventListener("click", async () => {
const Response = await (await fetch("/hard")).json();
const container = document.getElementById("pokeContainer");
container.innerHTML = '';
Response.forEach(img => {
    const element = document.createElement("div");
    element.innerHTML = `<img src="${img}" />`;
    container.appendChild(element)
});
});