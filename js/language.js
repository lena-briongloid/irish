//LANGUAGE: IRISH

//diacritics
const DiacriticsBef = ["á", "é", "í", "ó", "ú", "Á", "É", "Í", "Ó", "Ú"];
const DiacriticsAft = ["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"];
let DiacriticsTuple = [];
for (let i = 0; i < DiacriticsBef.length; i ++) {
	const t = [DiacriticsBef[i], DiacriticsAft[i]]; DiacriticsTuple.push(t);
}

function remove_diacritics(text) {
	for (let i = 0; i < DiacriticsBef.length; i ++) {
		text = text.replaceAll(DiacriticsBef[i], DiacriticsAft[i]);
	}
	return text;
}

//inputs
const InputBef = ["a.", "e.", "i.", "o.", "u.", "á.", "é.", "í.", "ó.", "ú.", "A.", "E.", "I.", "O.", "U.", "Á.", "É.", "Í.", "Ó.", "Ú."];
const InputAft = ["á", "é", "í", "ó", "ú", "a", "e", "i", "o", "u", "Á", "É", "Í", "Ó", "Ú", "A", "E", "I", "O", "U"];

//semantic tags
const tag_flav = [`\uae30\ucd08`, `\uc2dc\uac04`, `\uc7a5\uc18c`, `\uc9c0\ub9ac`, `\ubc29\ud5a5\u00b7\ubc29\uc704`, `\uc790\uc5f0`, `\ub3d9\ubb3c`, `\uc2dd\ubb3c`, `\uad11\ubb3c`, `\uc815\uce58`, `\uacbd\uc81c\u00b7\uc0b0\uc5c5`, `\ubc95\ub960`, `\uc0ac\ud68c`, `\ubb38\ud654\u00b7\uc778\ubb38`, `\uc5ed\uc0ac`, `\uc608\uc220\u00b7\uacf5\uc608`, `\uc74c\uc545`, `\uac74\ucd95`, `\ubcf5\uc2dd`, `\ucca0\ud559\u00b7\ub17c\ub9ac`, `\uacfc\ud559`, `\uc218\ud559\u00b7\ub3c4\ub7c9\ud615`, `\ucc9c\ubb38`, `\uac8c\uc77c\u0020\uc804\ud1b5`, `\uc885\uad50\u00b7\uc2e0\ube44`, `\uad70\uc0ac\u00b7\ubcd1\uae30`, `\uc2e0\uccb4\u00b7\uc758\ud559`, `\uc131\uaca9\u00b7\uc131\ud488`, `\uac10\uc815\u00b7\uae30\ubd84`, `\uc9c1\uc5c5`, `\ub3c4\uad6c`, `\uc7ac\ub8cc`, `\uc74c\uc2dd\u00b7\uc74c\ub8cc`, `\uc22b\uc790`, `\uc0c9\ucc44`, `\ubb38\ubc95`];
const tag_link = [`\uae30\ucd08`, `\uc2dc\uac04`, `\uc7a5\uc18c`, `\uc9c0\ub9ac`, `\ubc29\uc704`, `\uc790\uc5f0`, `\ub3d9\ubb3c`, `\uc2dd\ubb3c`, `\uad11\ubb3c`, `\uc815\uce58`, `\uacbd\uc81c`, `\ubc95\ub960`, `\uc0ac\ud68c`, `\ubb38\ud654`, `\uc5ed\uc0ac`, `\uc608\uc220`, `\uc74c\uc545`, `\uac74\ucd95`, `\ubcf5\uc2dd`, `\ucca0\ud559`, `\uacfc\ud559`, `\uc218\ud559`, `\ucc9c\ubb38`, `\uc804\ud1b5`, `\uc885\uad50`, `\uad70\uc0ac`, `\uc758\ud559`, `\uc131\uaca9`, `\uac10\uc815`, `\uc9c1\uc5c5`, `\ub3c4\uad6c`, `\uc7ac\ub8cc`, `\uc74c\uc2dd`, `\uc22b\uc790`, `\uc0c9\ucc44`, `\ubb38\ubc95`];
const tag_code = [`\u0062\u0061\u0073\u0069\u0063`, `\u0074\u0069\u006d\u0065`, `\u0070\u006c\u0061\u0063\u0065`, `\u0067\u0065\u006f\u0067\u0072\u0061\u0070\u0068\u0079`, `\u0064\u0069\u0072\u0065\u0063\u0074\u0069\u006f\u006e`, `\u006e\u0061\u0074\u0075\u0072\u0065`, `\u007a\u006f\u006f\u006c\u006f\u0067\u0079`, `\u0062\u006f\u0074\u0061\u006e\u0079`, `\u006d\u0069\u006e\u0065\u0072\u0061\u006c\u006f\u0067\u0079`, `\u0070\u006f\u006c\u0069\u0074\u0069\u0063\u0073`, `\u0065\u0063\u006f\u006e\u006f\u006d\u0079`, `\u006c\u0061\u0077`, `\u0073\u006f\u0063\u0069\u0065\u0074\u0079`, `\u0063\u0075\u006c\u0074\u0075\u0072\u0065`, `\u0068\u0069\u0073\u0074\u006f\u0072\u0079`, `\u0061\u0072\u0074`, `\u006d\u0075\u0073\u0069\u0063`, `\u0061\u0072\u0063\u0068\u0069\u0074\u0065\u0063\u0074\u0075\u0072\u0065`, `\u0063\u006f\u0073\u0074\u0075\u006d\u0065`, `\u0070\u0068\u0069\u006c\u006f\u0073\u006f\u0070\u0068\u0079`, `\u0073\u0063\u0069\u0065\u006e\u0063\u0065`, `\u0061\u0072\u0069\u0074\u0068\u006d\u0065\u0074\u0069\u0063\u0073`, `\u0061\u0073\u0074\u0072\u006f\u006e\u006f\u006d\u0079`, `\u0074\u0072\u0061\u0064\u0069\u0074\u0069\u006f\u006e\u0061\u006c`, `\u0072\u0065\u006c\u0069\u0067\u0069\u006f\u006e`, `\u006d\u0069\u006c\u0069\u0074\u0061\u0072\u0079`, `\u006d\u0065\u0064\u0069\u0063\u0069\u006e\u0065`, `\u0070\u0065\u0072\u0073\u006f\u006e\u0061\u006c\u0069\u0074\u0079`, `\u0065\u006d\u006f\u0074\u0069\u006f\u006e`, `\u006f\u0063\u0063\u0075\u0070\u0061\u0074\u0069\u006f\u006e`, `\u0074\u006f\u006f\u006c`, `\u006d\u0061\u0074\u0065\u0072\u0069\u0061\u006c`, `\u0063\u0075\u006c\u0069\u006e\u0061\u0072\u0079`, `\u006e\u0075\u006d\u0065\u0072\u0061\u006c`, `\u0063\u006f\u006c\u006f\u0075\u0072`, `\u0067\u0072\u0061\u006d\u006d\u0061\u0072`];

//secondary scripts
function LattoOrg(text) { return text; }

//alphabet lists
const InitialAlphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "L", "M", "N", "O", "P", "R", "S", "T", "U"];

let AlphabetListInnerHTML = `<p>`;
for (let i = 0; i < InitialAlphabets.length; i ++) {
	AlphabetListInnerHTML += `<a href="#top" onclick="load_abc(this.innerText)">${InitialAlphabets[i].toUpperCase()}</a> ・ `
}
AlphabetListInnerHTML += `</p>`;
AlphabetListInnerHTML = AlphabetListInnerHTML.replace(` ・ </p>`, ` ・ <a href="#top" onclick="load_tag('all')">태그</a> ・ <a href="#top" onclick="load_random()">랜덤</a></p>`);
document.getElementById("AlphabetList").innerHTML = AlphabetListInnerHTML;

//grammar
function irish_mutation(text, type) {
	const init = text.charAt(0).toLowerCase();
	type = type.toLowerCase();

	if (type == "l") {
		if (/^[bcdfgmpt]/i.test(text)) {
			return text.charAt(0) + "h" + text.slice(1);
		}
		else if (/^[s][^cfmpt]/i.test(text)) {
			return text.charAt(0) + "h" + text.slice(1);
		}
		else {
			return text;
		}
	}
	else if (type == "e") {
		const map = { b:'m', c:'g', d:'n', f:'bh', g:'n', p:'b', t:'d' };
		const first = text[0].toLowerCase();
		
		if (map[first]) return map[first] + text;
		if ("aeiouáéíóú".includes(first)) return "n-" + text;
		return text;
	}
	else if (type == "h") {
		if (/[aeiouáéíóú]/.test(init)) { return "h" + text; }
		else { return text; }
	}
	else if (type == "t") {
		if (/[aeiouáéíóú]/.test(init)) { return "t-" + text; }
		else if (init == "s") { return "t" + text; }
		else { return text; }
	}
	else if (type == "r") {
		if (/^[bcdfgmpst]/i.test(text) && text.charAt(1) == "h") {
			return text.charAt(0) + text.slice(2);
		}
		else if (/^(mb|gc|nd|ng|bp|dt|ts|h)/i.test(text)) {
			return text.slice(1);
		}
		else if (/^(bhf|n\-|t\-)/i.test(text)) {
			return text.slice(2);
		}
		else { return text; }
	}
	else {
		return text;
	}
}

//semantic tag sort
function tag_sort(tagArray) {
    const tagSet = new Set(tagArray); let T = tag_link;
    return T.filter(tag => tagSet.has(tag));
}