const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, 'node_modules', '@builder.io', 'partytown', 'lib'),
          to: path.join(__dirname, 'public', '~partytown'),
        },
      ],
    }),
  ],
};
