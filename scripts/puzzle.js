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

//获取设备的显示区大小
var w_min, w_max;
const w_width = document.documentElement.clientWidth;
const w_height = document.documentElement.clientHeight;
if(w_width < w_height) {
		w_min = w_width;
		w_max = w_height;
	} else {
		w_min = w_height;
		w_max = w_width;
	}

//获取各个元素
const playbt = document.querySelector('#play');
const imagebt = document.querySelector('#selectbt');
const selectimg = document.querySelector('#selectimage');
const puzzleview = document.querySelector('#puzzle_area');
const imageview = document.querySelector('#img_area');
const audio = document.getElementById("DoneAudio");      
const level = document.querySelector('#level');

//各元素添加事件
selectimg.addEventListener('change', updateImageDisplay);
level.addEventListener('change', levelChanged);

playbt.addEventListener('touchstart', touchPlay);
imagebt.addEventListener('touchstart', touchSelect);
imagebt.addEventListener("load", loadNewImage);

window.addEventListener("orientationchange", orientationChange);
window.addEventListener("resize", sizeChange);

//显示默认图片
showImageBlocks();

function levelChanged(evt) {
	plevel = 1 +  Number(evt.target.value);
	showImageBlocks();
	blockShuffle();	
}


function loadNewImage() {
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

	//Remove previous blocks 
	while(imageview.firstChild) {
		imageview.removeChild(imageview.firstChild);
	}

	//Recalculate imageview size and position
	let v_W, v_H, left, top;

    const ratio_W = imagebt.naturalWidth / puzzleview.clientWidth;
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

	//show blocks	
	let percentage = 100 / (plevel - 1);
	let blk_w = imageview.clientWidth / plevel + "px";
	let blk_h = imageview.clientHeight / plevel + "px";
	let blk_url = 'url(' + imagebt.src +  ')';
	let blk_size = (plevel * 100) + '%';

	let block, blk, xpos, ypos;
	for(blk = 0; blk < plevel*plevel; blk++){
		block = document.createElement('li');
		block.id = blk;
		block.style.backgroundImage = blk_url;
		block.style.width = blk_w;
		block.style.height = blk_h;
		block.style.backgroundSize = blk_size;
		xpos = (percentage * (blk % plevel)) + '%';
		ypos = (percentage * Math.floor(blk / plevel)) + '%';
		block.style.backgroundPosition = xpos + ' ' + ypos;
		block.addEventListener("touchstart", blockTouched);
		imageview.appendChild(block);	
	}
	shuffled = false;
	playbt.innerText = "挑战";

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
		playbt.innerText = "重来";
		audio.play();
	} else {
		shuffled = true;
		playbt.innerText = "原图";
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
	playbt.innerText = "原图";
}

//将小图块完全打乱
function fullyShuffleBlocks() {
    let i, k = 1;
    let disblk;
    while (k > 0) {
        findNotShuffledPair();
        k = disOrder.length;
        if(k === 0) {
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
	const files = selectimg.files;
	if(files.length !== 0) {
		let reader = new FileReader();
		reader.readAsDataURL(files[0]);	
		reader.onload = function(event){
			let image = new Image(); //新建一个img标签(还没嵌入DOM节点)	
			image.src =event.target.result;	
			image.onload = function() {	
				let canvas = document.createElement('canvas');
				let context = canvas.getContext('2d');
				let cr = getCompressRatio(image.width, image.height)
				let imageWidth = image.width / cr;	//压缩后图片的大小	
				let imageHeight = image.height / cr;
				data = '';

				canvas.width = imageWidth;	
				canvas .height= imageHeight;	

				context.drawImage(image, 0, 0, imageWidth, imageHeight);
				data = canvas.toDataURL('image/jpeg');

				//压缩完成显示到缩略图中
				imagebt.src = data;	
				}
			}
	}	
}

//计算合适的压缩率
function getCompressRatio(img_w, img_h) {
	let ra = 1, rz = 1, ratio = 1;

	if(img_w < img_h) {
		if(img_w > w_min || img_h > w_max) {
			ra = img_w / w_min;
			rz = img_h / w_max;
		}
	} else {
		if(img_h > w_min || img_w > w_max) {
			ra = img_h / w_min;
			rz = img_w / w_max;
		}
	}

	ratio = ra < rz ? ra : rz;
	return ratio;
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