/* @samsamdu44 */
// Différentes fonctions qui vont être utilisées
// getBestPairs : pour choisir les cryptos
// placeOrder : passer l'ordre

const CryptoJS = require("crypto-js");
const got = require("got");
const fs = require('fs')

// Constantes pour les transactions
const server = "https://api.cointiger.com/exchange/trading/api";
const api_key = "568fca58-c9c8-4594-8333-e9bd8e0e9f53";
const secret_key = "OWNkNmUzMTcwOGRkNGFjN2I3OTc1OTJlMGQ1NmQxNzVmZGQ5ODI4NTRlMjk1YzM0OWVmZGFjM2QwNWE4Yzk2ZQ==";

const placeOrderURL = "/v3.1/orderpending/trade";
const queryPairs = "/v2/currencys/v2";
const prices = ["/market/depth?api_key=100310001&symbol=","&type=step0"];

const minOrder = 3;
const matTypeOrder = [["buys", "asks", "buys"], ["asks", "buys", "asks"]];
const matMult = [[1, -1, 1], [-1, 1, -1]]


// On fait la liste de toute les chemins possibles avec crypto1 et crypto2
async function listePaires(crypto1, crypto2) {
	let req = await got(server+queryPairs); // demande toute les pairs tradables
	let req1, req2, req3, res1, res2, res3;
	
	// On s'intéresse uniquement aux pairs tradable avec le btc, l'eth et l'usdt
	let resBUE = [JSON.parse(req.body)["data"]["btc-partition"], JSON.parse(req.body)["data"]["usdt-partition"], JSON.parse(req.body)["data"]["eth-partition"]];
	let cryptoSet;

	let listCrypto1 = []; // contient une crypto tradable avec crypto1
	let listCrypto2 = []; // avec crypto2

	for (res of resBUE) {
		for (let i = 0; i < res.length; i++) {
			if (res[i]["quoteCurrency"].toUpperCase() == crypto1) {
				listCrypto1.push(res[i]["baseCurrency"].toUpperCase());
			}
			else if (res[i]["quoteCurrency"].toUpperCase() == crypto2) {
				listCrypto2.push(res[i]["baseCurrency"].toUpperCase());
			}
		}
	}
	cryptoSet = listCrypto1.filter(x => listCrypto2.includes(x));

	for (let index=0; index < cryptoSet.length; index++) {
			req1 = await got(server+prices[0]+(crypto1+crypto2).toLowerCase()+prices[1]);
			res1 = parseFloat(JSON.parse(req1.body)["data"]["depth_data"]["tick"]["asks"].length);
			res11 = parseFloat(JSON.parse(req1.body)["data"]["depth_data"]["tick"]["buys"].length);

			req2 = await got(server+prices[0]+(cryptoSet[index]+crypto2).toLowerCase()+prices[1]);	
			res2 = parseFloat(JSON.parse(req2.body)["data"]["depth_data"]["tick"]["buys"].length);
			res22 = parseFloat(JSON.parse(req2.body)["data"]["depth_data"]["tick"]["asks"].length);

			req3 = await got(server+prices[0]+(cryptoSet[index]+crypto1).toLowerCase()+prices[1]);
			res3 = parseFloat(JSON.parse(req3.body)["data"]["depth_data"]["tick"]["asks"].length);
			res33 = parseFloat(JSON.parse(req3.body)["data"]["depth_data"]["tick"]["buys"].length);

			if (res1 < minOrder || res2 < minOrder || res3 < minOrder || res11 < minOrder || res22 < minOrder || res33 < minOrder) {
				cryptoSet.splice(index, 1);
				index-=1;
			}
	}
	return cryptoSet;
}



// Renvoie directement le prix voulue pour la paire cryptoA/cryptoB, type : bids ou asks
async function makeRequest(cryptoA, cryptoB, type) {
	let req = await got(server+prices[0]+(cryptoA+cryptoB).toLowerCase()+prices[1]);
	return parseFloat(JSON.parse(req.body)["data"]["depth_data"]["tick"][type][0][0]);
}


// Procédure qui boucle et vérifie pour un set de crypto 
// si il y'a une occasion
async function loopRequest(cryptoSet, crypto1, crypto2, seuil, inv) {
	let req, marge, d;
	let askCrypto1, askX, bidX;

	for (let i = 0; i < cryptoSet.length; i++) {
		marge = 1;
		askCrypto1 = await makeRequest(crypto1, crypto2, matTypeOrder[inv][0]);
		marge *= Math.pow(askCrypto1, matMult[inv][0]);
		//console.log("1",askCrypto1)

		bidX = await makeRequest(cryptoSet[i], crypto2, matTypeOrder[inv][1]);
		marge *= Math.pow(bidX, matMult[inv][1]);
		//console.log("2",bidX);

		askX = await makeRequest(cryptoSet[i], crypto1, matTypeOrder[inv][2]);
		marge *= Math.pow(askX, matMult[inv][2]);
		//console.log("3",askX);

		if (marge > seuil) {
			d = new Date();
			console.log("["+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"] ALERT", cryptoSet[i], marge);
			//console.log(askCrypto1, bidX, askX);
		}
	}
	if (cryptoSet.length > 0) {
		loopRequest(cryptoSet, crypto1, crypto2, seuil, inv);
	}
}




// Donne la marge en boucle sur une paire en particulier et la stocke dans un fichier
async function loopCrypto(crypto1, crypto2, crypto3, temps, inv) {
	let liste  = [];
	let listeDate = [];
	let deb = Date.now();
	let fin;
	while (Date.now()-deb < temps*1000) {
		marge = 1;
		askCrypto1 = await makeRequest(crypto1, crypto2, matTypeOrder[inv][0]);
		marge *= Math.pow(askCrypto1, matMult[inv][0]);

		bidX = await makeRequest(crypto3, crypto2, matTypeOrder[inv][1]);
		marge *= Math.pow(bidX, matMult[inv][1]);

		askX = await makeRequest(crypto3, crypto1, matTypeOrder[inv][2]);
		marge *= Math.pow(askX, matMult[inv][2]);
		
		//console.log("3",bidX);
		fin = Date.now();

		liste.push(marge);
		listeDate.push(fin-deb);
	}

	fs.writeFile("data.txt", liste, err => {
  		if (err) {
    		console.error(err);
    		return;
  		}	
  		console.log("Fichier des prix. Done.");
	});

	fs.writeFile("dataH.txt", listeDate, err => {
  		if (err) {
    		console.error(err);
    		return;
  		}
  		console.log("Fichier du temps. Done.");
	});
}


// pair : string, ex : "LTC_ETH"
// ordType : entier, 2 : Limit order
// ordSide : entier, 1-buy, 2-sell
// price : flottant,
// amount : flottant
async function placeOrder(pair, ordType, ordSide, price, amount) {
	d = new Date();
	if (ordSide == 1) {
		console.log("["+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"] ACHAT en cours de",amount,pair.split("_")[0]);
	}
	else {
		console.log("["+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"] VENTE en cours",amount,pair.split("_")[0],"contre ",pair.split("_")[1]);
	}

	let param = {
	    "pair": pair,
	    "account_type": 0,
	    "order_side": ordSide,
	    "order_type": ordType,
	    "price": price,
	    "amount": amount,
	};

	let cmd = JSON.stringify(param);
	let timestamp = ""+(Date.now());
	let sign = CryptoJS.HmacMD5(timestamp + cmd, secret_key).toString();//sign cmds

	req = await got.post(server+placeOrderURL,{
		headers: {
            'content-type':'application/json',
            'bibox-api-key': api_key,
            'bibox-api-sign': sign,
            'bibox-timestamp': timestamp			
		},
		body: cmd
	});

	res = JSON.parse(req["body"]);

	if (res["state"] == 0) {
		console.log("")
	}
}





 module.exports.getBestPairs = function() {
        return bestPairs();
    }

 module.exports.placeOrder = function(pair, ordType, ordSide, price, amount) {
        return placeOrder(pair, ordType, ordSide, price, amount);
    }

 module.exports.getListePaires = function(crypto1, crypto2) {
        return listePaires(crypto1, crypto2);
    }

module.exports.loopRequest = function(cryptoSet, crypto1, crypto2, seuil, inv) {
        return loopRequest(cryptoSet, crypto1, crypto2, seuil, inv);
    }

module.exports.loopCrypto = function(crypto1, crypto2, crypto3, temps, inv) {
	return loopCrypto(crypto1, crypto2, crypto3, temps, inv);
}