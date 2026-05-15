// easy mode button
const easyMode = document.getElementById("easy");
easyMode.addEventListener("click", async () => {

  // convert this set to an array and send it to the backend using spread operator
  const pokeIds = [...pokeIDs];
  await fetch("/easy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pokeIds }),
  });
});
