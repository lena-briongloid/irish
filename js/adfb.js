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
	const badSearch = /[^\s!@#$%^&*()\-_=+\[\]{}\\|;:'",.<>/?`~'"‘’“”]/g;
	if (!text || !badSearch.test(text)) { return -1; }

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

	//////////////////
	//REVERSE SEARCH//
	//////////////////

	//normal korean search
	if (/[가-힣一-龥]/.test(text) && !text.includes(":")) {
		load_query_rv(text, "ko_normal"); return -1;
	}
	//korean gloss search
	else if (text.startsWith("ko:") || text.startsWith("해설:")) {
		load_query_rv(text, "ko_gloss"); return -1;
	}
	//korean sound search
	else if (text.startsWith("pr:") || text.startsWith("발음:")) {
		load_query_rv(text, "ko_sound"); return -1;
	}
	//english gloss search
	else if (text.startsWith("en:") || text.startsWith("영어:")) {
		load_query_rv(text, "en_gloss"); return -1;
	}
	//original language search
	else if (text.startsWith("ga:") || text.startsWith("게일:")) {
		load_query_rv(text, "orig_lang"); return -1;
	}
	//tag: command => tag search
	else if (text.startsWith("tag:")) {
		load_query_tag(text); return -1;
	}
	//gloss: command => extra appendix
	else if (text.startsWith("gloss:")) {
		load_query_glossary(text); return -1;
	}

	//////////////////////
	//REVERSE SEARCH END//
	//////////////////////

	let text_search = text.split("_")[0];
	load_query_suggest(text_search); load_query_include(text_search);

	topmenu_set_graphic("topmenu_dict");
	show_page(["search_form", "suggestions"], ["propertysettings", "not_found", "ADFB", "abc", "mainpage", "gramwiz_input", "gramwiz_output", "gramwiz_suggestions"]);

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
		t1.innerHTML = "불변사&nbsp;<em data-info='문법 마법사에 등록할 수 없는 단어입니다!\n특이한 문법 규칙이 적용될 수 있습니다.'><sup>?</sup>&nbsp;</em>. ";
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
	t3.innerHTML = "<span class=\"IPA\">[" + get_sound(vocabulary.title) + "]</span>";

	let t4 = document.getElementById("ADFB_head_favourites");
	let t4_check = check_favourites(index - 1) ? "★" : "☆";
	t4.innerHTML = `&nbsp;&nbsp;<a class="add_favourites" onclick="add_favourites(${index - 1})"><span class="emp">${t4_check}</span></a>`;

///////////////////////////////////
//tags
	let source_tag_category = ""; let source_tag_important = "";
	
	const tagC = vocabulary.tag.category;
	if (tagC.length > 0 && tagC[0] != "") {
		source_tag_category += `<strong>태그: </strong>`;
		const tagCSorted = tag_sort(tagC);

		for (let i = 0; i < tagCSorted.length; i ++) {
			let t0 = tagCSorted[i]; let t1 = "";
			if (tag_link.includes(t0)) {
				t1 = tag_flav[tag_link.indexOf(t0)];
				t2 = tag_code[tag_link.indexOf(t0)];
			}
			source_tag_category += `<a onclick="load_tag('${t2}')">${t1}</a>&nbsp;`
			if (i < tagCSorted.length - 1) { source_tag_category += "·&nbsp;"; }
		}

		source_tag_category += `&nbsp;&nbsp;`;
	}

	const tagI = vocabulary.tag.important;
	if (tagI > 0) {
		const INFO = {
			1: `National Corpus of Irish 게일어 명사·형용사 사용 빈도 상위 1000위 이내의 단어입니다.`,
			2: `National Corpus of Irish 게일어 명사·형용사 사용 빈도 상위 3000위 이내의 단어입니다.`,
			3: `National Corpus of Irish 게일어 명사·형용사 사용 빈도 상위 5000위 이내의 단어입니다.`,
			4: `National Corpus of Irish 게일어 명사·형용사 사용 빈도 상위 10000위 이내의 단어입니다.`
		}

		source_tag_important = `<strong>중요도 :</strong> <span style="font-family: 'font_ko'">${tagI}등급</span> <em data-info='${INFO[tagI]}'><strong><sup>?</sup></strong></em>`;
	}

	let source_gram = `<p>${source_tag_category}${source_tag_important}</p>`.replace("<p></p>", "");

///////////////////////////////////
//grammar
	//make grammar array
	let gram = vocabulary.grammar; let sound = [];
	for (let i = 0; i < gram.length; i ++) {
		sound.push("[" + get_sound(gram[i]) + "]");
	}

	if (word_class == "n" || word_class == "f" || word_class == "m") {
		source_gram += "<p><details><summary style=\"font-size: 18px;\">문법 정보 보기</summary></p><p>";

		let gram_art = new Array(length.gram); let sound_art = new Array(length.gram);
		let article_attachable = false; const mgn = 12;
		for (let i = 1; i < gram.length; i += 2) {
			if (gram[i] != "" && gram[i] != gram[i - 1]) { //article attachable
				article_attachable = true;
				gram_art[i] = `<p style="margin-top: ${mgn}px;"><strong>${gram[i]}</strong></p>`;
				sound_art[i] = `<p class="IPA" style="margin-top: -${mgn}px;"><small>${sound[i]}</small></p>`;
			}
			else { //article non-attachable
				gram_art[i] = ""; sound_art[i] = "";
			}
		}

		source_gram += `
			<table style="table-layout: auto; margin-left: 30px; margin-top: -30px;">
				<tr>
					<th style="min-width: 50px;">&nbsp;</th>
					<th>주격<small> (~이·가)</small></th>
					<th>속격<small> (~의)</small></th>
				</tr>
				<tr>
					<th style="line-height: 100%;"><p>단수</p><p><small><span style="white-space: nowrap;">(하나)</span></small></p></th>
					<td><p><strong>${gram[0]}</strong></p><p class="IPA" style="margin-top: -${mgn}px;"><small>${sound[0]}</small></p>${gram_art[1]}${sound_art[1]}</td>
					<td><p><strong>${gram[2]}</strong></p><p class="IPA" style="margin-top: -${mgn}px;"><small>${sound[2]}</small></p>${gram_art[3]}${sound_art[3]}</td>
				</tr>`;

		if (gram[4] != "" && gram[5] != "") {
			const plural_slender = gram[8] == "slender" ? `<em data-info="협음 복수"><sup>*</sup></em>` : "";

			source_gram += `<tr>
					<th style="line-height: 100%;"><p>복수</p><p><small><span style="white-space: nowrap;">(둘 이상)</span></small></p></th>
					<td><p><strong>${gram[4]}</strong>${plural_slender}</p><p class="IPA" style="margin-top: -${mgn}px;"><small>${sound[4]}</small></p>${gram_art[5]}${sound_art[5]}</td>
					<td><p><strong>${gram[6]}</strong></p><p class="IPA" style="margin-top: -${mgn}px;"><small>${sound[6]}</small></p>${gram_art[7]}${sound_art[7]}</td>
				</tr>
			</table>`;
		}
		else {
			source_gram += `</table>`;
		}

		if (article_attachable) {
			source_gram += `<p><small>&nbsp;&nbsp;※ 표의 각 칸에 수록된 두 형태는 각각 일반적인 형태와 정관사&nbsp;(영어의 the)&nbsp;를 붙인 형태입니다.</small></p>`;
		}

		source_gram +=  `
			<div style="line-height: 150%; margin-left: 1em;">
			<p><strong>연음화</strong>: <strong>${irish_mutation(gram[0], "l")}</strong>&nbsp;&nbsp;<span class="IPA">[${get_sound(irish_mutation(gram[0], "l"))}]</span></p>
			</div>
			</details>`;
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
						<th style="line-height: 100%;"><p>복수</p><p><small><span style="white-space: nowrap;">(둘 이상)</span></small></p></th>
						<td><p><strong>${gram[4]}</strong></p><p class="original_script>${LattoOrg(gram[4])}</p><p class="IPA"><small>${sound[4]}</small></p></td>
						<td><p><strong>${gram[6]}</strong></p><p class="original_script>${LattoOrg(gram[6])}</p><p class="IPA"><small>${sound[6]}</small></p></td>
					</tr>
				</table>
				<p><small>&nbsp;&nbsp;※ 형용사 복수형은 함께 쓰인 명사에 따라 다소 변동할 수 있습니다. 정확한 결과물은 문법 마법사를 참조해 주세요!</small></p>`;

		if (gram[9] != "") {
			source_gram += `<p style="margin-left: 1em;"><strong>비교급</strong>&nbsp<small>(더욱~)</small>&nbsp·&nbsp<strong>최상급</strong>&nbsp<small>(가장~)</small>&nbsp: <strong>${gram[9]}</strong>&nbsp;<span class="original_script>${LattoOrg(gram[9])}</span>&nbsp;<span class="IPA"><small>${sound[9]}</small></span></p>`;
		}

		source_gram +=  `
			<div style="line-height: 150%; margin-left: 1em;">
			<p><strong>연음화</strong>: <strong>${irish_mutation(gram[0], "l")}</strong>&nbsp;&nbsp;<span class="IPA">[${get_sound(irish_mutation(gram[0], "l"))}]</span></p>
			</div>
			</details>`;
	}
	else if (word_class == "i") {
		source_gram = "";
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

			line = line.replace(`</strong>:`, `</strong> <span class="IPA">[${get_sound(match)}]</span> :`);

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
		load_appendix(Number(text.replace(/[^0-9]/g, "")), call); return true;
	}
	else if (text.includes("#gloss")) {
		load_query_glossary(text.replaceAll("#gloss_", "gloss:"), call); return true;
	}

	return false;
}

//reverse search
function load_query_rv(text, code) {
	topmenu_set_graphic("topmenu_dict");
	text = text.trim().replaceAll(" ", "").toLowerCase();
	let List = [];

	if (code == "ko_normal") {
		for (let i = 1; i < search_db.gloss.ko.length; i ++) {
			const e1 = search_db.gloss.ko[i];
			const e2 = search_db.exep[i];
			const e3 = search_db.sound[i];
			if (e1.includes(text) || e2.includes(text) || e3.includes(text)) {
				const padN = "vocabulary_" + String(i).padStart(5, '0');
				const gloss = dict[padN]["gloss"]["ko"].join("; ");
				List.push([i, gloss]);
			}
		}
	}
	else if (code == "ko_gloss") {
		text = text.split(":")[1];
		for (let i = 1; i < search_db.gloss.ko.length; i ++) {
			const e = search_db.gloss.ko[i];
			if (e.includes(text)) {
				const padN = "vocabulary_" + String(i).padStart(5, '0');
				const gloss = dict[padN]["gloss"]["ko"].join("; ");
				List.push([i, gloss]);
			}
		}
	}
	else if (code == "ko_sound") {
		text = text.split(":")[1];
		for (let i = 1; i < search_db.sound.length; i ++) {
			const e = search_db.sound[i];
			if (e.includes(text)) {
				const padN = "vocabulary_" + String(i).padStart(5, '0');
				const gloss = dict[padN]["gloss"]["ko"].join("; ");
				List.push([i, gloss]);
			}
		}
	}
	else if (code == "en_gloss") {
		text = text.split(":")[1];
		for (let i = 1; i < search_db.gloss.en.length; i ++) {
			const e = search_db.gloss.en[i];
			if (e.includes(text)) {
				const padN = "vocabulary_" + String(i).padStart(5, '0');
				const gloss = dict[padN]["gloss"]["en"].join("; ");
				List.push([i, gloss]);
			}
		}
	}
	else if (code == "orig_lang") {
		text = text.split(":")[1];
		for (let e in dict) {
			let title = dict[e]["title"];
			if (title.includes(text)) {
				const num = dict[e]["index"];
				const gloss = dict[e]["gloss"]["ko"].join("; ");
				List.push([num, gloss]);
			}
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

	let source = `<div class="wordlist">`;

	for (let i = 0; i < List.length; i ++) {
		const rawN = List[i][0];
		const padN = "vocabulary_" + String(rawN).padStart(5, '0');

		const t1 = dict[padN]["key"];
		const t2 = dict[padN]["title"];
		const t3 = get_sound(t2);
		
		const check = check_favourites(List[i][0] - 1) ? "★" : "☆";
		const basic = dict[padN]["tag"]["category"].includes("기초") ? true : false;
		const text = basic ? `<strong>${t2}</strong>` : t2;

		source += `<p><a class="add_favourites" id="ABC_fav_${(List[i][0] - 1).toString().padStart(5, '0')}" onclick="add_favourites(${List[i][0]} - 1)" style="font-family: 'Charis SIL'"><span class="emp">${check}</span></a>&nbsp;<a onclick="link('${t1}')">${text}</a>&nbsp;<span class="IPA">[${t3}]</span>&nbsp;:&nbsp;&nbsp;${List[i][1]}</p>`;
	}

	source += `</div>`;

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

	let source = `<div class="wordlist">`;

	for (let i = 0; i < List.length; i ++) {
		const rawN = List[i][0];
		const padN = "vocabulary_" + String(rawN).padStart(5, '0');

		const t1 = dict[padN]["key"];
		const t2 = dict[padN]["title"];
		const t3 = get_sound(t2);
		
		const check = check_favourites(List[i][0] - 1) ? "★" : "☆";
		const basic = dict[padN]["tag"]["category"].includes("기초") ? true : false;
		const text = basic ? `<strong>${t2}</strong>` : t2;

		source += `<p><a class="add_favourites" id="ABC_fav_${(List[i][0] - 1).toString().padStart(5, '0')}" onclick="add_favourites(${List[i][0]} - 1)" style="font-family: 'Charis SIL'"><span class="emp">${check}</span></a>&nbsp;<a onclick="link('${t1}')">${text}</a>&nbsp;<span class="IPA">[${t3}]&nbsp;:&nbsp;&nbsp;${List[i][1]}</p></span>`;
	}

	source += "</div>";

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
		const title_rad = dict[e]["title"].toLowerCase();

		const lowerTextRadical = text.toLowerCase();
		const lowerTextLenited = irish_mutation(lowerTextRadical, "l")

		const maxLength = text.length + length_max + 1;
		const isNotCurrentPage = dict[e]["key"] !== Page;

		const isValidMatch = isNotCurrentPage && [title_rad].some(title => {
			const lowerTitle = title.toLowerCase();
			return (lowerTitle.includes(lowerTextRadical) || lowerTitle.includes(lowerTextLenited)) && title.length <= maxLength;
		});

		if (isValidMatch) {
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
		let t3 = properties.showHangulInsteadOfIPA ? ` <small>(${get_sound(t0)})</small>` : "";

		let t = t0 + "<sup>" + t1 + "</sup>" + t3;

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

//extra appendices
function load_query_glossary(text = "", call = false) {
	topmenu_set_graphic("topmenu_dict");
	show_page(["search_form", "mainpage"], ["gramwiz_input", "suggestions", "gramwiz_suggestions", "gramwiz_output", "propertysettings", "not_found", "ADFB", "includes", "abc"]);

	text = text.trim().replace("gloss:", "").toLowerCase();

	if (!document.getElementById("mainpage").innerHTML.includes(`인명·지명 등 고유명사 일람`)) {
		let source_main = `<h1 style="text-align: center; font-family: 'font_ko';">WEB 부록 3. 인명·지명 미니 백과사전</h1>`;
		for (let e in glossary) {
			source_main += `<br id="gloss_${glossary[e].index}"><hr><br><div>
			<p style="text-align: center; font-size: 1.5em;"><strong>${glossary[e].title.en}</strong></p>
			<p style="text-align: center; font-size: 1.5em; margin-top: -0.75em;"><strong>${glossary[e].title.ko}</strong></p>
			<p style="margin-top: -0.75em;"><small><strong>분류</strong>: ${glossary[e].class.ko}</small></p>
			<div style="line-height: 200%;"><style>div .a {font-weight: bold;}</style>${glossary[e].content}</div>
			</div>`;
		}
		document.getElementById("mainpage").innerHTML = source_main;
	}

	window.location.hash = "gloss_" + text;
}

function find_similars(text, howManySimilars = 10) {
	if (!text) return [-1];

	const target = normalizeWord(text);
	const scoredList = [];

	//calc
	for (let e in dict) {
		// filter perfect-exact
		if (Page.toLowerCase() == dict[e]["key"].toLowerCase()) {
			continue;
		}

		const word1 = normalizeWord(dict[e]["title"] || "");
		const word2 = target;
		const score = calculateSimilarity(word1, word2);

		if (score > 0) {
			scoredList.push({ index: dict[e]["index"], score: score });
		}
	}

	//sort
	scoredList.sort((a, b) => b.score - a.score);

	let Index = [-1];
	
	//extract
	for (let i = 0; i < Math.min(scoredList.length - 1, howManySimilars); i++) {
		Index.push(scoredList[i].index - 1);
	}

	return Array.from(new Set(Index));
}

function normalizeWord(str) {
	return str.toLowerCase()
		.replace(/['’]/g, "'")
		.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Levenshtein Distance
function calculateSimilarity(s1, s2) {
	if (s1 === s2) return 1;
	
	//plus-score for initial mutation
	let mutationScore = 0;
	if (typeof irish_mutation === "function") {
		const mutatedS1 = normalizeWord(irish_mutation(s1, "l"));
		const mutatedS2 = normalizeWord(irish_mutation(s2, "l"));

		if (s2.includes(mutatedS1)) {
			// s1=cat, s2=chat
			mutationScore = Math.max(mutationScore, mutatedS1.length / s2.length);
		}
		if (s1.includes(mutatedS2)) {
			// s1=chat, s2=cat
			mutationScore = Math.max(mutationScore, mutatedS2.length / s1.length);
		}
	}

	// normal inclusion
	let inclusion = 0;
	if (s1.includes(s2) || s2.includes(s1)) {
		inclusion = Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
	}

	// calc levenshtein dist.
	const len1 = s1.length, len2 = s2.length;
	const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

	for (let i = 0; i <= len1; i++) matrix[0][i] = i;
	for (let j = 0; j <= len2; j++) matrix[j][0] = j;

	for (let j = 1; j <= len2; j++) {
		for (let i = 1; i <= len1; i++) {
			const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
			matrix[j][i] = Math.min(
				matrix[j][i - 1] + 1,
				matrix[j - 1][i] + 1,
				matrix[j - 1][i - 1] + cost
			);
		}
	}

	const distance = matrix[len2][len1];
	const levenshtein = 1 - (distance / Math.max(len1, len2));

	/*
	Score Weights
	mutationScore * 0.95
	inclusion * 0.8
	*/
	return Math.max(levenshtein, inclusion * 0.8, mutationScore * 0.95);
}

function load_random() {
	const L = search_db.gloss.ko.length;
	const r = Math.floor(Math.random() * L) + 1;
	const key = Object.values(dict).find(e => e.index === r).key;
	document.getElementById("text").value = key;
	load_adfb(false);
}