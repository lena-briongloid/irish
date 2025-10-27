function load_adfb(call = false) {
	let text = "";

	if (call == false) {
		text = document.getElementById("text").value;
		document.getElementById("text").value = "";
	}
	else {
		text = call;
	}

	text = text.trim();

	//filter bad words
	const badSearch = ["", " ", "=", ".", ",", ";", ":", "/"];
	if (badSearch.includes(text)) { return -1; }

	//special commands
	let query_command = load_query_command(text, call);
	if (query_command == true) { return -1; }
	
	//exacts
	let index = -1;

	//very exact
	for (let e in dict) {
		let t = text.toLowerCase();
		let d1 = dict[e]["title"].toLowerCase();
		let d2 = dict[e]["key"].toLowerCase();

		if (t == d1 || t == d2) { index = dict[e]["index"]; break; }
	}

	//less exact
	if (index == -1) { for (let e in dict) {
		let t = text.toLowerCase();
		let d1 = remove_diacritics(dict[e]["title"].toLowerCase());
		let d2 = remove_diacritics(dict[e]["key"].toLowerCase());

		if (t == d1 || t == d2) { dict[e]["index"]; break; }
	} }

	//undo stack
	if (call == false) {
		if (index >= 0) { undo_stack( Object.values(dict).find(e => e.index === index).key ); }
		else { undo_stack(text); }
	}

	//hangul => reverse db
	let regexHan = /[가-힣]/;
	if (regexHan.test(text) && !text.startsWith("tag:")) {
		load_query_rv(text, "ko");
		return -1;
	}

	//en: command => reverse db
	else if (text.startsWith("en:")) {
		load_query_rv(text, "en");
		return -1;
	}

	//tag: command => tag search
	else if (text.startsWith("tag:")) {
		load_query_tag(text);
		return -1;
	}

	let text_search = text.split("_")[0];
	load_query_suggest(text_search); load_query_include(text_search);

	topmenu_set_graphic("topmenu_dict");
	show_page(["search_form", "suggestions"], ["propertysettings", "not_found", "ADFB", "abc", "mainpage"]);

	if (index == -1) {
		//not found
		show_page(["not_found"], ["ADFB", "abc"]);
	}
	else {
		//found
		show_page(["ADFB", "abc"], ["not_found"]);
	}

	// if got -1 immed. end
	if (index == -1) { return 0; }

	// designate vocab. substruct
	const vocabulary = Object.values(dict).find(e => e.index === index);

///////////////////////////////////
//title
	let t1 = document.getElementById("ADFB_word_class");
	let word_class = vocabulary.class;

	if (word_class == "m") {
		t1.innerHTML = "남성 명사. ";
	}
	else if (word_class == "f") {
		t1.innerHTML = "여성 명사. ";
	}
	else if (word_class == "n") {
		t1.innerHTML = "중성 명사. ";
	}
	else if (word_class == "a") {
		t1.innerHTML = "형용사. ";
	}
	else if (word_class == "i") {
		t1.innerHTML = "불변사. ";
		document.getElementById("gram").innerHTML = "";
	}
	else if (word_class == "v") {
		t1.innerHTML = "동사. ";
		document.getElementById("gram").innerHTML = "";
	}
	else {
		t1.innerHTML = "ERR";
	}

///////////////////////////////////
//headword & favourites
	let t2 = document.getElementById("ADFB_head_word");
	source_t2 = vocabulary.title + "<sup>" + vocabulary.tag.homonym + "</sup>" + "</small>" + `<span class="original_script>&nbsp;${LattoOrg(vocabulary.title)}</span>`;
	if (!properties.showOriginalScript) {
		source_t2 = source_t2.replaceAll(/<span class="original_script>.*?<\/span>/g, "");
	}
	t2.innerHTML = source_t2;
	
	let t3 = document.getElementById("ADFB_head_sound");
	t3.innerHTML = "<span class=\"IPA\">[" + get_sound(vocabulary.title, true) + "]</span>";

	let t4 = document.getElementById("ADFB_head_favourites");
	let t4_check = check_favourites(index - 1) ? "★" : "☆";
	t4.innerHTML = `&nbsp;&nbsp;<a class="add_favourites" onclick="add_favourites(${index - 1})"><span class="emp">${t4_check}</span></a>`;

///////////////////////////////////
//tags
	let source_gram = "";
	
	const tag = vocabulary.tag.category;
	if (tag.length > 0 && tag[0] != "") {
		source_gram += `<p><strong>태그: </strong>`;

		for (let i = 0; i < tag.length; i ++) {
			let t0 = tag[i]; let t1 = "";
			if (tag_link.includes(t0)) {
				t1 = tag_flav[tag_link.indexOf(t0)];
				t2 = tag_code[tag_link.indexOf(t0)];
			}
			source_gram += `<a onclick="load_tag('${t2}')">${t1}</a>&nbsp;`
			if (i < tag.length - 1) { source_gram += "·&nbsp;"; }
		}
		source_gram += `</p>`;
	}

///////////////////////////////////
//grammar
	//make grammar array
	let gram = vocabulary.grammar; let sound = [];
	for (let i = 0; i < gram.length; i ++) {
		sound.push("[" + get_sound(gram[i], true) + "]");
	}

	if (word_class == "n" || word_class == "f" || word_class == "m") {
		source_gram += "<p><details><summary style=\"font-size: 18px;\">문법 정보 보기</summary></p><p>";

		if (word_class == "m" || word_class == "f") {
			source_gram += `
			<table style="table-layout: auto; margin-left: 30px; margin-top: -30px;">
					<tr>
						<th style="min-width: 50px;">&nbsp;</th>
						<th>단수<small> (하나)</small></th>
						<th>복수<small> (둘 이상)</small></th>
					</tr>
					<tr>
						<th style="line-height: 100%;"><p>주격</p><p><small>(~이·가)</small></p></th>
						<td><p><strong>${gram[0]}</strong></p><p class="original_script>${LattoOrg(gram[0])}</p><p class="IPA"><small>${sound[0]}</small></p></td>
						<td><p><strong>${gram[4]}</strong></p><p class="original_script>${LattoOrg(gram[4])}</p><p class="IPA"><small>${sound[4]}</small></p></td>
					</tr>
					<tr>
						<th style="line-height: 100%;"><p>속격</p><p><small>(~의)</small></p></th>
						<td><p><strong>${gram[2]}</strong></p><p class="original_script>${LattoOrg(gram[2])}</p><p class="IPA"><small>${sound[2]}</small></p></td>
						<td><p><strong>${gram[6]}</strong></p><p class="original_script>${LattoOrg(gram[6])}</p><p class="IPA"><small>${sound[6]}</small></p></td>
					</tr>
				</table>`;
		}
		source_gram +=  `</details>`;
	}
	else if (word_class == "a") {
		source_gram += "<p><details><summary style=\"font-size: 18px;\">문법 정보 보기</summary></p><p>";

		source_gram += `
			<table style="table-layout: auto; margin-left: 30px; margin-top: -30px;">
					<tr>
						<th style="min-width: 50px;">&nbsp;</th>
						<th>주격<small> (~이·가)</small></th>
						<th>속격<small> (~의)</small></th>
					</tr>
					<tr>
						<th style="line-height: 100%;"><p>남성 단수</p><p><small>(하나)</small></p></th>
						<td><p><strong>${gram[0]}</strong></p><p class="original_script>${LattoOrg(gram[0])}</p><p class="IPA"><small>${sound[0]}</small></p></td>
						<td><p><strong>${gram[2]}</strong></p><p class="original_script>${LattoOrg(gram[2])}</p><p class="IPA"><small>${sound[2]}</small></p></td>
					</tr>
					<tr>
						<th style="line-height: 100%;"><p>여성 단수</p><p><small>(하나)</small></p></th>
						<td><p><strong>${gram[1]}</strong></p><p class="original_script>${LattoOrg(gram[1])}</p><p class="IPA"><small>${sound[1]}</small></p></td>
						<td><p><strong>${gram[3]}</strong></p><p class="original_script>${LattoOrg(gram[3])}</p><p class="IPA"><small>${sound[3]}</small></p></td>
					</tr>
					<tr>
						<th style="line-height: 100%;"><p>복수</p><p><small>(둘 이상)</small></p></th>
						<td><p><strong>${gram[4]}</strong></p><p class="original_script>${LattoOrg(gram[4])}</p><p class="IPA"><small>${sound[4]}</small></p></td>
						<td><p><strong>${gram[6]}</strong></p><p class="original_script>${LattoOrg(gram[6])}</p><p class="IPA"><small>${sound[6]}</small></p></td>
					</tr>
				</table>
				<p><small>&nbsp;&nbsp;※ 형용사 복수형은 함께 쓰인 명사에 따라 다소 변동할 수 있습니다. 정확한 결과물은 문법 마법사를 참조해 주세요!</small></p>
				<p><small>&nbsp;&nbsp;</small><strong>비교급 · 최상급</strong>: <strong>${gram[9]}</strong>&nbsp;<span class="original_script>${LattoOrg(gram[9])}</span>&nbsp;<span class="IPA"><small>${sound[9]}</small></span></p>
				`;
	}

	source_gram = source_gram.replaceAll("[]", "&nbsp;");
	if (!properties.showOriginalScript) {
		source_gram = source_gram.replaceAll(/<span class="original_script>.*?<\/span>/g, "");
		source_gram = source_gram.replaceAll(/<p class="original_script>.*?<\/p>/g, "");
	}

	document.getElementById("gram").innerHTML = source_gram;

///////////////////////////////////
//korean gloss
	let source_eko = "";
	for (let i = 0; i < vocabulary.gloss.ko.length; i ++) {
		source_eko += "<strong>" + (i + 1).toString() + "</strong>. " + vocabulary.gloss.ko[i] + "<br>";
	}
	document.getElementById("ADFB_gloss_ko").innerHTML = source_eko;

///////////////////////////////////
//english gloss
	let source_een = "";
	for (let i = 0; i < vocabulary.gloss.en.length; i ++) {
		source_een += "<strong>" + (i + 1).toString() + "</strong>. " + vocabulary.gloss.en[i] + "<br>";
	}
	document.getElementById("ADFB_gloss_en").innerHTML = source_een;

///////////////////////////////////
//examples
	let eexisex = document.getElementById("ADFB_gloss_ex_isExist");
	if (vocabulary.gloss.ex.length > 0 && vocabulary.gloss.ex[0] != "") {
		eexisex.innerHTML = "«예시»";
		document.getElementById("ADFB_gloss_ex_isExist_hr").style.display = "block";
	}
	else {
		eexisex.innerHTML = "";
		document.getElementById("ADFB_gloss_ex_isExist_hr").style.display = "none";
	}

	let source_eex = "";
	if (vocabulary.gloss.ex.length > 0 && vocabulary.gloss.ex[0] != "") {
		for (let i = 0; i < vocabulary.gloss.ex.length; i ++) {
			let line = vocabulary.gloss.ex[i];

			//발음 추출
			let match = line.match(/(?<=\<strong\>)(.+)(?=\<\/strong\>\:)/g)[0];
			match = match.replace(/\<.*?\>/g, "");

			line = line.replace(`</strong>:`, `</strong> <span class="IPA">[${get_sound(match, true)}]</span> :`);

			source_eex += "<strong>" + (i + 1).toString() + "</strong>. " + line + "<br>";
		}
	}
	document.getElementById("ADFB_gloss_ex").innerHTML = source_eex;

///////////////////////////////////
//encyclopaedia
	let eepisex = document.getElementById("ADFB_gloss_ep_isExist");
	if (vocabulary.gloss.ep.length > 1) {
		eepisex.innerHTML = "«해설»";
		document.getElementById("ADFB_gloss_ep_isExist_hr").style.display = "block";
	}
	else {
		eepisex.innerHTML = "";
		document.getElementById("ADFB_gloss_ep_isExist_hr").style.display = "none";
	}

	document.getElementById("ADFB_gloss_ep").innerHTML = vocabulary.gloss.ep;

///////////////////////////////////
//words before and after;
	let source_abc = "<br><hr>"
	let number_abc = 4; //how many words before and after?

	for (let i = -number_abc; i <= number_abc; i ++) {
		try {
			const vocab_next = Object.values(dict).find(e => e.index === index + i);
			let link = ""; let text = "";

			if (vocab_next) {
				link = vocab_next.key;
				text = vocab_next.title + "<sup>" + vocab_next.tag.homonym + "</sup>";

				if (i != 0) {
					source_abc += `<a onclick="link('${link}')">${text}</a>`;
				}
				else {
					source_abc += `<strong><a onclick="link('${link}')">${text}</a></strong>`
				}

				source_abc += " · ";

			}
		}
		catch (error) { continue; }
	}

	if (source_abc.endsWith(" · ")) {
		source_abc = source_abc.slice(0, -3);
	}

	document.getElementById("abc").innerHTML = source_abc;
}

//reverse search
function load_query_rv(text, lang) {
	topmenu_set_graphic("topmenu_dict");

	text = text.trim().replaceAll(" ", "").toLowerCase();
	if (lang == "en") { text = text.replace("en:", ""); }

	let List = [];

	for (let i = 1; i < db_text.length; i ++) {
		let line = db_text[i].toLowerCase();
		const padN = "vocabulary_" + String(i).padStart(5, '0');

		if (line.includes(text)) {
			let gloss = "";
			if (lang == "ko") {
				gloss = dict[padN]["gloss"]["ko"].join("; ");
			}
			else if (lang == "en") {
				gloss = dict[padN]["gloss"]["en"].join("; ");
			}
			List.push([i, gloss]);
		}
	}

	show_page(["search_form"], ["suggestions", "mainpage", "propertysettings", "ADFB", "abc"]);

	if (List.length == 0) {
		show_page(["not_found"], ["includes"]);
		return 0;
	}
	else {
		show_page(["includes"], ["not_found"]);
	}

	let source = "";

	for (let i = 0; i < List.length; i ++) {
		const rawN = List[i][0];
		const padN = "vocabulary_" + String(rawN).padStart(5, '0');

		const t1 = dict[padN]["key"];
		const t2 = dict[padN]["title"];
		const t3 = get_sound(t2, true);
		
		const check = check_favourites(List[i][0]) ? "★" : "☆";
		const basic = dict[padN]["tag"]["category"].includes("기초") ? true : false;
		const text = basic ? `<strong>${t2}</strong>` : t2;

		source += `<p><a class="add_favourites" id="ABC_fav_${List[i][0].toString().padStart(5, '0')}" onclick="add_favourites(${List[i][0]})" style="font-family: 'Charis SIL'"><span class="emp">${check}</span></a>&nbsp;<a onclick="link('${t1}')">${text}</a>&nbsp;<span class="IPA">[${t3}]&nbsp;:&nbsp;&nbsp;${List[i][1]}</p></span>`;
	}

	document.getElementById("includes_search").innerHTML = source;
}

//tag search
function load_query_tag(text) {
	topmenu_set_graphic("topmenu_dict");

	text = text.trim().replace("tag:", "");
	const text_link = tag_flav.includes(text) ? tag_link[tag_flav.indexOf(text)] : "ERROR";

	let List = [];

	for (let e in dict) {
		const tag_voc = dict[e]["tag"]["category"];
		if (tag_voc.includes(text_link)) {
			List.push([parseInt(e.match(/\d+/)?.[0], 10), dict[e]["gloss"]["ko"].join("; ")]);
		}
	}

	show_page(["search_form"], ["suggestions", "mainpage", "propertysettings", "ADFB", "abc"]);

	if (List.length == 0) {
		show_page(["not_found"], ["includes"]);
		return 0;
	}
	else {
		show_page(["includes"], ["not_found"]);
	}

	let source = "";

	for (let i = 0; i < List.length; i ++) {
		const rawN = List[i][0];
		const padN = "vocabulary_" + String(rawN).padStart(5, '0');

		const t1 = dict[padN]["key"];
		const t2 = dict[padN]["title"];
		const t3 = get_sound(t2, true);
		
		const check = check_favourites(List[i][0]) ? "★" : "☆";
		const basic = dict[padN]["tag"]["category"].includes("기초") ? true : false;
		const text = basic ? `<strong>${t2}</strong>` : t2;

		source += `<p><a class="add_favourites" id="ABC_fav_${List[i][0].toString().padStart(5, '0')}" onclick="add_favourites(${List[i][0]})" style="font-family: 'Charis SIL'"><span class="emp">${check}</span></a>&nbsp;<a onclick="link('${t1}')">${text}</a>&nbsp;<span class="IPA">[${t3}]&nbsp;:&nbsp;&nbsp;${List[i][1]}</p></span>`;
	}

	document.getElementById("includes_search").innerHTML = source;
}

//partial match
function load_query_include(text, length_max = 10) {
	topmenu_set_graphic("topmenu_dict");

	let List = [];
	
	switch (text.length) {
		case 1: length_max = Math.round(0.25 * length_max); break;
		case 2: length_max = Math.round(0.50 * length_max); break;
		case 3: length_max = Math.round(0.75 * length_max); break;
	}

	for (let e in dict) {
		if (dict[e]["title"].toLowerCase().includes(text.toLowerCase()) && dict[e]["key"] != Page && dict[e]["title"].length <= text.length + length_max) {
			List.push(dict[e]["index"]);
		}
	}

	show_page([], ["propertysettings"]);

	if (List.length == 0) {
		show_page([], ["includes"]);
		return 0;
	}
	else {
		show_page(["includes"], []);
	}

	let source = "";

	for (let i = 0; i < List.length; i ++) {
		const rawN = List[i];
		const padN = "vocabulary_" + String(rawN).padStart(5, '0');

		let link = dict[padN]["key"];
		let t0 = dict[padN]["title"];
		let t1 = dict[padN]["tag"]["homonym"];

		let t = t0 + "<sup>" + t1 + "</sup>";

		//homonyms
		let t2 = Page.split("_")[0];

		if (t0 == t2) {
			source += "<strong><a onclick=\"link('" + link + "')\">" + t + "</a></strong>";
		}
		else {
			source += "<a onclick=\"link('" + link + "')\">" + t + "</a>";
		}

		if (i < List.length - 1) {
			source += " · ";
		}
	}

	document.getElementById("includes_search").innerHTML = source;
}

//suggest similar results
function load_query_suggest(text) {
	topmenu_set_graphic("topmenu_dict");

	const SimilarIndices = find_similars(text)

	let source = "";
	
	for (let i = 0; i < SimilarIndices.length; i ++) {
		if (SimilarIndices[i] == -1) { continue; }

		const rawN = SimilarIndices[i];
		const padN = "vocabulary_" + String(rawN + 1).padStart(5, '0');

		let link = dict[padN]["key"];
		let t0 = dict[padN]["title"];
		let t1 = typeof dict[padN]["tag"]["homonym"] === undefined ? "" : dict[padN]["tag"]["homonym"];
		let t3 = GetHangul(t0);

		let t = t0 + "<sup>" + t1 + "</sup>" + " <small>(" + t3 + ")</small>";

		//homonym
		let t2 = Page.split("_")[0];

		if (t0 == t2) {
			source += "<strong><a onclick=\"link('" + link + "')\">" + t + "</a></strong>";
		}
		else {
			source += "<a onclick=\"link('" + link + "')\">" + t + "</a>";
		}

		if (i < SimilarIndices.length - 1) {
			source += " · "
		}
	}

	document.getElementById("suggestions_search").innerHTML = source;
}

//special commands
function load_query_command(text, call) {
	if (text == "#main") {
		load_main(call); return true;
	}
	else if (text == "#gramwiz") {
		load_gramwiz_main(call); return true;
	}
	else if (text == "#property") {
		load_property(call); return true;
	}
	else if (text == "#favourites") {
		load_favourites(call); return true;
	}
	else if (text.includes("#") && text.length == 2 && text.charAt(1).toUpperCase() == text.charAt(1)) {
		load_abc(text.charAt(1), call); return true;
	}
	else if (text.includes("#") && text.includes("tag_")) {
		load_tag(text.replaceAll("#tag_", ""), call); return true;
	}
	else if (text.includes("#appendix")) {
		load_appendix(text, call); return true;
	}

	return false;
}

function find_similars(text, howManySimilars = 10) {
	let List = [];

	for (let e in dict) {
		//filter exactly same word
		if (Page.toLowerCase() == dict[e]["key"].toLowerCase()) {
			List.push(0); continue;
		}

		let word1 = remove_diacritics(dict[e]["title"].toLowerCase());
		let word2 = remove_diacritics(text.toLowerCase());

		let word_long = ""; let word_short = "";
		if (word1.length >= word2.length) { word_long = word1; word_short = word2; }
		else { word_long = word2; word_short = word1; }
		let len = word_long.length

		//compare
		let l1 = 0;

		for (let j = 0; j < len; j ++) {
			let chr1 = word_long.charAt(j);
			let chr2 = word_short.charAt(j);

			if (chr1 == "" || chr2 == "") { continue; }
			if (chr1 == chr2) { l1 ++; }
			if ((chr1 == "'" && chr2 == "’") || (chr2 == "'" && chr1 == "’")) { l1 ++; }

			let sq = false;

			for (let k = 0; k < DiacriticsTuple.length; k ++) {
				if ((chr1 == DiacriticsTuple[k][0] && chr2 == DiacriticsTuple[k][1]) || (chr1 == DiacriticsTuple[k][1] && chr2 == DiacriticsTuple[k][0])) {
					sq = true; break;
				}
			}
			
			if (sq) { l1 += 0.5; }
		}

		l1 /= len;

		//including?
		let l2 = 0;

		if (word_long.includes(word_short)) {
			l2 = word_short.length / word_long.length;
		}

		let likeliness = Math.max(l1, l2);

		List.push(likeliness);
	}

	//most similar ones
	let Index = [-1]; let IndexMax = 1;

	while (Index.length <= howManySimilars) {
		let ind = 0; let max = 0;

		for (let i = 0; i < List.length; i ++) {
			if (List[i] > max && List[i] <= IndexMax && !Index.includes(i)) {
				ind = i; max = List[i];
			}
		}

		if (max == 0) { break; }

		Index.push(ind); IndexMax = max;
	}

	let IndexRemoveDuplicate = Array.from(new Set(Index));
	return IndexRemoveDuplicate;
}