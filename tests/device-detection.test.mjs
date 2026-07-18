import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(
  new URL("../frigate-view-card.js", import.meta.url),
  "utf8",
);

function extractFunction(sourceText, functionName) {
  const signature = `function ${functionName}()`;
  const start = sourceText.indexOf(signature);
  assert.notEqual(start, -1, `${functionName} not found`);

  const openBrace = sourceText.indexOf("{", start);
  assert.notEqual(openBrace, -1, `${functionName} body not found`);

  let depth = 0;
  let state = null;
  let escaped = false;

  for (let index = openBrace; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    const next = sourceText[index + 1];

    if (state === "line-comment") {
      if (char === "\n") state = null;
      continue;
    }

    if (state === "block-comment") {
      if (char === "*" && next === "/") {
        state = null;
        index += 1;
      }
      continue;
    }

    if (state === "single-quote" || state === "double-quote" || state === "template") {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (
        (state === "single-quote" && char === "'") ||
        (state === "double-quote" && char === '"') ||
        (state === "template" && char === "`")
      ) {
        state = null;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      state = "line-comment";
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      state = "block-comment";
      index += 1;
      continue;
    }

    if (char === "'") {
      state = "single-quote";
      continue;
    }

    if (char === '"') {
      state = "double-quote";
      continue;
    }

    if (char === "`") {
      state = "template";
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return sourceText.slice(start, index + 1);
      }
    }
  }

  throw new Error(`Unable to extract ${functionName}`);
}

function createMatchMedia({ pointerCoarse = false, anyPointerCoarse = false, hoverNone = false } = {}) {
  return (query) => {
    if (query === "(pointer: coarse)") return { matches: pointerCoarse };
    if (query === "(any-pointer: coarse)") return { matches: anyPointerCoarse };
    if (query === "(hover: none)") return { matches: hoverNone };
    return { matches: false };
  };
}

function loadDetector(browser = {}) {
  const detectorSource = extractFunction(source, "detectDeviceProfile");
  const context = vm.createContext({
    navigator: browser.navigator || {},
    window: browser.window || {},
  });
  return vm.runInContext(`${detectorSource}; detectDeviceProfile;`, context);
}

test("detects iPhone as iOS phone", () => {
  const detectDeviceProfile = loadDetector({
    navigator: {
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      maxTouchPoints: 5,
    },
    window: {
      innerWidth: 390,
      innerHeight: 844,
      matchMedia: createMatchMedia({
        pointerCoarse: true,
        anyPointerCoarse: true,
        hoverNone: true,
      }),
    },
  });

  const profile = detectDeviceProfile();
  assert.equal(profile.os, "iOS");
  assert.equal(profile.isIOS, true);
  assert.equal(profile.isAndroid, false);
  assert.equal(profile.isPhone, true);
  assert.equal(profile.isTablet, false);
  assert.equal(profile.hasTouch, true);
});

test("detects Android as mobile with touch", () => {
  const detectDeviceProfile = loadDetector({
    navigator: {
      userAgent:
        "Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
      userAgentData: { platform: "Android" },
      maxTouchPoints: 5,
    },
    window: {
      innerWidth: 412,
      innerHeight: 915,
      matchMedia: createMatchMedia({
        pointerCoarse: true,
        anyPointerCoarse: true,
      }),
    },
  });

  const profile = detectDeviceProfile();
  assert.equal(profile.os, "Android");
  assert.equal(profile.isAndroid, true);
  assert.equal(profile.isIOS, false);
  assert.equal(profile.isPhone, true);
  assert.equal(profile.isMobile, true);
  assert.equal(profile.hasTouch, true);
});

test("detects iPadOS Mac spoof as tablet", () => {
  const detectDeviceProfile = loadDetector({
    navigator: {
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      platform: "MacIntel",
      maxTouchPoints: 5,
    },
    window: {
      innerWidth: 1180,
      innerHeight: 820,
      matchMedia: createMatchMedia({
        pointerCoarse: true,
        anyPointerCoarse: true,
      }),
    },
  });

  const profile = detectDeviceProfile();
  assert.equal(profile.os, "iOS");
  assert.equal(profile.isIOS, true);
  assert.equal(profile.isTablet, true);
  assert.equal(profile.isPhone, false);
  assert.equal(profile.isMobile, true);
});

test("detects touchscreen desktop separately from mobile", () => {
  const detectDeviceProfile = loadDetector({
    navigator: {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      platform: "Win32",
      maxTouchPoints: 10,
    },
    window: {
      innerWidth: 1600,
      innerHeight: 900,
      matchMedia: createMatchMedia({
        anyPointerCoarse: true,
      }),
    },
  });

  const profile = detectDeviceProfile();
  assert.equal(profile.os, "Desktop/Other");
  assert.equal(profile.isDesktop, true);
  assert.equal(profile.isMobile, false);
  assert.equal(profile.hasTouch, true);
  assert.equal(profile.hasAnyTouch, true);
});

test("detects plain desktop as non-touch", () => {
  const detectDeviceProfile = loadDetector({
    navigator: {
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      platform: "Linux x86_64",
      maxTouchPoints: 0,
    },
    window: {
      innerWidth: 1920,
      innerHeight: 1080,
      matchMedia: createMatchMedia(),
    },
  });

  const profile = detectDeviceProfile();
  assert.equal(profile.isDesktop, true);
  assert.equal(profile.isMobile, false);
  assert.equal(profile.hasTouch, false);
  assert.equal(profile.hasAnyTouch, false);
});