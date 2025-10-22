function gramwiz_input(num) {
	const form = "text_gw_input_" + num;
	const text = document.getElementById(form).value.trim();

	//filter bad words
	if (/[ \=\.\,\;가-힣]/.test(text)) { return -1; }

	//is the input exactly matching?
	const isExact = Object.values(dict).find(e => e.key === text) !== undefined;

	//no it is not exact
	if (isExact === false) {
		document.getElementById("findthis").innerHTML = "이것을 찾으셨나요?&nbsp;";
		gramwiz_suggest(text, num);
	}

	//yes it is exact
	else if (isExact === true) {
		document.getElementById("findthis").innerHTML = "";
		const voc = Object.values(dict).find(e => e.key === text);
	
		gramwizInput[num] = voc;
		document.getElementById("text_gw_display_" + num).innerHTML = voc.title;
	
		//send signal if two inputs are filled properly
		if (gramwizInput[1] !== undefined && gramwizInput[2] !== undefined) {
			gramwiz_output();
		}

		document.getElementById(form).value = "";
	}
}

function gramwiz_output() {
	//잘못 호출됐을 때 바로 리턴
	if (gramwizInput[1] === undefined || gramwizInput[2] === undefined) {
		return -1;
	}

	const voc1 = gramwizInput[1]; const voc2 = gramwizInput[2];

	//case 1: noun + noun -> A의 B
	if ((voc1.class == "m" || voc1.class == "f") && (voc2.class == "m" || voc2.class == "f")) {
		//단수, 복수 주격 무관사형
		const part1 = [voc1.grammar[0], voc1.grammar[4]]

		// 단수, 복수 속격 관사형; 드물게 관사형이 없는 명사가 있는데 이때는 무관사형
		const part2 = voc2.grammar[3] !== "" ? [voc2.grammar[3], voc2.grammar[7]] : [voc2.grammar[2], voc2.grammar[6]]

		let phrase = [`${part1[0]} ${part2[0]}`, `${part1[1]} ${part2[0]}`, `${part1[0]} ${part2[1]}`, `${part1[1]} ${part2[1]}`]

		//복수 없을때
		if (part1[1] == "") {
			phrase[1] = ""; phrase[3] = "";
		}
		else if (part2[1] == "") {
			phrase[2] = ""; phrase[3] = "";
		}

		//대표형
		document.getElementById("text_gw_output").innerHTML = `<p>${phrase[0]} [${get_sound(phrase[0], true)}]</p><p>“${voc2.gloss.sh}의 ${voc1.gloss.sh}”</p>`;

		//상세
		document.getElementById("text_gw_output_detail").innerHTML = `
			<table>
				<tr>
					<th style="width: 10%;">&nbsp;</th>
					<th style="width: 30%;">${voc1.gloss.sh}</small></th>
					<th style="width: 30%;">${voc1.gloss.sh}들</small></th>
				</tr>
				<tr>
					<th>${voc2.gloss.sh}의</th>
					<td><p><strong>${phrase[0]}</strong></p><p class="original_script>${LattoOrg(phrase[0])}</p><p class="IPA"><small>[${get_sound(phrase[0], true)}]</small></p></td>
					<td><p><strong>${phrase[1]}</strong></p><p class="original_script>${LattoOrg(phrase[1])}</p><p class="IPA"><small>[${get_sound(phrase[1], true)}]</small></p></td>
				</tr>
				<tr>
					<th>${voc2.gloss.sh}들의</th>
					<td><p><strong>${phrase[2]}</strong></p><p class="original_script>${LattoOrg(phrase[2])}</p><p class="IPA"><small>[${get_sound(phrase[2], true)}]</small></p></td>
					<td><p><strong>${phrase[3]}</strong></p><p class="original_script>${LattoOrg(phrase[3])}</p><p class="IPA"><small>[${get_sound(phrase[3], true)}]</small></p></td>
				</tr>
			</table>`;
	}

	//case 2: adj + noun -> A한 B
	if ((voc1.class == "a" && (voc2.class == "m" || voc2.class == "f")) || voc2.class == "a" && (voc1.class == "m" || voc1.class == "f")) {
		//뭐가 형용사고 뭐가 명사인지부터 판별
		const non = voc2.class == "a" ? voc1 : voc2;
		const adj = voc1.class == "a" ? voc1 : voc2;

		//명사: 속격에 관사 있으면 관사형 취하고 안되면 안돼
		let part1 = [``, ``, ``, ``, ``];
		part1[0] = non.grammar[0]; //단수 주격
		part1[1] = non.grammar[3] != "" ? non.grammar[3] : non.grammar[2] //단수 속격
		part1[2] = non.grammar[4]; //복수 주격
		part1[3] = non.grammar[7] != "" ? non.grammar[7] : non.grammar[6] //복수 속격
		part1[4] = non.grammar[1] != "" ? non.grammar[1] : non.grammar[0]; //비교급에 쓸 단수 주격 관사형

		//[단수주격, 단수속격, 복수주격, 복수속격, 비교급] 순으로 구성
		//남성, 여성 판별
		let part2 = [];
		if (non.class === "m") {
			part2.push(adj.grammar[0], adj.grammar[2]);
		}
		else if (non.class === "f") {
			part2.push(adj.grammar[1], adj.grammar[3]);
		}

		//복수 주격 broad - slender
		if (non.grammar[8] === "broad") {
			part2.push(adj.grammar[4]);
		}
		else if (non.grammar[8] === "slender") {
			part2.push(adj.grammar[5]);
		}
		else { //복수 없을때
			part2.push("");
		}

		//복수 속격 strong - weak
		if (non.grammar[9] === "strong") {
			part2.push(adj.grammar[6]);
		}
		else if (non.grammar[9] === "weak") {
			part2.push(adj.grammar[7]);
		}
		else { //복수 없을때
			part2.push("");
		}

		//비교급
		part2.push(adj.grammar[9]);

		//대표형
		document.getElementById("text_gw_output").innerHTML = `<p>${part1[0] + " " + part2[0]} [${get_sound(part1[0] + " " + part2[0], true)}]</p><p>“${adj.gloss.sh} ${non.gloss.sh}”</p>`;

		//상세
		document.getElementById("text_gw_output_detail").innerHTML = `
			<table>
				<tr>
					<th style="width: 10%;">&nbsp;</th>
					<th style="width: 30%;">${adj.gloss.sh}...</small></th>
					<th style="width: 30%;">~의</small></th>
				</tr>
				<tr>
					<th>${non.gloss.sh}</th>
					<td><p><strong>${part1[0] + " " + part2[0]}</strong></p><p class="original_script>${LattoOrg(part1[0] + " " + part2[0])}</p><p class="IPA"><small>[${get_sound(part1[0] + " " + part2[0], true)}]</small></p></td>
					<td><p><strong>${part1[1] + " " + part2[1]}</strong></p><p class="original_script>${LattoOrg(part1[1] + " " + part2[1])}</p><p class="IPA"><small>[${get_sound(part1[1] + " " + part2[1], true)}]</small></p></td>
				</tr>
				<tr>
					<th>${non.gloss.sh}들</th>
					<td><p><strong>${part1[2] + " " + part2[2]}</strong></p><p class="original_script>${LattoOrg(part1[2] + " " + part2[2])}</p><p class="IPA"><small>[${get_sound(part1[2] + " " + part2[2], true)}]</small></p></td>
					<td><p><strong>${part1[3] + " " + part2[3]}</strong></p><p class="original_script>${LattoOrg(part1[3] + " " + part2[3])}</p><p class="IPA"><small>[${get_sound(part1[3] + " " + part2[3], true)}]</small></p></td>
				</tr>
			</table>
			<p style="text-align:left;">&nbsp;&nbsp;<strong>더/가장 ${adj.gloss.sh} ${non.gloss.sh}</strong>: ${part1[4]} ${part2[4]} <span class="IPA"><small>[${get_sound(part1[4] + " " + part2[4], true)}]</small></span></p>`;
	}

	//case 1: adj + adj -> error
	if (voc1.class == "a" && voc2.class == "a") {
		document.getElementById("text_gw_output").innerHTML = `<small>형용사 + 명사 (A한 B) 또는 명사 + 명사 (A의 B)를 입력해 보세요!</small>`;
		document.getElementById("text_gw_output_detail").innerHTML = "";
	}
}

//유사도
function gramwiz_suggest(text, num) {
	topmenu_set_graphic("topmenu_gramwiz");

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

		//동음이의어
		let t2 = Page.split("_")[0];

		if (t0 == t2) {
			source += `<strong><a onclick="gramwiz_input_called_by_suggest('${link}',${num})">${t}</a></strong>`
		}
		else {
			source += `<a onclick="gramwiz_input_called_by_suggest('${link}',${num})">${t}</a>`
		}

		if (i < SimilarIndices.length - 1) {
			source += " · "
		}
	}

	document.getElementById("gramwiz_suggestions_search").innerHTML = source;
}

function gramwiz_input_called_by_suggest(text, num) {
	const form = "text_gw_input_" + num;
	document.getElementById(form).value = text;
	gramwiz_input(num);
}


function gramwiz_reverse() {
	const a = gramwizInput[1] !== undefined ? gramwizInput[1].key : "";
	const b = gramwizInput[2] !== undefined ? gramwizInput[2].key : "";

	if (a === "") {
		gramwizInput[2] = undefined;
		document.getElementById("text_gw_display_2").value = "";
		document.getElementById("text_gw_output").innerHTML = "";
		document.getElementById("text_gw_output_detail").innerHTML = "";
	}
	else if (b === "") {
		gramwizInput[1] = undefined;
		document.getElementById("text_gw_display_1").value = "";
		document.getElementById("text_gw_output").innerHTML = "";
		document.getElementById("text_gw_output_detail").innerHTML = "";
	}

	document.getElementById("text_gw_input_1").value = b;
	document.getElementById("text_gw_input_2").value = a;

	gramwiz_input(1); gramwiz_input(2);

	document.getElementById("text_gw_input_1").value = "";
	document.getElementById("text_gw_input_2").value = "";
}

function gramwiz_clear() {
	gramwizInput[1] = undefined; gramwizInput[2] = undefined;

	document.getElementById("text_gw_input_1").value = "";
	document.getElementById("text_gw_input_2").value = "";
	document.getElementById("text_gw_display_1").value = "";
	document.getElementById("text_gw_display_2").value = "";
	document.getElementById("text_gw_output").innerHTML = "";
	document.getElementById("text_gw_output_detail").innerHTML = "";
}