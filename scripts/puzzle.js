var plevel = 3

var porientation = -1;
var reDrawBlocks = false;
var shuffled = true;

//记录移动到页面的位置
var toX = 0;
var toY = 0;
var lastTouch = 0;
const posdiff = 80;

//顺序
var hpair, vpair, disOrder, idOrder;
var hOrderSet, vOrderSet;

const playbt = document.querySelector('#play');
const imagebt = document.querySelector('#selectbt');
const selectimg = document.querySelector('#selectimage');
const puzzleview = document.querySelector('#puzzle_area');
const imageview = document.querySelector('#img_area');
const audio = document.getElementById("DoneAudio");      
const level = document.querySelector('#level');

selectimg.addEventListener('change', updateImageDisplay);
level.addEventListener('change', levelChanged);

playbt.addEventListener('touchstart', touchPlay);
imagebt.addEventListener('touchstart', touchSelect);
imagebt.addEventListener("load", loadNewImage);

window.addEventListener("orientationchange", orientationChange);
window.addEventListener("resize", sizeChange);

showImageBlocks();

function levelChanged(evt) {
	plevel = 1 +  Number(evt.target.value);
	showImageBlocks();
	blockShuffle();	
}


function loadNewImage() {
	console.log("hahaha");
	showImageBlocks();
}

function touchSelect(evt) {
	evt.preventDefault();
	evt.target.addEventListener('touchend', toSelect);
}

function toSelect(evt) {
	evt.preventDefault();
	selectimg.click();
	evt.target.removeEventListener('touchend', toSelect);
}

function touchPlay(evt) {
	evt.preventDefault();
	evt.target.addEventListener('touchend', toPlay);
}

function toPlay(evt) {
	evt.preventDefault();
	evt.target.removeEventListener('touchend', toPlay);
	if(shuffled) {
		showImageBlocks();
	} else {
		blockShuffle();		
	}
}

//初始化 小图块的相邻关系集合
function initilizeOrderSet() {
    getIDOrderArray(true);
    getIDPairArray();
    hOrderSet = new Set(hpair);
    vOrderSet = new Set(vpair);
}

function showImageBlocks() {
	initilizeOrderSet();

	var v_W, v_H, left, top;

    const ratio_W = imagebt.naturalWidth / puzzleview.clientWidth;//记录移动到页面的位置
    const ratio_H = imagebt.naturalHeight / puzzleview.clientHeight;
    if (ratio_H > ratio_W) {
		v_W = Math.ceil(imagebt.naturalWidth / ratio_H);
		v_H = Math.ceil(imagebt.naturalHeight / ratio_H);
		left = Math.floor((puzzleview.clientWidth - v_W) / 2);
		top = 0;
    }
    else {
		v_W = Math.floor(imagebt.naturalWidth / ratio_W);
		v_H = Math.floor(imagebt.naturalHeight / ratio_W);
		left = 0;
		top = Math.floor((puzzleview.clientHeight - v_H) / 2);
    }

    imageview.style.width = v_W + "px";
    imageview.style.height = v_H + "px";
	imageview.style.left = left + "px";
	imageview.style.top = top + "px";
	
	//imageview.style.backgroundImage = 'url(' + imagebt.src + ')';

	while(imageview.firstChild) {
		imageview.removeChild(imageview.firstChild);
	}
	var blk, xpos, ypos, percentage;
	var block;
	percentage = 100 / (plevel - 1);
	for(blk = 0; blk < plevel*plevel; blk++){
		const block = document.createElement('li');
		block.id = blk;
		block.style.backgroundImage = 'url(' + imagebt.src +  ')';
		block.style.width = imageview.clientWidth / plevel + "px";
		block.style.height = imageview.clientHeight / plevel + "px";
		block.style.backgroundSize = (plevel * 100) + '%';
		xpos = (percentage * (blk % plevel)) + '%';
		ypos = (percentage * Math.floor(blk / plevel)) + '%';
		block.style.backgroundPosition = xpos + ' ' + ypos;
		block.addEventListener("touchstart", blockTouched);
		imageview.appendChild(block);	
	}
	shuffled = false;
//	playbt.innerText = "挑战";

	reDrawBlocks = false;
}

function blockTouched(evt) {
	evt.preventDefault();
	// 获取触摸点的位置
	const touch = evt.targetTouches[0];

	const currentTouch = new Date().getTime();
	const timeGap = currentTouch - lastTouch;	

	if (timeGap < 200 && Math.abs(touch.pageX - toX) < posdiff && Math.abs(touch.pageY - toY) < posdiff) 
	{
		// 显示双击事件
		blockDoubleTouched(evt)
	} 
	else 
	{	 
		evt.target.addEventListener("touchmove", blockTouchMoved);
		evt.target.addEventListener("touchend", blockTouchEnded);
		evt.target.style.filter = "brightness(0.5)";
	}
	lastTouch = currentTouch
	toX = touch.pageX;
	toY = touch.pageY;
}

function blockDoubleTouched(evt) {
	let st = window.getComputedStyle(evt.target, null);
	let tr = st.getPropertyValue("transform");
	if( tr == "none" ) {
		evt.target.style.transform = "rotate(0.5turn)";
	}
	else {
		evt.target.style.transform = "";
	}
	checkImageStatus();
}

function blockTouchMoved(evt) {
	evt.preventDefault();
	
	const touch = evt.targetTouches[0];
	// 获取触摸点的位置
	toX = touch.pageX;
	toY = touch.pageY;	
}

function blockTouchEnded(evt) {
	evt.preventDefault();
	evt.target.style.filter = "brightness(1)";
	
	const toelmt = document.elementFromPoint(toX, toY);
	const ny = evt.target.id;
	switchImgBlock(toelmt.id, ny, true);

	evt.target.removeEventListener("touchmove", blockTouchMoved);
	evt.target.removeEventListener("touchend", blockTouchEnded);
}

//交换两个小图块的位置
function switchImgBlock(xID, yID) {
    if(xID == yID){
        return;
    }

    const nodex = document.getElementById(xID);
    const nodey = document.getElementById(yID);
    const nodexn = nodex.nextSibling;
    const nodeyn = nodey.nextSibling;

    if(nodexn) {
        if(nodexn == nodey){
            imageview.insertBefore(nodey, nodex);
        }
        else {
            imageview.insertBefore(nodex, nodey);
            imageview.insertBefore(nodey, nodexn);
        }        
    }
    else {
        if(nodeyn == nodex){
            imageview.insertBefore(nodex, nodey);
        }
        else {
            imageview.insertBefore(nodey, nodex);
            imageview.insertBefore(nodex, nodeyn);
        }
    }
	checkImageStatus();
}

function checkImageStatus() {
	if (isImageRecovered()) {
		shuffled = false;
//		playbt.innerText = "重来";
		audio.play();
	} else {
		shuffled = true;
//		playbt.innerText = "原图";
	}
}

//重排图片
function blockShuffle() {
    let i, j, k, r;
    k = plevel * plevel;
    for (i = 0; i < k; i++) {
        r = Math.random();
        if(r >= 0.3) {
            imageview.childNodes[i].style.transform = "rotate(0.5turn)";
        }
        j = Math.floor(r * k);
        if( i != j) {
            idx = imageview.childNodes[i].id
            idy = imageview.childNodes[j].id
            switchImgBlock(idx, idy);
        }        
    }

    fullyShuffleBlocks();
	
	shuffled = true;
//	playbt.innerText = "原图";
}

//将小图块完全打乱
function fullyShuffleBlocks() {
    let i, k = 1;
    let disblk;
    while (k > 0) {
        findNotShuffledPair();
        k = disOrder.length;
        if(k == 0) {
            break;
        }
        for(i=0; i < k; i++) {
            disblk = disOrder[i].split("-");
            switchImgBlock(disblk[0], disblk[1]);
        }
    }
}

//寻找没有打乱的小图块
function findNotShuffledPair() {
    let i, j, k;
    getIDOrderArray(false);
    getIDPairArray();
    k = vpair.length;
    disOrder = new Array();
    for(i=0; i<k; i++) {
        if(vOrderSet.has(vpair[i])) {
            disOrder.push(vpair[i]);
        }
    }
    for(i=0; i<k; i++) {
        if(hOrderSet.has(hpair[i])) {
            disOrder.push(hpair[i]);
        }
    }
}

//获取小图块的顺序（分 原始和当前）
function getIDOrderArray(origin=false) {
    let i, k;
    k = plevel * plevel;
    idOrder = new Array(k);
    for(i = 0; i < k; i++) {
        if(origin){
            idOrder[i] = i;
        }
        else {
            idOrder[i] = imageview.childNodes[i].id;
        }
    }
}

//分析得到各小图块的相互位置关系对
function getIDPairArray() {
    let i, j, k, m;
    k = plevel * plevel;
    hpair = Array((plevel - 1) * plevel);
    m = 0;
    for(i = 0; i < k; i = i + plevel) {
        for(j=i; j< i+plevel-1; j++){
            hpair[m] = idOrder[j] + "-" + idOrder[j+1]
            m++
        }
    }

    vpair = Array((plevel - 1) * plevel);
    m = 0;
    for(i = 0; i < plevel; i++) {
        for(j = 0; j < plevel - 1; j++){
            vpair[m] = idOrder[i + j*plevel] + "-" + idOrder[i + (j+1)*plevel]
            m++
        }
    }
}

//检查小图块的旋转状态和先后顺序
function isImageRecovered() {
    let i, j, k;
    let st, tr;
    k = imageview.children.length;
    for (i = 0; i < k; i++) {
        if(imageview.childNodes[i].id != i){
            return false;
        }
        st = window.getComputedStyle(imageview.childNodes[i], null);
        tr = st.getPropertyValue("transform");
        if( tr != "none" ) {
            return false;
        }        
    }
    return true;
}

function updateImageDisplay(evt) {
	const curFiles = selectimg.files;
	if(curFiles.length !== 0) {
		console.log(curFiles[0].name);
		var reader = new FileReader();
		reader.readAsDataURL(curFiles[0]);
		reader.onload = function (evt) {
			const loadedimg = evt.target.result;		
			imagebt.src = loadedimg;
		}
	}	
}

function orientationChange() {
	if (porientation !== window.orientation)
	{
		reDrawBlocks = true;
		porientation = window.orientation;
	}
}

function sizeChange() {
	showImageBlocks();
//	if(reDrawBlocks) {
//		showImageBlocks();
//	}
}