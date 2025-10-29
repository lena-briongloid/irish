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
const tag_flav = ["기초", "인명", "지명", "자연", "천문", "도구", "문화", "동물", "식물", "사회", "신체", "과학", "예술", "장소", "시간", "숫자", "게일 전통", "기독교", "음식", "역사"];
const tag_link = ["기초", "인명", "지명", "자연", "천문", "도구", "문화", "동물", "식물", "사회", "신체", "과학", "예술", "장소", "시간", "숫자", "전통", "기독", "음식", "역사"];
const tag_code = ["basic", "personal", "endonym", "nature", "astronomy", "tools", "culture", "zoology", "botany", "social", "body", "science", "art", "place", "time", "number", "traditional", "christianism", "culinary", "history"];

//secondary scripts
function LattoOrg(text) {
	return text;
}

//alphabet lists
const InitialAlphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "L", "M", "N", "O", "P", "R", "S", "T", "U"];

let AlphabetListInnerHTML = `<p>`;
for (let i = 0; i < InitialAlphabets.length; i ++) {
	AlphabetListInnerHTML += `<a href="#top" onclick="load_abc(this.innerText)">${InitialAlphabets[i].toUpperCase()}</a> ・ `
}
AlphabetListInnerHTML += `</p>`;
AlphabetListInnerHTML = AlphabetListInnerHTML.replace(" ・ </p>", ` ・ <a href="#top" onclick="load_tag('all')">태그</a></p>`);
document.getElementById("AlphabetList").innerHTML = AlphabetListInnerHTML;