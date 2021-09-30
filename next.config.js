const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  webpack: (config, { dev }) => {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'node_modules', '@builder.io', 'partytown', 'lib'),
            to: path.join(__dirname, 'public', '~partytown'),
          },
        ],
      }))
    
    return config
  }
}