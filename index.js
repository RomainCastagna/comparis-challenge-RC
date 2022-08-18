
const puppeteer = require('puppeteer-extra')
const cheerio = require('cheerio');
const fs = require('fs');

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

getOfferById(28389114);
getOfferList();

function getOfferList(){
    puppeteer.launch({ headless: true,args: ['--lang=en-EN,en'] }).then(async browser => {
        const page = await browser.newPage()
        await page.setUserAgent('ScrapingIsTestingAndTestingIsScraping')
        let offers = [];
    
        await page.goto('https://en.comparis.ch/immobilien/marktplatz/wallisellen/mieten')
        console.log(`Arrived on comparis first page`)
        /*Scroll until the end of the page to load the full content*/

        await autoScroll(page);
        const nbrPages = await page.evaluate(() => {
            const uiElement = document.querySelectorAll('.css-1po3bp4.ehesakb1');
            return uiElement[uiElement.length - 2].innerHTML;
        });
   
        console.log(`${nbrPages} pages found`)

        for (let index = 1; index <= nbrPages; index++) {
           await page.click(`[data-css-selector="pagination-item-${index}"]`);
           await page.waitForTimeout(1500)  // await page.waitForFunction('document.querySelectorAll(".css-a0dqn4.ehesakb1").length>9');
           await autoScroll(page);
            const pageData = await page.evaluate(() => {
                return {
                    html: document.documentElement.innerHTML,
                };
            });
            console.log(`scraping page ${index}/${nbrPages}`)
            const $ = cheerio.load(pageData.html);
            let page_offers = $('.css-a0dqn4.ehesakb1');
            page_offers.each((index, element) => {
                offerId = $(element).attr("href").match(/[^/]+$/g)[0];
                title = $(element).find('.css-i6bo67.ehesakb2').text();
                type = $(element).find('.css-dsqae5.ehesakb2').text();
                desc = $(element).find('.css-ejje9.ehesakb2').text();
                location = $(element).find('.css-a7uk28.ehesakb2').text();
                price = $(element).find('.css-1ladu04.ehesakb2').text();
                moredetails = $(element).find('.css-nfvuwa.ehesakb2').text();
                link = $(element).attr("href");
                offers.push({ id: offerId, title: title, type: type, desc: desc, location: location, price: price, moredetails: moredetails, link: link });
            });
            console.log(`${page_offers.length} objects added`)
        }
        console.log(offers.length + " offers found")
        saveData(offers, 'data/offers');
      
        await browser.close()
    })
    
}
async function getOfferById(offer_id) {
  
    puppeteer.launch({ headless: true,args: ['--lang=en-EN,bn'] }).then(async browser => {
        const page = await browser.newPage()
        await page.goto('https://fr.comparis.ch/immobilien/marktplatz/details/show/' + offer_id)
        console.log(`scanning offer : ${offer_id}`)  
        const nbrPicture = await page.evaluate(() => {
            const uiElement = document.querySelectorAll('.css-1xekaht span');
            return uiElement.length;
        });
        const pageData = await page.evaluate(() => {
            return {
                html: document.documentElement.innerHTML,
            };
        });
        const $ = cheerio.load(pageData.html);

        let offer={}
        offer.id=offer_id;
        offer.images=[];
        offer.title=$(".css-yidf68.ehesakb2").text();
        offer.location=$(".css-15z12tn.ehesakb2").text();
        //all other details in default browser language
        $(".css-1jy9b6z.ehesakb4").each(function(i,element)
        {
            offer[$(this).find(".css-cyiock.ehesakb2 span").text().trim()]=$(this).find(".css-1ush3w6.ehesakb2 span").text().trim()===""?true:$(this).find(".css-1ush3w6.ehesakb2 span").text().trim()
        })
        //images
        for (let index = 0; index <nbrPicture; index++) {
           
            await page.click(`.css-1xekaht span:nth-child(${index+1})`);
            const url = await page.evaluate(() => {
                const iamge = document.querySelector('.css-bjn8wh img:nth-child(1)');
                return iamge.getAttribute("src");
            });
            offer.images.push(url);
        }
        
        //saving the offer
        saveData(offer,"data/offers_detail/"+offer_id)
    })

}
async function saveData(rawData, fileName) {
    let data = JSON.stringify(rawData, null, 2);

    fs.writeFile(`${fileName}.json`, data, (err) => {
        if (err) throw err;
        console.log(`Json data saved : ${fileName}.json`);
    });

}
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 1);
        });
    });
}
