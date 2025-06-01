export default {
    testEnvironment: "node",
    transform: {
        "^.+\\.js$": "babel-jest",
    },
    // moduleNameMapper: {
    //     "^(\\.{1,2}/.*)\\.js$": "$1",
    // },
    transformIgnorePatterns: ["/node_modules/(?!mongoose|bson)/"],
};
