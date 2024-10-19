document.addEventListener("DOMContentLoaded", () => {
  const formElem = document.getElementById("form");
  const inputElem = document.getElementById("dayWorkTime");
  const errorElem = document.getElementById("error");

  chrome.storage.local.get(["dayWorkTime"]).then((result) => {
    if (!result.dayWorkTime) {
      chrome.storage.local.set({ dayWorkTime: 8 }).then(() => {});
    }
    inputElem.value = result.dayWorkTime || 8;
  });

  formElem.addEventListener("submit", (event) => {
    event.preventDefault();

    const value = Number(inputElem.value);
    errorElem.innerText = "";
    if (isNaN(value)) {
      errorElem.innerText = "数値で入力してください";
    } else {
      chrome.storage.local.set({ dayWorkTime: value });
    }
  });
});
