function gramwiz_input(num) {
	const form = "text_gw_input_" + num;
	const text = document.getElementById(form).value.trim();

	//filter bad words
	if (/[\=\.\,\;가-힣]/.test(text)) { return -1; }

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
	//erronous call -> return
	if (gramwizInput[1] === undefined || gramwizInput[2] === undefined) {
		return -1;
	}

	const voc1 = gramwizInput[1]; const voc2 = gramwizInput[2];

	//case error: one of the words is indeclinable
	if (voc1.class == "i" || voc2.class == "i") {
		document.getElementById("text_gw_output").innerHTML = `?!`
		document.getElementById("text_gw_output_detail").innerHTML = `<p style="margin-top: -1em;">두 단어 중 하나 이상이 활용 불가능한 단어여서 합성할 수 없습니다.</p><p>단어의 분류가 <strong>“불변사 (i)”</strong>가 아닌지 확인해 보세요!</p>`;
		return -1;
	}

	//case 1: noun + noun -> A의 B
	if ((voc1.class == "m" || voc1.class == "f") && (voc2.class == "m" || voc2.class == "f")) {
		//use article? if voc1 is compound then article = 1
		let article = document.getElementById("gramwizArticle").checked || voc1.title.includes(" ") ? 1 : 0;
		const ban_genitive_lenition_nom = [`cuid`, `easpa`, `iomarca`, `lámh`, `adharc`, `crúb`];
		const ban_genitive_lenition_gen = [`bean`, `fear`, `duine`];

		let gramwiz_result = ["", "", "", ""];

		function Join(a, b, lenition = false) {
			if (voc1.grammar[a] == "" || voc2.grammar[b] == "") {
				return "";
			}
			else {
				const left = voc1.grammar[a]
				const right = lenition ? irish_mutation(voc2.grammar[b], "l") : voc2.grammar[b];
				return `${left} ${right}`;
			}
		}

		//B is compound -> article = 1
		let b_is_comp = false;
		for (let i = 0; i < voc2.grammar.length; i += 2) {
			if (voc2.grammar[i].includes(" ")) {
				b_is_comp = true; break;
			}
		}
		if (b_is_comp) { article = 1; }


		if (article === 1) {
			//sg only or pl only?
			gramwiz_result[0] = Join(0, 3, false);	gramwiz_result[1] = Join(4, 3, false);
			gramwiz_result[2] = Join(0, 7, false);	gramwiz_result[3] = Join(4, 7, false);
		}
		else if (article === 0) {
			//lenition-banned word?
			if (ban_genitive_lenition_nom.includes(voc1.grammar[0]) || ban_genitive_lenition_gen.includes(voc2.grammar[0])) {
				gramwiz_result[0] = Join(0, 2, false);	gramwiz_result[1] = Join(4, 2, false);
				gramwiz_result[2] = Join(0, 6, false);	gramwiz_result[3] = Join(4, 6, false);
			}
			// dlnst + dst -> no lenition
			else if (["d", "l", "n", "s", "t"].includes(voc1.grammar[0].at(-1)) && ["d", "s", "t"].includes(voc2.grammar[0].at(0))) {
				gramwiz_result[0] = Join(0, 2, false);	gramwiz_result[1] = Join(4, 2, false);
				gramwiz_result[2] = Join(0, 6, false);	gramwiz_result[3] = Join(4, 6, false);
			}
			// XX + f -> no lenition
			else if (voc2.grammar[0].at(0).toLowerCase() === "f") {
				gramwiz_result[0] = Join(0, 2, false);	gramwiz_result[1] = Join(4, 2, false);
				gramwiz_result[2] = Join(0, 6, false);	gramwiz_result[3] = Join(4, 6, false);
			}
			//A = sg. nom. fem.? A = slender pl.?
			else if (voc1.class === "f" && voc1.grammar[8] === "slender") {
				gramwiz_result[0] = Join(0, 2, true);	gramwiz_result[1] = Join(4, 2, true);
				gramwiz_result[2] = Join(0, 6, true);	gramwiz_result[3] = Join(4, 6, true);
			}
			else if (voc1.class === "f" && voc1.grammar[8] !== "slender") {
				gramwiz_result[0] = Join(0, 2, true);	gramwiz_result[1] = Join(4, 2, false);
				gramwiz_result[2] = Join(0, 6, true);	gramwiz_result[3] = Join(4, 6, false);
			}
			else if (voc1.class !== "f" && voc1.grammar[8] === "slender") {
				gramwiz_result[0] = Join(0, 2, false);	gramwiz_result[1] = Join(4, 2, true);
				gramwiz_result[2] = Join(0, 6, false);	gramwiz_result[3] = Join(4, 6, true);
			}

			else {
				gramwiz_result[0] = Join(0, 2, false);	gramwiz_result[1] = Join(4, 2, false);
				gramwiz_result[2] = Join(0, 6, false);	gramwiz_result[3] = Join(4, 6, false);
			}
		}

		//representative
		let representative = gramwiz_result[0];
		for (let i = 0; i < gramwiz_result.length - 1; i ++) {
			if (gramwiz_result[i] != "") { break; }
			else { representative = gramwiz_result[i + 1]; }
		}

		document.getElementById("text_gw_output").innerHTML = `
			<p>
				${representative}&nbsp;&nbsp;
				<span class="IPA" style="font-size: 0.75em; font-style: normal;">[${get_sound(representative)}]</span>
			</p>
			<p>“ ${voc2.gloss.sh}의 ${voc1.gloss.sh} ”</p>`;

		//details
		document.getElementById("text_gw_output_detail").innerHTML = `
			<table style="table-layout: auto;">
				<tr>
					<th style="min-width: 50px;">&nbsp;</th>
					<th style="width: 30%;">${voc1.gloss.sh}</small></th>
					<th style="width: 30%;">${voc1.gloss.sh}들</small></th>
				</tr>
				<tr>
					<th>${voc2.gloss.sh}의</th>
					<td><p><strong>${gramwiz_result[0]}</strong></p><p class="original_script>${LattoOrg(gramwiz_result[0])}</p><p class="IPA"><small>[${get_sound(gramwiz_result[0])}]</small></p></td>
					<td><p><strong>${gramwiz_result[1]}</strong></p><p class="original_script>${LattoOrg(gramwiz_result[1])}</p><p class="IPA"><small>[${get_sound(gramwiz_result[1])}]</small></p></td>
				</tr>
				<tr>
					<th>${voc2.gloss.sh}들의</th>
					<td><p><strong>${gramwiz_result[2]}</strong></p><p class="original_script>${LattoOrg(gramwiz_result[2])}</p><p class="IPA"><small>[${get_sound(gramwiz_result[2])}]</small></p></td>
					<td><p><strong>${gramwiz_result[3]}</strong></p><p class="original_script>${LattoOrg(gramwiz_result[3])}</p><p class="IPA"><small>[${get_sound(gramwiz_result[3])}]</small></p></td>
				</tr>
			</table>`.replaceAll("[]", "―");
	}

	//case 2: adj + noun -> A한 B
	else if ((voc1.class == "a" && (voc2.class == "m" || voc2.class == "f")) || voc2.class == "a" && (voc1.class == "m" || voc1.class == "f")) {
		const non = voc2.class == "a" ? voc1 : voc2;
		const adj = voc1.class == "a" ? voc1 : voc2;

		let gramwiz_result = ["0", "1", "2", "3", "4", "5", "6", "7", ""];
		for (let i = 0; i <= 7; i ++) {
			if (non.grammar[i] == "" || adj.grammar[i] == "") { gramwiz_result[i] = ""; }
		}

		function Join(a, b) { return non.grammar[a] + " " + adj.grammar[b]; }

		if (gramwiz_result[0] != "") {
			gramwiz_result[0] = non.class == "m" ? Join(0, 0) : Join(0, 1);
		}
		if (gramwiz_result[1] != "") {
			gramwiz_result[1] = non.class == "m" ? Join(1, 0) : Join(1, 1);
		}
		if (gramwiz_result[2] != "") {
			gramwiz_result[2] = non.class == "m" ? Join(2, 2) : Join(2, 3);
		}
		if (gramwiz_result[3] != "") {
			gramwiz_result[3] = non.class == "m" ? Join(3, 2) : Join(3, 3);
		}
		if (gramwiz_result[4] != "") {
			gramwiz_result[4] = non.grammar[8] == "broad" ? Join(4, 4) : Join(4, 5);
		}
		if (gramwiz_result[5] != "") {
			gramwiz_result[5] = non.grammar[8] == "broad" ? Join(5, 4) : Join(5, 5);
		}
		if (gramwiz_result[6] != "") {
			gramwiz_result[6] = non.grammar[9] == "strong" ? Join(6, 6) : Join(6, 7);
		}
		if (gramwiz_result[7] != "") {
			gramwiz_result[7] = non.grammar[9] == "strong" ? Join(7, 6) : Join(7, 7);
		}

		let comp_num = 1;
		if (comp_num === 1 && non.grammar[1] == "") { comp_num = 0; }
		if (comp_num === 0 && non.grammar[0] == "") { comp_num = 5; }
		if (comp_num === 5 && non.grammar[5] == "") { comp_num = 4; }
		let isExistComp = adj.grammar[9] != "";
		gramwiz_result[8] = isExistComp ? Join(comp_num, 9) : "";

		//representative
		let representative = gramwiz_result[0];
		for (let i = 0; i < gramwiz_result.length - 1; i ++) {
			if (gramwiz_result[i] != "") { break; }
			else { representative = gramwiz_result[i + 1]; }
		}

		document.getElementById("text_gw_output").innerHTML = `
			<p>
				${representative}&nbsp;&nbsp;
				<span class="IPA" style="font-size: 0.75em; font-style: normal;">[${get_sound(representative)}]</span>
			</p>
			<p>“${adj.gloss.sh} ${non.gloss.sh}”</p>`;

		//details
		document.getElementById("text_gw_output_detail").innerHTML = `
			<table>
				<tr>
					<th style="min-width: 50px;">&nbsp;</th>
					<th style="width: 30%;">${adj.gloss.sh}...</small></th>
					<th style="width: 30%;">~의</small></th>
				</tr>
				<tr>
					<th>${non.gloss.sh}</th>
					<td><p><strong>${gramwiz_result[0]}</strong></p><p class="original_script>${LattoOrg(gramwiz_result[0])}</p><p class="IPA"><small>[${get_sound(gramwiz_result[0])}]</small></p></td>
					<td><p><strong>${gramwiz_result[2]}</strong></p><p class="original_script>${LattoOrg(gramwiz_result[2])}</p><p class="IPA"><small>[${get_sound(gramwiz_result[2])}]</small></p></td>
				</tr>
				<tr>
					<th>${non.gloss.sh}들</th>
					<td><p><strong>${gramwiz_result[4]}</strong></p><p class="original_script>${LattoOrg(gramwiz_result[4])}</p><p class="IPA"><small>[${get_sound(gramwiz_result[4])}]</small></p></td>
					<td><p><strong>${gramwiz_result[6]}</strong></p><p class="original_script>${LattoOrg(gramwiz_result[6])}</p><p class="IPA"><small>[${get_sound(gramwiz_result[6])}]</small></p></td>
				</tr>
			</table>`.replaceAll("[]", "―");

		if (isExistComp) {
			document.getElementById("text_gw_output_detail").innerHTML += `<p style="text-align:left;">&nbsp;&nbsp;<strong>더/가장 ${adj.gloss.sh} ${non.gloss.sh}</strong>: <strong>${gramwiz_result[8]}</strong> <span class="IPA"><small>[${get_sound(gramwiz_result[8])}]</small></span></p>`;
		}
	}

	//case 3: adj + adj -> error
	else if (voc1.class == "a" && voc2.class == "a") {
		document.getElementById("text_gw_output").innerHTML = `<small>형용사 + 명사 (A한 B) 또는 명사 + 명사 (A의 B)를 입력해 보세요!</small>`;
		document.getElementById("text_gw_output_detail").innerHTML = "";
	}
}

//evaluate similarity
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
		let t3 = sound_get_han(t0);

		let t = t0 + "<sup>" + t1 + "</sup>" + " <small>(" + t3 + ")</small>";

		//homonym
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
	document.getElementById("text_gw_display_1").innerHTML = "";
	document.getElementById("text_gw_display_2").innerHTML = "";
	document.getElementById("text_gw_output").innerHTML = "";
	document.getElementById("text_gw_output_detail").innerHTML = "";
}