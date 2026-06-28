const databaseInfo = {
  projectName: "Lottery Number Generator Website",
  databaseType: "Manual JavaScript database",
  currentUpdateMethod: "Manual",
  futureUpdateGoal: "Daily automated updates",
  futureDatabasePlatform: "Supabase",
  lastUpdated: "Pending real history update"
};

const gameDatabaseSettings = {
  powerball: {
    displayName: "Powerball",
    mainNumbersRequired: 5,
    mainNumberMin: 1,
    mainNumberMax: 69,
    specialBallName: "Powerball",
    specialBallLabel: "PB",
    specialBallMin: 1,
    specialBallMax: 26,
    allowMainRepeats: false,
    hasSpecialBall: true
  },

  mega: {
    displayName: "Mega Millions",
    mainNumbersRequired: 5,
    mainNumberMin: 1,
    mainNumberMax: 70,
    specialBallName: "Mega Ball",
    specialBallLabel: "MB",
    specialBallMin: 1,
    specialBallMax: 24,
    allowMainRepeats: false,
    hasSpecialBall: true
  },

  pick5: {
    displayName: "Pick 5 / Georgia Five",
    mainNumbersRequired: 5,
    mainNumberMin: 0,
    mainNumberMax: 9,
    specialBallName: null,
    specialBallLabel: null,
    specialBallMin: null,
    specialBallMax: null,
    allowMainRepeats: true,
    hasSpecialBall: false
  },

  fantasy5: {
    displayName: "Fantasy 5 / Georgia Fantasy 5",
    mainNumbersRequired: 5,
    mainNumberMin: 1,
    mainNumberMax: 42,
    specialBallName: null,
    specialBallLabel: null,
    specialBallMin: null,
    specialBallMax: null,
    allowMainRepeats: false,
    hasSpecialBall: false
  }
};

const pastNumbers = {
  powerball: [
    {
      drawDate: "Sample",
      numbers: [12, 18, 24, 36, 45],
      specialBall: 7,
      specialBallLabel: "PB",
      source: "Sample data",
      verified: false
    },
    {
      drawDate: "Sample",
      numbers: [3, 15, 27, 41, 62],
      specialBall: 19,
      specialBallLabel: "PB",
      source: "Sample data",
      verified: false
    }
  ],

  mega: [
    {
      drawDate: "Sample",
      numbers: [8, 14, 22, 39, 50],
      specialBall: 12,
      specialBallLabel: "MB",
      source: "Sample data",
      verified: false
    },
    {
      drawDate: "Sample",
      numbers: [5, 17, 31, 44, 66],
      specialBall: 20,
      specialBallLabel: "MB",
      source: "Sample data",
      verified: false
    }
  ],

  pick5: [
    {
      drawDate: "Sample",
      numbers: [1, 2, 3, 4, 5],
      specialBall: null,
      specialBallLabel: null,
      source: "Sample data",
      verified: false
    },
    {
      drawDate: "Sample",
      numbers: [7, 4, 9, 0, 2],
      specialBall: null,
      specialBallLabel: null,
      source: "Sample data",
      verified: false
    }
  ],

  fantasy5: [
    {
      drawDate: "Sample",
      numbers: [4, 12, 18, 27, 39],
      specialBall: null,
      specialBallLabel: null,
      source: "Sample data",
      verified: false
    },
    {
      drawDate: "Sample",
      numbers: [6, 15, 22, 31, 42],
      specialBall: null,
      specialBallLabel: null,
      source: "Sample data",
      verified: false
    }
  ]
};
