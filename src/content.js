const waitForElement = (selector, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver((mutationsList, observer) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error("Element not found within timeout"));
    }, timeout);
  });
};

const calcOvertime = () => {
  waitForElement(".employee-work-record-summary")
    .then(() => {
      const summaryItems = document.querySelectorAll(
        ".employee-work-record-summary .item"
      );

      const dayCount = [...summaryItems]
        .find((item) => {
          return item.querySelector(".label").innerHTML.startsWith("労働日数");
        })
        .querySelector(".body")
        .textContent.replace("日", "");

      const totalWorkTimeElem = [...summaryItems]
        .find((item) => {
          return item
            .querySelector(".label")
            .innerHTML.startsWith("総勤務時間");
        })
        .querySelector(".body");

      const totalWorkHour = totalWorkTimeElem.querySelector(
        ".hour-min__hour .hour-min__value"
      ).textContent;
      const totalWorkMinElem = totalWorkTimeElem.querySelector(
        ".hour-min__min .hour-min__value"
      );
      const totalWorkMin = totalWorkMinElem ? totalWorkMinElem.textContent : 0;

      const overtimeHour = totalWorkHour - dayCount * 8;

      document.getElementById("overtime")?.remove();
      const overtimeElem = document.createElement("div");
      overtimeElem.id = "overtime";
      overtimeElem.classList.add("item");
      const overtimeLabel = document.createElement("div");
      overtimeLabel.classList.add("label");
      overtimeLabel.textContent = "だいたいの残業時間";
      const overtimeValue = document.createElement("div");
      overtimeValue.classList.add("body");
      overtimeValue.textContent = `${overtimeHour} 時間 ${totalWorkMin} 分`;
      overtimeElem.appendChild(overtimeLabel);
      overtimeElem.appendChild(overtimeValue);
      document.querySelector(".items.main-items").appendChild(overtimeElem);
    })
    .catch((err) => {
      console.error(err);
    });
};

calcOvertime();

// 表示月を変更した際に再計算
window.addEventListener("hashchange", calcOvertime, false);
