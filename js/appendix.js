document.getElementById("appdendix_1").innerHTML = "아일랜드어 소개";
const SourceAppendix1 = `<div style="line-height: 200%;">
<h1 style="text-align: center; font-family: 'font_ko';">부록 1. 아일랜드어를 소개해요</h1><hr>
<p>부록 서적은 정식 버전을 기대해 주세요~</p>
</div>`;

document.getElementById("appdendix_2").innerHTML = "아일랜드어 읽는 방법";
const SourceAppendix2 = `<div style="line-height: 200%;">
<h1 style="text-align: center; font-family: 'font_ko';">부록 2. 아일랜드어를 읽어 보아요</h1><hr>
<p>부록 서적은 정식 버전을 기대해 주세요~</p>
</div>`;

document.getElementById("appdendix_3").innerHTML = "단어를 합치는 방법";
const SourceAppendix3 = `<div style="line-height: 200%;">
<h1 style="text-align: center; font-family: 'font_ko';">부록 3. 아일랜드어 단어를 합쳐요</h1><hr>
<p>부록 서적은 정식 버전을 기대해 주세요~</p>
</div>`;

const dict_tip = [
	`역방향 검색은 전자사전의 필수 교양! 검색 창에 한국어 단어, 또는 한글 발음을 입력해 보세요.`,
	`표제어 오른쪽의 별<span class="emp" style="font-family:'font_en';">☆</span>을 클릭해 보셨나요? 책갈피에 단어를 끼워서 기억해 두세요.`,
	`책갈피에 끼워 둔 단어를 문법 마법사에서 선택하실 수 있어요!`,
	`영어 해석을 검색하고 싶으시다면 검색어 앞에 “en:”을 넣어 보세요.`,
	`검색, 즐겨찾기 등의 단어 목록에서 <a onclick="link('tag:기초')"><strong>“기초”</strong> 태그가 붙은 단어</a>는 <strong>굵은 글씨</strong>로 표시됩니다!`
];

const language_tip = [
	`«켈트어 창작사전»은 이용자님의 쿠키를 사용합니다. 자동 로그인, 즐겨찾기 목록, 환경 설정 등은 브라우저 쿠키를 삭제하실 때 소실될 수 있습니다.`,
	`“켈트어”는 켈트어군에 속하는 수많은 언어를 합쳐 부르는 말입니다. 현대에는 6개 언어가 존재하는데, 서로 말이 통하지 않을 만큼 많이많이 다르답니다! 아일랜드어는 6개 켈트어 중 하나입니다.`
];

const random_tip = dict_tip.concat(language_tip);

function load_appendix(page, call = false) {
	show_page(["search_form", "mainpage"], ["gramwiz_input", "suggestions", "gramwiz_suggestions", "gramwiz_output", "propertysettings", "not_found", "ADFB", "includes", "abc"]);

	if (call == false) { undo_stack(page); }

	let source_appendix = "";

	switch (page) {
		case 1:
			source_appendix = SourceAppendix1;
		break
		case 2:
			source_appendix = SourceAppendix2;
		break
		case 3:
			source_appendix = SourceAppendix3;
		break
	}

	document.getElementById("mainpage").innerHTML = source_appendix;
}