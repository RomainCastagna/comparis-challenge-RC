<!-- GETTING STARTED -->
## Getting Started

This is my solution to the comparis challenge using Nodejs

### Prerequisites

I am using Nodejs version 16.16.0

  
 ### Installation

_Below are the steps that you have to follow to run the scraper._

1. Clone the repo
   ```sh
   git clone https://github.com/RomainCastagna/comparis-challenge-RC.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. choose the function you want to run in `index.js` at ligne 9 and 10
   ```js
    getOfferById(offer_id); //to scrap a specific offer e.g. : 28389114
    //or
    getOfferList(); //to get the list of all offers from https://en.comparis.ch/immobilien/marktplatz/wallisellen/mieten
    ```    
4. Start the scraper `index.js`
   ```sh
    node index;
    ```
4. The data are located in the _data_ folder 


