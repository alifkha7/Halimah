/**
 * Website content configuration for graduation greeting.
 * Change the values below to personalize the website.
 */
const CONFIG = {
  // Recipient name
  recipientName: "Halimah",

  // Greeting messages (array of paragraphs, min 1, max 5, max 500 char each)
  messages: [
    "Congratulations on your graduation, Halimah! 🎓 Achievement Unlocked: Bachelor's Degree! You've officially leveled up in real life.",
    "I know your journey wasn't easy — grinding assignments, boss fight exams, and endless side quests. But you cleared them all!",
    "You proved that with dedication and hard work, every challenge can be completed. I'm so proud of you! 💚",
    "Now a new chapter begins. May your next journey be full of XP, rare items, and happiness. GG WP, Halimah! 🏆"
  ],

  // Video list for TV (can have more than 1)
  videos: [
    { src: "assets/images/video.mp4", title: "Memories", color: "#4ecdc4" }
  ],

  // Photo gallery for Laptop (min 1, max 20)
  photos: [
    { src: "assets/images/halimahrch_-20260514-0001_000.jpg", caption: "Photo 1" },
    { src: "assets/images/halimahrch_-20260514-0001_010.jpg", caption: "Photo 2" },
    { src: "assets/images/halimahrch_-20260514-0001_020.jpg", caption: "Photo 3" },
    { src: "assets/images/halimahrch_-20260514-0001_030.jpg", caption: "Photo 4" },
    { src: "assets/images/halimahrch_-20260514-0001_040.jpg", caption: "Photo 5" },
    { src: "assets/images/halimahrch_-20260514-0001_050.jpg", caption: "Photo 6" },
    { src: "assets/images/halimahrch_-20260514-0001_060.jpg", caption: "Photo 7" },
    { src: "assets/images/halimahrch_-20260514-0001_070.jpg", caption: "Photo 8" },
    { src: "assets/images/halimahrch_-20260514-0001_080.jpg", caption: "Photo 9" },
    { src: "assets/images/halimahrch_-20260514-0001_090.jpg", caption: "Photo 10" },
    { src: "assets/images/halimahrch_-20260514-0001_100.jpg", caption: "Photo 11" },
    { src: "assets/images/halimahrch_-20260514-0001_110.jpg", caption: "Photo 12" },
    { src: "assets/images/halimahrch_-20260514-0001_120.jpg", caption: "Photo 13" },
    { src: "assets/images/halimahrch_-20260514-0001_130.jpg", caption: "Photo 14" },
    { src: "assets/images/halimahrch_-20260514-0001_140.jpg", caption: "Photo 15" }
  ],

  // Background music audio file path
  audioSrc: "assets/audio/music.mp3",

  // Website theme colors
  theme: {
    primary: "#00b06f",
    secondary: "#1b2838",
    accent: "#00d68f"
  }
};

/**
 * Validates the website configuration object.
 * Checks that all required fields meet the specified constraints.
 *
 * @param {Object} config - The configuration object to validate
 * @returns {boolean} true if configuration is valid, false otherwise
 */
function validateConfig(config) {
  let isValid = true;

  // Validate recipientName: must be a non-empty string
  if (typeof config.recipientName !== 'string' || config.recipientName.trim() === '') {
    console.warn('[Config] recipientName must be a non-empty string.');
    isValid = false;
  }

  // Validate messages: must be an array with 1-5 items, each max 500 characters
  if (!Array.isArray(config.messages)) {
    console.warn('[Config] messages must be an array.');
    isValid = false;
  } else {
    if (config.messages.length < 1 || config.messages.length > 5) {
      console.warn('[Config] messages must have 1 to 5 paragraphs.');
      isValid = false;
    }
    for (let i = 0; i < config.messages.length; i++) {
      if (typeof config.messages[i] !== 'string') {
        console.warn(`[Config] messages[${i}] must be a string.`);
        isValid = false;
      } else if (config.messages[i].length > 500) {
        console.warn(`[Config] messages[${i}] exceeds 500 character limit (${config.messages[i].length} characters).`);
        isValid = false;
      }
    }
  }

  // Validate photos: must be an array with 1-20 items, each with a src property
  if (!Array.isArray(config.photos)) {
    console.warn('[Config] photos must be an array.');
    isValid = false;
  } else {
    if (config.photos.length < 1 || config.photos.length > 20) {
      console.warn('[Config] photos must have 1 to 20 items.');
      isValid = false;
    }
    for (let i = 0; i < config.photos.length; i++) {
      if (!config.photos[i] || typeof config.photos[i].src !== 'string' || config.photos[i].src.trim() === '') {
        console.warn(`[Config] photos[${i}] must have a non-empty src string property.`);
        isValid = false;
      }
    }
  }

  return isValid;
}

// Export for Node.js usage (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, validateConfig };
}
