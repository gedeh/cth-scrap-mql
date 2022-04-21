# Scrap MQL5 Website

## Setup

1. Clone this repository
1. Install Node v14
1. Run **`npm install`**
1. Configure location of Google Chrome and Signal ID to scrape in **config.json**

    ```json
    {
      "chrome": "/Path/To/Google/Chrome/Executable",
      "signals": [ 1489938, 1451340 ]
    }
    ```

1. Optional: Build executable binaries using **`npm run build`**

## Running

- Using Node: run **`node index.mjs`**
- Using executable binaries: run **`dist/mql-web-scraper-macos`** on MacOS or **`dist/mql-web-scraper-win.exe`** on Windows
- The details will be saved in **results** directory:

  - Screenshot of each signal
  - File **result.json** contains JSON representation of the signals
  - File **result.csv** contains CSV data of the signals
