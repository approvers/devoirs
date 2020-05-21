const os = require('os');

console.error(
    [
        'Executing from this entry point is not supported.',
        'Use `npm start` instead.',
    ]
        .join(os.EOL)
);
