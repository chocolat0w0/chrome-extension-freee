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

const showOvertime = (overtime) => {
  document.getElementById("overtime")?.remove();
  const overtimeElem = document.createElement("div");
  overtimeElem.id = "overtime";
  overtimeElem.classList.add("item");
  const overtimeLabel = document.createElement("div");
  overtimeLabel.classList.add("label");
  overtimeLabel.textContent = "だいたいの残業時間";
  const overtimeValue = document.createElement("div");
  overtimeValue.classList.add("body");
  overtimeValue.textContent = `${Math.trunc(overtime)} 時間 ${Math.round(
    (overtime - Math.trunc(overtime)) * 60
  )} 分`;
  overtimeElem.appendChild(overtimeLabel);
  overtimeElem.appendChild(overtimeValue);
  document.querySelector(".items.main-items").appendChild(overtimeElem);
};

const calcOvertime = () => {
  if (!location.href.includes("#work_records")) {
    return;
  }
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

      const totalWorkHour =
        Number(
          totalWorkTimeElem.querySelector(".hour-min__hour .hour-min__value")
            ?.textContent
        ) || 0;
      const totalWorkMin =
        Number(
          totalWorkTimeElem.querySelector(".hour-min__min .hour-min__value")
            ?.textContent / 60
        ) || 0;

      chrome.storage.local.get(["dayWorkTime"]).then((result) => {
        const overtime =
          totalWorkHour + totalWorkMin - dayCount * result.dayWorkTime;
        showOvertime(overtime);
      });
    })
    .catch((err) => {
      console.error(err);
    });
};

calcOvertime();

// 表示月を変更した際に再計算
window.addEventListener("hashchange", calcOvertime, false);
