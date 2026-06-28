const resultSources = {
  powerball: {
    gameName: "Powerball",
    primarySource: {
      name: "Official Powerball Previous Results",
      url: "https://www.powerball.com/previous-results"
    },
    verificationSources: [
      {
        name: "Georgia Lottery Winning Numbers",
        url: "https://www.galottery.com/en-us/winning-numbers.html"
      },
      {
        name: "WSB-TV Lottery Results",
        url: "https://www.wsbtv.com/lottery/"
      }
    ],
    requiredFields: [
      "drawDate",
      "winningNumbers",
      "powerballNumber",
      "lastUpdated"
    ]
  },

  mega: {
    gameName: "Mega Millions",
    primarySource: {
      name: "Official Mega Millions Previous Drawings",
      url: "https://www.megamillions.com/winning-numbers/previous-drawings.aspx"
    },
    verificationSources: [
      {
        name: "Georgia Lottery Winning Numbers",
        url: "https://www.galottery.com/en-us/winning-numbers.html"
      },
      {
        name: "WSB-TV Lottery Results",
        url: "https://www.wsbtv.com/lottery/"
      }
    ],
    requiredFields: [
      "drawDate",
      "winningNumbers",
      "megaBallNumber",
      "lastUpdated"
    ]
  },

  pick5: {
    gameName: "Pick 5 / Georgia Five",
    primarySource: {
      name: "Official Georgia Lottery Winning Numbers",
      url: "https://www.galottery.com/en-us/winning-numbers.html"
    },
    verificationSources: [
      {
        name: "Official Georgia Five Game Page",
        url: "https://www.galottery.com/en-us/games/draw-games/georgia-five.html"
      },
      {
        name: "WSB-TV Lottery Results",
        url: "https://www.wsbtv.com/lottery/"
      }
    ],
    requiredFields: [
      "drawDate",
      "winningNumbers",
      "drawType",
      "lastUpdated"
    ]
  },

  fantasy5: {
    gameName: "Fantasy 5 / Georgia Fantasy 5",
    primarySource: {
      name: "Official Georgia Lottery Winning Numbers",
      url: "https://www.galottery.com/en-us/winning-numbers.html"
    },
    verificationSources: [
      {
        name: "Official Fantasy 5 Game Page",
        url: "https://www.galottery.com/en-us/games/draw-games/fantasy-five.html"
      },
      {
        name: "WSB-TV Lottery Results",
        url: "https://www.wsbtv.com/lottery/"
      }
    ],
    requiredFields: [
      "drawDate",
      "winningNumbers",
      "drawType",
      "lastUpdated"
    ]
  }
};

if (typeof module !== "undefined") {
  module.exports = resultSources;
}
