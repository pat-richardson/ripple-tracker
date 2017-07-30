# Ripple Ticker

**Clone to monitor cryptocurrency values**

This is a simple Electron desktop app that uses API's to track desired cryptocurrency values. It accepts a ripple wallet address is provided and stores it locally to show the current value of the wallet based on the currency price.


## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/pat-richardson/ripple-tracker.git
# Go into the repository
cd ripple-tracker
# Install dependencies
npm install
# Run the app
npm start
```

## Configuration

Update config.currencies in app.js with desired currency abbreviations to track.

```javascript
 var config = {
    ...
    currencies: ['BTC', 'ETH', 'XRP'],
    ...
  };
```
