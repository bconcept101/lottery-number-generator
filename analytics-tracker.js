(function () {
  "use strict";

  const TRACKING_ENDPOINT = "/api/track";
  const STORAGE_PREFIX = "lottery_generator_analytics_";

  function createId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}_${window.crypto.randomUUID()}`;
    }

    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  function getStorageValue(storage, key) {
    try {
      return storage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function setStorageValue(storage, key, value) {
    try {
      storage.setItem(key, value);
    } catch (error) {
      return null;
    }

    return value;
  }

  function getVisitorId() {
    const key = `${STORAGE_PREFIX}visitor_id`;
    const existing = getStorageValue(window.localStorage, key);

    if (existing) {
      return existing;
    }

    return setStorageValue(window.localStorage, key, createId("visitor"));
  }

  function getSessionId() {
    const key = `${STORAGE_PREFIX}session_id`;
    const existing = getStorageValue(window.sessionStorage, key);

    if (existing) {
      return existing;
    }

    return setStorageValue(window.sessionStorage, key, createId("session"));
  }

  function cleanText(value, maxLength) {
    if (value === undefined || value === null) {
      return null;
    }

    return String(value)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength || 500);
  }

  function getCurrentGameKey() {
    const select = document.getElementById("gameSelect");

    if (!select) {
      return null;
    }

    return cleanText(select.value, 80);
  }

  function getCurrentGameName() {
    const select = document.getElementById("gameSelect");

    if (!select || !select.options || select.selectedIndex < 0) {
      return null;
    }

    return cleanText(select.options[select.selectedIndex].textContent, 120);
  }

  function getNumberCount() {
    const select = document.getElementById("numberCount");

    if (!select) {
      return null;
    }

    const number = Number(select.value);

    if (!Number.isInteger(number)) {
      return null;
    }

    return number;
  }

  function sendTrackingEvent(eventName, options) {
    const eventOptions = options || {};

    const payload = {
      event_name: eventName,
      page_path: cleanText(window.location.pathname, 300),
      page_url: cleanText(window.location.href, 1000),
      page_title: cleanText(document.title, 300),
      referrer: cleanText(document.referrer, 1000),
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      game_key: cleanText(eventOptions.game_key || getCurrentGameKey(), 80),
      details: eventOptions.details || {}
    };

    fetch(TRACKING_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function () {
      return null;
    });
  }

  function trackPageView() {
    sendTrackingEvent("page_view", {
      details: {
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
        game_name: getCurrentGameName()
      }
    });
  }

  function trackGameSelection() {
    const select = document.getElementById("gameSelect");

    if (!select) {
      return;
    }

    select.addEventListener("change", function () {
      sendTrackingEvent("game_selected", {
        game_key: getCurrentGameKey(),
        details: {
          game_name: getCurrentGameName()
        }
      });
    });
  }

  function trackNavigationAndSupportClicks() {
    document.addEventListener("click", function (event) {
      const link = event.target.closest("a");

      if (!link) {
        return;
      }

      const href = link.href || "";
      const linkText = cleanText(link.textContent, 160);

      if (href.includes("paypal.com")) {
        sendTrackingEvent("support_clicked", {
          details: {
            link_text: linkText,
            link_href: href
          }
        });

        return;
      }

      const isSameSite =
        href &&
        link.hostname &&
        link.hostname === window.location.hostname;

      const isRelative =
        link.getAttribute("href") &&
        !link.getAttribute("href").startsWith("http");

      if (isSameSite || isRelative) {
        sendTrackingEvent("navigation_clicked", {
          details: {
            link_text: linkText,
            link_href: cleanText(link.getAttribute("href") || href, 500)
          }
        });
      }
    });
  }

  let generateClickTrackedAt = 0;

  function trackGenerateClick() {
    const gameKey = getCurrentGameKey();
    const gameName = getCurrentGameName();
    const numberCount = getNumberCount();

    generateClickTrackedAt = Date.now();

    sendTrackingEvent("generate_clicked", {
      game_key: gameKey,
      details: {
        game_name: gameName,
        number_count: numberCount
      }
    });
  }

  function trackGeneratedResults(gameKey, gameName, numberCount) {
    window.setTimeout(function () {
      const resultItems = document.querySelectorAll("#result .result-item");
      const displayedSets = resultItems.length;

      if (displayedSets <= 0) {
        return;
      }

      sendTrackingEvent("numbers_generated", {
        game_key: gameKey,
        details: {
          game_name: gameName,
          requested_sets: numberCount,
          displayed_sets: displayedSets
        }
      });
    }, 150);
  }

  function wrapGenerateNumbersFunction() {
    if (
      typeof window.generateNumbers !== "function" ||
      window.generateNumbers.__analyticsWrapped
    ) {
      return false;
    }

    const originalGenerateNumbers = window.generateNumbers;

    const wrappedGenerateNumbers = async function () {
      const gameKey = getCurrentGameKey();
      const gameName = getCurrentGameName();
      const numberCount = getNumberCount();

      if (Date.now() - generateClickTrackedAt > 1000) {
        trackGenerateClick();
      }

      const result = await originalGenerateNumbers.apply(this, arguments);

      trackGeneratedResults(gameKey, gameName, numberCount);

      return result;
    };

    wrappedGenerateNumbers.__analyticsWrapped = true;
    window.generateNumbers = wrappedGenerateNumbers;

    return true;
  }

  function trackGenerateButton() {
    const button =
      document.querySelector("button[onclick='generateNumbers()']") ||
      document.querySelector("button[onclick='generateNumbers();']") ||
      document.querySelector("button[onclick*='generateNumbers']");

    if (button) {
      button.addEventListener(
        "click",
        function () {
          trackGenerateClick();
        },
        true
      );
    }

    if (wrapGenerateNumbersFunction()) {
      return;
    }

    let attempts = 0;

    const interval = window.setInterval(function () {
      attempts += 1;

      if (wrapGenerateNumbersFunction() || attempts >= 20) {
        window.clearInterval(interval);
      }
    }, 250);
  }

  function initAnalyticsTracking() {
    trackPageView();
    trackGameSelection();
    trackNavigationAndSupportClicks();
    trackGenerateButton();

    window.LotteryAnalytics = {
      trackEvent: sendTrackingEvent
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnalyticsTracking);
  } else {
    initAnalyticsTracking();
  }
})();
