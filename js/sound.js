//only for irish

function ParseText(text) {
	text = text.toLowerCase();
	text = text.replace(/['’",;:!\.\?\(\)\-]/g, "")

	//special words
	text = text.replace(/(?<=[ ])(is)(?=[ ])/gi, "ઇ");
	text = text.replace(/^(is)(?=[ ])/gi, "ઇ");
	text = text.replace(/fh/gi, "");

	//long -> silenced -> else
	let LngRegex = /(aei|aoi|ae|ao|aío|eái|iái|iói|iúi|oío|uái|uío|uói|ái|aí|éa|éi|eá|ío|iá|ió|iú|ói|oí|úi|uá|uí|uó|á|é|í|ó|ú)/i;
	let ComRegex = /(aighea|eabhai|eadhai|eaghai|eamhai|eidhea|eighea|eobhai|eodhai|eoghai|eomhai|iumhai|oidhea|oighea|abhai|adhai|aghai|aidhe|aighe|amhai|eabha|eadha|eagha|eamha|eidhi|eighi|eobha|eodha|eogha|eomha|iumha|obhai|odhai|oghai|oidhi|oighi|omhai|umhai|abha|adha|agha|aidh|aigh|amha|eabh|eadh|eagh|eamh|eidh|eigh|eobh|eodh|eogh|eomh|iubh|iumh|obha|odha|ogha|oidh|oigh|omha|uigh|umha|abh|adh|agh|amh|idh|igh|obh|odh|ogh|omh|ubh|umh|eoi|eo)/i;
	let ElsRegex = /(ઇ|eai|iai|uai|ai|ei|ea|ia|io|iu|oi|ua|ui|a|e|i|o|u|bhf|bh|bp|ch|dh|dt|fh|gc|gh|ll|mb|mh|nc|nd|ng|nn|ph|rr|sh|th|ts|b|c|d|f|g|h|j|l|m|n|p|r|s|t|v|z|\s|\t+|\|)/i;

	let P1 = text.split(LngRegex);

	let P2 = [];
	for (let i = 0; i < P1.length; i ++) {
		let e = P1[i];
		if (LngRegex.test(e)) { P2.push(e); }
		else { let P = e.split(ComRegex); P2 = P2.concat(P); }
	}

	let P3 = [];
	for (let i = 0; i < P2.length; i ++) {
		let e = P2[i];
		if (LngRegex.test(e) || ComRegex.test(e)) { P3.push(e); }
		else { let P = e.split(ElsRegex); P3 = P3.concat(P); }
	}

	let Parse = P3.filter(item => item !== "");
	Parse.unshift(" "); Parse.unshift(" "); Parse.push(" "); Parse.push(" ");

	//silent parts
	for (let i = 0; i < Parse.length; i ++) {
		if (Parse[i - 1] != " " && ["dh", "gh", "fh"].includes(Parse[i])) {
			Parse.splice(i, 1);
		}
	}

	Parse = markSlender(Parse); Parse = markStress(Parse);
	
	//split nch, nd, ngh
	for (let i = 0; i < Parse.length; i++) {
		const current = Parse[i];
		const prev = Parse[i - 1];
		const next = Parse[i + 1];

		if ((current === "nd" || current === "ND" ) && prev !== " ") {
			Parse[i] = current[0];
			Parse.splice(i + 1, 0, current[1]);
		}
		else if (current.toLowerCase() === "nc" && next?.toLowerCase() === "h") {
			Parse[i] = current[0];
			Parse[i + 1] = current[1] + next;
		}
		else if (current.toLowerCase() === "ng" && next?.toLowerCase() === "h") {
			Parse[i] = current[0];
			Parse[i + 1] = current[1] + next;
		}
	}

	return Parse;
}

function GetIPA(text, hideSyllableMark = false, forHangulOnly = false) {
	let Parse = ParseText(text);

	//to IPA
	let IPA = new Array(Parse.length);
	IPA.fill(" ");

	//special words
	for (let i = 0; i < Parse.length; i ++) {
		if (Parse[i] == "ઇ") {
			IPA[i] = "ɪs"
		}
	}

	//silenced combinations; cap = stressed
	const CombinationList = ["ABH", "ABHA", "ABHAI", "EABH", "EABHA", "EABHAI", "ADH", "ADHA", "ADHAI", "AGH", "AGHA", "AGHAI", "EADH", "EADHA", "EADHAI", "EAGH", "EAGHA", "EAGHAI", "AIDH", "AIDHE", "AIGH", "AIGHE", "AIGHEA", "AMH", "AMHA", "AMHAI", "EAMH", "EAMHA", "EAMHAI", "EIDH", "EIDHEA", "EIDHI", "EIGH", "EIGHEA", "EIGHI", "IDH", "IGH", "UIGH", "OIDH", "OIDHEA", "OIDHI", "OIGH", "OIGHEA", "OIGHI", "OBH", "OBHA", "OBHAI", "ODH", "ODHA", "ODHAI", "OGH", "OGHA", "OGHAI", "EOBH", "EOBHA", "EOBHAI", "EODH", "EODHA", "EODHAI", "EOGH", "EOGHA", "EOGHAI", "OMH", "OMHA", "OMHAI", "EOMH", "EOMHA", "EOMHAI", "UBH", "IUBH", "UMH", "UMHA", "UMHAI", "IUMH", "IUMHA", "IUMHAI", "abh", "abha", "abhai", "eabh", "eabha", "eabhai", "adh", "adha", "adhai", "agh", "agha", "aghai", "eadh", "eadha", "eadhai", "eagh", "eagha", "eaghai", "aidh", "aidhe", "aigh", "aighe", "aighea", "amh", "amha", "amhai", "eamh", "eamha", "eamhai", "eidh", "eidhea", "eidhi", "eigh", "eighea", "eighi", "idh", "igh", "uigh", "oidh", "oidhea", "oidhi", "oigh", "oighea", "oighi", "obh", "obha", "obhai", "odh", "odha", "odhai", "ogh", "ogha", "oghai", "eobh", "eobha", "eobhai", "eodh", "eodha", "eodhai", "eogh", "eogha", "eoghai", "omh", "omha", "omhai", "eomh", "eomha", "eomhai", "ubh", "iubh", "umh", "umha", "umhai", "iumh", "iumha", "iumhai"];

	const CombinationIPA = forHangulOnly == false ? ["au̯", "au̯", "au̯", "au̯", "au̯", "au̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "au̯", "au̯", "au̯", "au̯", "au̯", "au̯", "ei̯", "ei̯", "ei̯", "ei̯", "ei̯", "ei̯", "iː", "iː", "iː", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "ai̯", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "uː", "uː", "uː", "uː", "uː", "uː", "uː", "uː", "ə", "ə", "ə", "ə", "ə", "ə", "ə", "ə", "ə", "ə", "ə", "ə", "ə", "ə", "ə", "ə", "ə", "ə", "iː", "iː", "iː", "iː", "iː", "ə", "ə", "ə", "ə", "ə", "ə", "eː", "eː", "eː", "eː", "eː", "eː", "ɪ", "ɪ", "ɪ", "əi̯", "əi̯", "əi̯", "əi̯", "əi̯", "əi̯", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "oː", "uː", "uː", "uː", "uː", "uː", "uː", "uː", "uː"] : ["au", "au", "au", "au", "au", "au", "ai", "ai", "ai", "ai", "ai", "ai", "ai", "ai", "ai", "ai", "ai", "ai", "ai", "ai", "ai", "ai", "ai", "au", "au", "au", "au", "au", "au", "ei", "ei", "ei", "ei", "ei", "ei", "i", "i", "i", "ai", "ai", "ai", "ai", "ai", "ai", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "u", "u", "u", "u", "u", "u", "u", "u", "u", "u", "u", "u", "u", "u", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "i", "i", "i", "i", "i", "u", "u", "u", "u", "u", "u", "e", "e", "e", "e", "e", "e", "i", "i", "i", "ai", "ai", "ai", "ai", "ai", "ai", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "o", "u", "u", "u", "u", "u", "u", "u", "u"];

	const map_comb = new Map(
		CombinationList.map((item, index) => [item, CombinationIPA[index]])
	);
	Parse.forEach((item, index) => {
		const ipaValue = map_comb.get(item);
		if (ipaValue !== undefined) {
			IPA[index] = ipaValue;
		}
	});

	//Vowels
	let VowelList = ["aei", "aío", "aoi", "eai", "eái", "eoi", "iai", "iái", "iói", "iúi", "oío", "uai", "uái", "uío", "uói", "ái", "ae", "ai", "aí", "ao", "ei", "éa", "éi", "ea", "eá", "eo", "ío", "ia", "iá", "io", "ió", "iu", "iú", "ói", "oi", "oí", "úi", "ua", "uá", "ui", "uí", "uó", "a", "á", "e", "é", "i", "í", "o", "ó", "u", "ú"];

	for (let i = 0; i < Parse.length; i ++) {
		let part = "";
		for (let j = 0; j < VowelList.length; j ++) {
			if (Parse[i].toLowerCase() == VowelList[j]) {
				part = Parse[i]; break;
			}
		}
		if (part == "") {continue}

		//vowel place conditions
		let Back = []
		let Forth = []
		for (let j = Math.max(0, i - 3); j < i; j ++) {
			Back.push(Parse[j].toLowerCase())
		}
		for (let j = i + 1; j < Math.min(i + 3, Parse.length); j ++) {
			Forth.push(Parse[j].toLowerCase())
		}
		let precede = Back.join("").split("").reverse().join("")
		let follow = Forth.join("")

		//long vowel -> stressed == unstressed
		if (/(Á)|(É)|(Í)|(Ó)|(Ú)|(AE)|(AO)|(EO)|(IA)|(IO)|(IU)|(UA)/.test(part)) {
			part = part.toLowerCase();
		}

		if (part == "A" || part == "AI" || part == "EA" || part == "EAI") {
			if (/^(rd)|(rl)|(rn)|(rr)|(ll)|(nn)|(m)/.test(follow)) {
				IPA[i] = "aː"
			} else {
				IPA[i] = "a"
			}
		}
		else if (part == "a" || part == "ai" || part == "ea" || part == "eai") {
			IPA[i] = forHangulOnly == false ? "ə" : "a";
		}
		else if (part == "á" || part == "ái" || part == "eá" ||part == "eái") {
			IPA[i] = "aː"
		}
		else if (part == "ae" || part == "aei") {
			IPA[i] = "eː"
		}
		else if (part == "aí" || part == "aío" || part == "ao" || part == "aoi" || part == "oí" || part == "oío" || part == "uí" || part == "uío") {
			IPA[i] = "iː"
		}
		else if (part == "E" || part == "EI") {
			if (/^(rd)|(rl)|(rn)|(nn)/.test(follow)) {
				IPA[i] = "eː"
			} else if (/^(m)|(mh)|(n)/.test(follow)) {
				IPA[i] = "e"
			} else {
				IPA[i] = "ɛ"
			}
		}
		else if (part == "e" || part == "ei") {
			IPA[i] = forHangulOnly == false ? "ə" : "e";
		}
		else if (part == "é" || part == "éa" || part == "éi") {
			IPA[i] = "eː"
		}
		else if (part == "eo" || part == "eoi") {
			IPA[i] = "oː"
		}
		else if (part == "I") {
			if (/^(ll)|(nn)|(m)/.test(follow)) {
				IPA[i] = "iː"
			} else {
				IPA[i] = "ɪ"
			}
		}
		else if (part == "i") {
			IPA[i] = forHangulOnly == false ? "ɪ" : "i";
		}
		else if (part == "í" || part == "ío") {
			IPA[i] = "iː"
		}
		else if (part == "ia" || part == "iai") {
			IPA[i] = forHangulOnly == false ? "iə" : "ia";
		}
		else if (part == "iá" || part == "iái") {
			IPA[i] = "iː.aː"
		}
		else if (part == "io") {
			IPA[i] = "ɪ";
		}
		else if (part == "ió" || part == "iói") {
			IPA[i] = "iː.oː"
		}
		else if (part == "iu") {
			IPA[i] = "ʊ"
		}
		else if (part == "iú" || part == "iúi" || part == "ú" || part == "úi") {
			IPA[i] = "uː"
		}
		else if (part == "O") {
			if (/^(rd)|(rl)|(rn)/.test(follow)) {
				IPA[i] = "oː"
			} else if (/^(nn)|(m)|(ng)/.test(follow)) {
				IPA[i] = "oː"
			} else {
				IPA[i] = "ɔ"
			}
		}
		else if (part == "o") {
			IPA[i] = forHangulOnly == false ? "ə" : "o";
		}
		else if (part == "ó" || part == "ói") {
			IPA[i] = "oː"
		}
		else if (part == "OI") {
			if (/^(cht)|(rs)|(rt)|(s)/.test(follow)) {
				IPA[i] = "ɔ";
			} else if (/^(rd)|(rl)|(rn)/.test(follow)) {
				IPA[i] = "oː";
			} else {
				IPA[i] = "ɪ";
			}
		}
		else if (part == "oi") {
			if (/^(cht)|(rs)|(rt)|(s)|(rd)|(rl)|(rn)/.test(follow)) {
				IPA[i] = forHangulOnly == false ? "ə" : "o";
			} else {
				IPA[i] = forHangulOnly == false ? "ə" : "i";
			}
		}
		else if (part == "U") {
			if (/^(rd)|(rl)|(rn)/.test(follow)) {
				IPA[i] = "uː"
			} else {
				IPA[i] = "ʊ"
			}
		}
		else if (part == "u") {
			IPA[i] = forHangulOnly == false ? "ə" : "u";
		}
		else if (part == "ua" || part == "uai") {
			IPA[i] = forHangulOnly == false ? "uə" : "ua";
		}
		else if (part == "uá" || part == "uái") {
			IPA[i] = "uː.aː"
		}
		else if (part == "UI") {
			if (/^(rd)|(rl)|(rn)|(ll)|(m)|(nn)/.test(follow)) {
				IPA[i] = "iː"
			} else {
				IPA[i] = "ɪ"
			}
		}
		else if (part == "ui") {
			IPA[i] = forHangulOnly == false ? "ə" : "i";
		}
		else if (part == "uó" || part == "uói") {
			IPA[i] = "uː.oː"
		}
	}

	//Consonants
	let ConsonantList = ["bhf", "bh", "bp", "ch", "dh", "dt", "fh", "gc", "gh", "ll", "mb", "mh", "nc", "nd", "ng", "nn", "ph", "rr", "sh", "th", "ts", "b", "c", "d", "f", "g", "h", "j", "l", "m", "n", "p", "r", "s", "t", "v", "z", "BHF", "BH", "BP", "CH", "DH", "DT", "FH", "GC", "GH", "LL", "MB", "MH", "NC", "ND", "NG", "NN", "PH", "RR", "SH", "TH", "TS", "B", "C", "D", "F", "G", "H", "J", "L", "M", "N", "P", "R", "S", "T", "V", "Z"]

	for (let i = 0; i < Parse.length; i ++) {
		let part = ""
		for (let j = 0; j < ConsonantList.length; j ++) {
			if (Parse[i] == ConsonantList[j]) {
				part = Parse[i]
				break
			}
		}
		if (part == "") {continue}

		//consonant place conditions
		let Back = []
		let Forth = []
		for (let j = Math.max(0, i - 3); j < i; j ++) {
			Back.push(Parse[j].toLowerCase())
		}
		for (let j = i + 1; j < Math.min(i + 3, Parse.length); j ++) {
			Forth.push(Parse[j].toLowerCase())
		}
		let precede = Back.join("").split("").reverse().join("")
		let follow = Forth.join("")

		if (part == "b" || part == "bp") {
			IPA[i] = "bˠ"
		}
		else if (part == "B" || part == "BP") {
			IPA[i] = "bʲ"
		}
		else if (part == "bh" || part == "bhf" || part == "mh" || part == "v") {
			IPA[i] = "w"
		}
		else if (part == "BH" || part == "BHF" || part == "MH" || part == "V") {
			IPA[i] = "vʲ"
		}
		else if (part == "c") {
			IPA[i] = "k"
		}
		else if (part == "C") {
			IPA[i] = "c"
		}
		else if (part == "ch") {
			IPA[i] = "x"
		}
		else if (part == "CH") {
			if (/^[t]/.test(follow)) {
				IPA[i] = "x"
			} else {
				IPA[i] = "ç"
			}
		}
		else if (part == "d") {
			IPA[i] = "dˠ"
		}
		else if (part == "D") {
			IPA[i] = "dʲ"
		}
		else if (part == "dh" || part == "gh") {
			//it means it's initial
			if (IPA[i - 1] == " " || /^[\s]/.test(IPA[i - 1].split("").reverse().join(""))) {
				IPA[i] = "ɣ"
			} else {
				IPA[i] = ""
			}
		}
		else if (part == "DH" || part == "GH") {
			//it means it's initial
			if (IPA[i - 1] == " " || /^[\s]/.test(IPA[i - 1].split("").reverse().join(""))) {
				IPA[i] = "j"
			} else {
				IPA[i] = ""
			}
		}
		else if (part == "dt") {
			//it means it's initial
			if (IPA[i - 1] == " " || /^[\s]/.test(IPA[i - 1].split("").reverse().join(""))) {
				IPA[i] = "dˠ"
			} else {
				IPA[i] = "tˠ"
			}
		}
		else if (part == "DT") {
			if (IPA[i - 1] == " " || /^[\s]/.test(IPA[i - 1].split("").reverse().join(""))) {
				IPA[i] = "dʲ"
			} else {
				IPA[i] = "tʲ"
			}
		}
		else if (part == "f" || part == "ph") {
			IPA[i] = "fˠ"
		}
		else if (part == "F" || part == "PH") {
			IPA[i] = "fʲ"
		}
		else if (part == "fh" || part == "FH") {
			IPA[i] = ""
		}
		else if (part == "g" || part == "gc") {
			IPA[i] = "ɡ"
		}
		else if (part == "G" || part == "GC") {
			IPA[i] = "ɟ"
		}
		else if (part == "h" || part == "H" || part == "sh" || part == "SH") {
			IPA[i] = "h"
		}
		else if (part == "j" || part == "J") {
			IPA[i] = "ʤ"
		}
		else if (part == "l" || part == "ll") {
			IPA[i] = "lˠ"
		}
		else if (part == "L" || part == "LL") {
			IPA[i] = "lʲ"
		}
		else if (part == "m" || part == "mb") {
			IPA[i] = "mˠ"
		}
		else if (part == "M" || part == "MB") {
			IPA[i] = "mʲ"
		}
		else if (part == "n") {
			let pre = ""
			for (let j = 0; j < ConsonantList.length; j ++) {
				if (Parse[i - 1] == ConsonantList[j]) {
					pre = Parse[i - 1].toLowerCase()
					break
				}
			}
			if ((pre != "" && pre != "s" && pre != "sh") && (IPA[i - 2] == " " || /^[\s]/.test(IPA[i - 2].split("").reverse().join("")))) {
				IPA[i] = "ɾˠ"
			} else {
				IPA[i] = "nˠ"
			}
		}
		else if (part == "N") {
			let pre = ""
			for (let j = 0; j < ConsonantList.length; j ++) {
				if (Parse[i - 1] == ConsonantList[j]) {
					pre = Parse[i - 1].toLowerCase()
					break
				}
			}
			if ((pre != "" && pre != "s" && pre != "sh") && (IPA[i - 2] == " " || /^[\s]/.test(IPA[i - 2].split("").reverse().join("")))) {
				IPA[i] = "ɾʲ"
			} else {
				IPA[i] = "nʲ"
			}
		}
		else if (part == "nc") {
			IPA[i] = "ŋk"
		}
		else if (part == "NC") {
			IPA[i] = "ɲc"
		}
		else if (part == "nd" || part == "nn") {
			IPA[i] = "nˠ"
		}
		else if (part == "ND" || part == "NN") {
			IPA[i] = "nʲ"
		}
		else if (part == "ng") {
			IPA[i] = "ŋ"
		}
		else if (part == "NG") {
			IPA[i] = "ɲ"
		}
		else if (part == "p") {
			IPA[i] = "pˠ"
		}
		else if (part == "P") {
			IPA[i] = "pʲ"
		}
		else if (part == "r" || part == "rr" || part == "RR") {
			IPA[i] = "ɾˠ"
		}
		else if (part == "R") {
			if ((IPA[i - 1] == " " || /^[\s]/.test(IPA[i - 1].split("").reverse().join(""))) || /^[dlnrst]/.test(follow) || /^[s]/.test(precede)) {
				IPA[i] = "ɾˠ"
			} else {
				IPA[i] = "ɾʲ"
			}
		}
		else if (part == "s") {
			IPA[i] = "sˠ"
		}
		else if (part == "S") {
			if ((IPA[i - 1] == " " || /^[\s]/.test(IPA[i - 1].split("").reverse().join(""))) && /^[fmpr]/.test(follow)) {
				IPA[i] = "sˠ"
			} else {
				IPA[i] = "ʃ"
			}
		}
		else if (part == "t" || part == "ts") {
			IPA[i] = "tˠ"
		}
		else if (part == "T" || part == "TS") {
			IPA[i] = "tʲ"
		}
		else if (part == "th" || part == "TH") {
			//it means it's final
			if (/^[\s]/.test(Parse[i + 1])) {
				IPA[i] = ""
			} else {
				IPA[i] = "h"
			}
		}
		else if (part == "z") {
			IPA[i] = "zˠ"
		}
		else if (part == "Z") {
			IPA[i] = "ʒ"
		}
	}

	//for syllable-final th
	for (let i = 0; i < Parse.length; i ++) {
		if (Parse[i].toLowerCase() == "th" && IPA[i] == "h") {
			if (/^[bwvkcxçɣdtfɡɟʤlmnɾŋɲpsʃzʒ]/.test(IPA[i + 1]) && (/ː/.test(IPA[i - 1]) || /(au̯)|(ai̯)|(iə)|(ia)|(uə)|(ua)/.test(IPA[i - 1]) )) {
				IPA[i] = ""
			}
		}
	}

	//for ŋ to ŋɡ
	for (let i = 0; i < Parse.length; i ++) {
		if (IPA[i] == "ŋ") {
			if (IPA[i - 1] != " " && (/[aeiouəɛɪɔʊ]/.test(IPA[i + 1]))) {
				IPA[i] = "ŋɡ"
			}
		}
	}

	//epenthesis
	if (forHangulOnly === false) {
		for (let i = 0; i < Parse.length; i ++) {
			if (["l", "n", "r"].includes(Parse[i].toLowerCase()) && ["b", "bh", "ch", "d", "g", "m", "mh"].includes(Parse[i + 1].toLowerCase()) && !/"ː"/.test(IPA[i - 1]) && !/(au̯)|(ai̯)|(iə)|(ia)|(uə)|(ua)/.test(IPA[i - 1]) ) {
				IPA[i] = IPA[i] + "ə"
			}
		}
	}

	//print
	IPA.shift(); IPA.shift(); IPA.pop(); IPA.pop();
	let result = IPA.join("");
	result = result.replace(/[ˠ]/g, "");
	result = result.replace(/(.)\1+/g, '$1');

	return result;
}

function markSlender(T) {
	const result = [...T];

	function isConsonant(str) {
		return str !== " " && !/[aeiouáéíóú]/i.test(str);
	}
	function isVowel(str) {
		return str !== " " && /[aeiouáéíóú]/i.test(str);
	}
	function hasEorI(str) {
		return /[eiéí]/i.test(str);
	}

	function findNearestVowel(index) {
		let leftDistance = Infinity; let rightDistance = Infinity;
		let leftVowel = null; let rightVowel = null;

		for (let i = index - 1; i >= 0; i--) { // left
			if (T[i] === " ") break;
			if (isVowel(T[i])) {
				function getLastVowel(str) {
					const vowels = str.match(/[aeiouáéíóú]/gi);
					return vowels ? vowels[vowels.length - 1] : null;
				}
				leftVowel = getLastVowel(T[i]);
				leftDistance = index - i;
				break;
			}
		}

		for (let i = index + 1; i < T.length; i++) { // right
			if (T[i] === " ") break;
			if (isVowel(T[i])) {
				rightVowel = T[i].charAt(0);
				rightDistance = i - index;
				break;
			}
		}

		if (leftDistance < rightDistance) {
			return leftVowel;
		} else if (rightDistance < leftDistance) {
			return rightVowel;
		} else if (leftDistance === rightDistance && rightDistance !== Infinity) {
			return rightVowel;
		}
		
		return null;
	}
	
	for (let i = 0; i < T.length; i++) {
		if (isConsonant(T[i])) {
			const nearestVowel = findNearestVowel(i);
			if (nearestVowel && hasEorI(nearestVowel)) {
				result[i] = T[i].toUpperCase();
			}
		}
	}
	
	return result;
}

function markStress(T) {
	let word_end = false;

	for (let i = 0; i < T.length; i ++) {
		if (/[aeiouáéíóú]/i.test(T[i]) == true && word_end == false) {
			T[i] = T[i].toUpperCase();
			word_end = true;
		}
		if (T[i] == " " && word_end == true) {
			word_end = false;
		}
	}

	return T;
}

function get_sound(arg0, arg1, split = true) { //don't split for some languages
	if (arg0.trim() == "") { return ""; }

	//splitable?
	if (arg0.includes(" ") && split === true) {
		let argtemp = arg0;
		argtemp = argtemp.replace(/(?<=[ ])(is )/gi, "ઇ").replace(/^(is )/gi, "ઇ");
		argtemp = argtemp.replace(/(?<=[ ])(an )/gi, "ઠ").replace(/^(an )/gi, "ઠ");
		argtemp = argtemp.replace(/(?<=[ ])(na )/gi, "ઙ").replace(/^(na )/gi, "ઙ");

		let arg_split = argtemp.split(" ");
		if (arg_split.length >= 2) {
			for (let i = 0; i < arg_split.length; i ++) {
				arg_split[i] = arg_split[i].replaceAll("ઇ", "is ");
				arg_split[i] = arg_split[i].replaceAll("ઠ", "an ");
				arg_split[i] = arg_split[i].replaceAll("ઙ", "na ");
			}

			let result_split = [];
			for (let i = 0; i < arg_split.length; i ++) {
				result_split.push(get_sound(arg_split[i], arg1));
			}
			return result_split.join(" ");
		}
	}

	if (properties.showHangulInsteadOfIPA) {
		for (let e in dict) {
			if (dict[e]["grammar"].includes(arg0)) {
				const sound = dict[e]["sound"]["hangul"][dict[e]["grammar"].indexOf(arg0)];
				if (sound !== "") {
					return sound;
				}
				else {
					break;
				}
			}
		}
		return GetHangul(arg0);
	}
	else {
		for (let e in dict) {
			if (dict[e]["grammar"].includes(arg0)) {
				const sound = dict[e]["sound"]["ipa"][dict[e]["grammar"].indexOf(arg0)];
				if (sound !== "") {
					return sound;
				}
				else {
					break;
				}
			}
		}
		return GetIPA(arg0, arg1);
	}
}

function GetHangul(text) {
	let ipa = " " + GetIPA(text, false, true) + " ";

	ipa = ipa.replaceAll(".", "");
	ipa = ipa.replaceAll("ʲəvʲ", "ib"); //cinbh
	ipa = ipa.replaceAll("əw", "u"); //leanbh

	const rep_basic = {
		"ː": "", "ə": "",
		"ɛ": "e", "ɪ": "i", "ɔ": "o", "ʊ": "u", "i̯": "i", "u̯": "u",
		"ɣ": "g", "ɡ": "g", "f": "p", "ʤ": "z", "ʒ": "z", "ɾ": "r", "x": "h", "v": "b"
	};
	const pat_basic = new RegExp(Object.keys(rep_basic).join('|'), 'g');
	ipa = ipa.replace(pat_basic, matched => rep_basic[matched]);

	const rep_consonant = {
		"bʲa": "ba", "bʲo": "bjo", "bʲu": "bju", "bʲe": "be", "bʲi": "bi",
		"pʲa": "pa", "pʲo": "pjo", "pʲu": "pju", "pʲe": "pe", "pʲi": "pi",
		"mʲa": "ma", "mʲo": "mjo", "mʲu": "mju", "mʲe": "me", "mʲi": "mi",
		"wo": "bo", "wu": "bu",
		"ca": "kja", "co": "kjo", "cu": "kju", "ce": "ke", "ci": "ki",
		"ça": "hia", "ço": "hio", "çu": "hiu", "çe": "he", "çi": "hi",
		"dʲa": "dja", "dʲo": "djo", "dʲu": "dju", "dʲe": "de", "dʲi": "di",
		"tʲa": "tja", "tʲo": "tjo", "tʲu": "tju", "tʲe": "te", "tʲi": "ti",
		"ɟa": "gja", "ɟo": "gjo", "ɟu": "gju", "ɟe": "ge", "ɟi": "gi",
		"lʲa": "lja", "lʲo": "ljo", "lʲu": "lju", "lʲe": "le", "lʲi": "li",
		"rʲa": "rja", "rʲo": "rjo", "rʲu": "rju", "rʲe": "re", "rʲi": "ri",
		"nʲa": "nja", "nʲo": "njo", "nʲu": "nju", "nʲe": "ne", "nʲi": "ni",
		"ɲa": "nja", "ɲo": "njo", "ɲu": "nju", "ɲe": "nje", "ɲi": "ni",
		"ʃa": "sja", "ʃo": "sjo", "ʃu": "sju", "ʃe": "sje", "ʃi": "si"
	};
	const pat_consonant = new RegExp(Object.keys(rep_consonant).join('|'), 'g');
	ipa = ipa.replace(pat_consonant, matched => rep_consonant[matched]);

	const rep_afterwork = {
		"ʲ": "", "ɟ": "g", "ç": "h", "ɲ": "n", "c": "k", "w ": "u ", "j ": "i ", " ʃ": " sju"
	};
	const pat_afterwork = new RegExp(Object.keys(rep_afterwork).join('|'), 'g');
	ipa = ipa.replace(pat_afterwork, matched => rep_afterwork[matched]);

	ipa = ipa.replaceAll(/([w])(?![aeiouj])/g, "u");
	ipa = ipa.replaceAll("ʃ", "si");

	//attach ɯ
	ipa = ipa.replace(/([bkdpghkprstz])(?![aeiouj])/g, "$1ɯ");

	//chained liquids
	ipa = ipa.replace(/([mnlr])([mnl])(?![aeioujɯ])/g, "$1ɯ$2");
	ipa = ipa.replace(/( )([mn])([r])/g, "$1$2ɯ$3");

	//split coda l
	ipa = ipa.replace(/(?<=[aeiouɯ])([l])(?=[aeioujɯ])/g, "lr");

	//move initial ŋ and nr mr etc.
	ipa = ipa.replace(/([aeiou])( )([ŋ])/g, "$1$3$2");
	ipa = ipa.replace(/([aeiou])( )([nm])([ɯ])/g, "$1$3$2");

	//initial ua, ia -> wa, ja
	ipa = ipa.replace(/(?<=[ ])(ua)/g, "wa");
	ipa = ipa.replace(/(?<=[ ])(i)([aou])/g, "j$2");

	//remove duplicates as əə -> ə
	ipa = ipa.replace(/(.)\1+/g, '$1');

	//mark syllable boundaries
	ipa = ipa.replace(/(?<=[aeiouɯ])([mnlŋ])(?![aeioujɯ])/g, "$1\.");
	ipa = ipa.replace(/([aeiouɯ])(?![mnlŋ])/g, "$1\.");
	ipa = ipa.replace(/([aeiouɯ])([mnlŋ])([aeioujɯ])/g, "$1\.$2$3");

	//to hangul
	const rep_hangul = {
		"a": "아", "e": "에", "i": "이", "o": "오", "u": "우", "ja": "야", "je": "예", "jo": "요", "ju": "유", "ɯ": "으", "ba": "바", "be": "베", "bi": "비", "bo": "보", "bu": "부", "bja": "뱌", "bje": "볘", "bjo": "뵤", "bju": "뷰", "bɯ": "브", "da": "다", "de": "데", "di": "디", "do": "도", "du": "두", "dja": "댜", "dje": "뎨", "djo": "됴", "dju": "듀", "dɯ": "드", "ga": "가", "ge": "게", "gi": "기", "go": "고", "gu": "구", "gja": "갸", "gje": "계", "gjo": "교", "gju": "규", "gɯ": "그", "ha": "하", "he": "헤", "hi": "히", "ho": "호", "hu": "후", "hja": "햐", "hje": "혜", "hjo": "효", "hju": "휴", "hɯ": "흐", "ka": "카", "ke": "케", "ki": "키", "ko": "코", "ku": "쿠", "kja": "캬", "kje": "켸", "kjo": "쿄", "kju": "큐", "kɯ": "크", "la": "라", "le": "레", "li": "리", "lo": "로", "lu": "루", "lja": "랴", "lje": "례", "ljo": "료", "lju": "류", "lɯ": "르", "ma": "마", "me": "메", "mi": "미", "mo": "모", "mu": "무", "mja": "먀", "mje": "몌", "mjo": "묘", "mju": "뮤", "mɯ": "므", "na": "나", "ne": "네", "ni": "니", "no": "노", "nu": "누", "nja": "냐", "nje": "녜", "njo": "뇨", "nju": "뉴", "nɯ": "느", "pa": "파", "pe": "페", "pi": "피", "po": "포", "pu": "푸", "pja": "퍄", "pje": "폐", "pjo": "표", "pju": "퓨", "pɯ": "프", "ra": "라", "re": "레", "ri": "리", "ro": "로", "ru": "루", "rja": "랴", "rje": "례", "rjo": "료", "rju": "류", "rɯ": "르", "sa": "사", "se": "세", "si": "시", "so": "소", "su": "수", "sja": "샤", "sje": "셰", "sjo": "쇼", "sju": "슈", "sɯ": "스", "ta": "타", "te": "테", "ti": "티", "to": "토", "tu": "투", "tja": "탸", "tje": "톄", "tjo": "툐", "tju": "튜", "tɯ": "트", "wa": "와", "we": "웨", "wi": "위", "wo": "워", "wu": "우", "wja": "븩", "wje": "뵥", "wjo": "뺩", "wju": "즥", "wɯ": "우", "za": "자", "ze": "제", "zi": "지", "zo": "조", "zu": "주", "zja": "자", "zje": "제", "zjo": "조", "zju": "주", "zɯ": "즈"
	};
	const pat_hangul = new RegExp(Object.keys(rep_hangul).join('|'), 'g');
	ipa = ipa.replace(pat_hangul, matched => rep_hangul[matched]);

	//attach coda
	ipa = ipa.replace(/([가-히])([nmlŋ])/g, (match, p1, p2) => HanCoda(p1, p2));

	//final
	ipa = ipa.replaceAll(".", "").trim();
	return ipa;
}

//attach coda
function HanCoda(syllable, coda) {
	const code = syllable.charCodeAt(0);

	if (coda == "n") {
		return String.fromCharCode(code + 4);
	}
	else if (coda == "m") {
		return String.fromCharCode(code + 16);
	}
	else if (coda == "ŋ") {
		return String.fromCharCode(code + 21);
	}
	else if (coda == "l") {
		return String.fromCharCode(code + 8);
	}
	else {
		return "쀿";
	}
}