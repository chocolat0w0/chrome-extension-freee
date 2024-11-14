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

const addSummaryItem = (id, title, content) => {
  document.getElementById(id)?.remove();
  const overtimeElem = document.createElement("div");
  overtimeElem.id = id;
  overtimeElem.classList.add("item");
  const overtimeLabel = document.createElement("div");
  overtimeLabel.classList.add("label");
  overtimeLabel.textContent = title;
  const overtimeValue = document.createElement("div");
  overtimeValue.classList.add("body");
  overtimeValue.textContent = content;
  overtimeElem.appendChild(overtimeLabel);
  overtimeElem.appendChild(overtimeValue);
  document.querySelector(".items.main-items").appendChild(overtimeElem);
};

const showOvertime = (time) => {
  addSummaryItem(
    "overtime",
    "だいたいの残業時間",
    `${Math.trunc(time)} 時間 ${Math.round((time - Math.trunc(time)) * 60)} 分`
  );
};

const showEstimated = (time) => {
  addSummaryItem(
    "estimated",
    "このままいくと",
    `${Math.trunc(time)} 時間 ${Math.round((time - Math.trunc(time)) * 60)} 分`
  );
};

const calculate = () => {
  if (!location.href.includes("#work_records")) {
    return;
  }
  waitForElement(".employee-work-record-summary")
    .then(() => {
      const summaryItems = document.querySelectorAll(
        ".employee-work-record-summary .item"
      );

      const hasHolidayWork =
        [...summaryItems].find((item) => {
          return item
            .querySelector(".label")
            ?.innerHTML.startsWith("所定労働日の労働日数");
        }) !== undefined;

      const workedDayCount = hasHolidayWork
        ? Number(
            [...summaryItems]
              .find((item) => {
                return item
                  .querySelector(".label")
                  ?.innerHTML.startsWith("所定労働日の労働日数");
              })
              .querySelector(".body")
              .textContent.replace("日", "")
          )
        : Number(
            [...summaryItems]
              .find((item) => {
                return item
                  .querySelector(".label")
                  ?.innerHTML.startsWith("労働日数");
              })
              .querySelector(".body")
              .textContent.replace("日", "")
          );

      const totalWorkTimeElem = [...summaryItems]
        .find((item) => {
          return item
            .querySelector(".label")
            ?.innerHTML.startsWith("総勤務時間");
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

      const remainWorkingDayCount = document.querySelectorAll(
        "td.day:not(.work):not(.out-of-range):not([class*='holiday'])"
      ).length;

      chrome.storage.local.get(["dayWorkTime"]).then((result) => {
        const overtime =
          totalWorkHour + totalWorkMin - workedDayCount * result.dayWorkTime;
        const estimated =
          workedDayCount === 0
            ? 0
            : overtime + (overtime / workedDayCount) * remainWorkingDayCount;
        showOvertime(overtime);
        showEstimated(estimated);
      });
    })
    .catch((err) => {
      console.error(err);
    });
};

calculate();

// 表示月を変更した際に再計算
window.addEventListener("hashchange", calculate, false);
