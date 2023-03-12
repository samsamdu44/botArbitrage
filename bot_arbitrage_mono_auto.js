/* @samsamdu44 */
// STRATEGIE ///
// ETH -> USDT -> X -> ETH ou
// ETH -> X -> USDT -> ETH
// Sens normal : Vendre ETH pour USDT; Acheter X avec USDT; Vendre X pour ETH
// Inverse : Acheter X avec ETH; Vendre X pour USDT; Acheter ETH avec USDT

const got = require("got");
const fonc = require("./fonctions.js");

// Attention, sur certaines paires le nombre de chiffre après la virgule est très faible
// Il faut donc mettre plus d'argent ou attendre un pourcentage plus important



async function main() {
	//let max = await fonc.getBestPairs();
	//console.log(max);
	let crypto1 = "BTC"; // BTC
	let crypto2 = "USDT"; // USDT
	let modeInv = 0;
	let pourcentage = 1.01;

	let d = new Date();
	console.log("["+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"] Initialisation...")
	let cryptoSet = await fonc.getListePaires(crypto1, crypto2).then(); // Donne le set de paires sur lequel on va travailler
	d = new Date();
	console.log("["+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"] Taille du set :",cryptoSet.length)
	if (modeInv == 1) {
		console.log("["+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"] Mode inversé")
	}
	else {
		console.log("["+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+"] Mode normal")		
	}
	//fonc.loopCrypto("BTC", "USDT", "ULT", 2000, modeInv);
	// 2000 sec = 33m20s
	
	fonc.loopRequest(cryptoSet, crypto1, crypto2, pourcentage, modeInv);

}

//BTC-USDT-HPB-BTC

// ET PAF
main();



// Exemple d'ordre
//fonc.placeOrder("LTC_ETH", 2, 1, 0.04, 1);