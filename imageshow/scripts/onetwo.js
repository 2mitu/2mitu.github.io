//键盘操作：
//按下方向键 左/右，将显示前一张/后一张。
//数字键1表示选择左图，数字键2表示选择右图

//放大和缩小:
//使用数字键1/2选择，使用方向键上和下进行放大和缩小；
//或者按下Z键，将鼠标指针移动到图片上，使用滚轮对该图片进行放大缩小；

//移动:先按下C键，
//按下数字键1/2，使用方向键上、下、左、右进行相应方向的移动；
//或者将鼠标指针移动到图片上某一点，此时按下鼠标左键将会把该点显示在视图中心；
var showtwo = false;
var showkeep = true;
var showdiscard = true;
var img1_do = false;
var img2_do = false;
var pressed_c = false;
var pressed_z = false;
var imglist = new Array();
var imgdel = new Array();
var curimg = 0;
var sndimg = 0;
var maxRatio = 2;
var imgarea_w = 0;
var imgarea_h = 0;
var menu_w = 120;
var checkbox_h = 170;
var URL = window.URL || window.webkitURL

//获取各个元素
const showtype = document.getElementsByName('interest');
const btshow = document.querySelector('#showtwo');
const imgarea1 = document.querySelector('#imgarea1');
const imgarea2 = document.querySelector('#imgarea2');
const image1 = document.querySelector('#img1');
const image2 = document.querySelector('#img2');
const mark1 = document.querySelector('#del1');
const mark2 = document.querySelector('#del2');
const btfolder = document.querySelector('#folder');
const getfolder = document.querySelector('#selectfolder');
const btprv = document.querySelector('#previous');
const btnext = document.querySelector('#next');
const imginfo = document.querySelector('#imgnum');
const btactsize = document.querySelector('#originalsize');
const btfitsize = document.querySelector('#autofit');
const btexport = document.querySelector('#export');
const btdelete = document.querySelector('#delete');

//监测浏览器大小改变
window.addEventListener('resize', browserResize);

//按键监测
document.addEventListener('keydown', processKeyDown);
document.addEventListener('keyup', processKeyUp);

//各元素添加事件
for (let st of showtype) {
	st.addEventListener('change', showTypeChanged);
}

btshow.addEventListener('change', showTwoOnClick);
btfolder.addEventListener('click', toSelectFolder);
getfolder.addEventListener('change', getImages);
btprv.addEventListener('click', showPreviousImage);
btnext.addEventListener('click', showNextImage);
image1.addEventListener('click', changeDisplayCenter);
image1.addEventListener('load', imageLoaded);
image2.addEventListener('click', changeDisplayCenter);
image2.addEventListener('load', imageLoaded);
image1.addEventListener('wheel', zoomImageByMouse);
image2.addEventListener('wheel', zoomImageByMouse);
btactsize.addEventListener('click', showImageActualSize);
btfitsize.addEventListener('click', showImageAutoFit);
btexport.addEventListener('click', exportDeletedFileInfo);
btdelete.addEventListener('click', changeSelectedImageDeleteStatus);

function toSelectFolder(evt) {
	evt.preventDefault();
	getfolder.click();
}

function showTypeChanged(evt) {
	st = evt.target.value;
	if (st == 'showall') {
		showkeep = true;
		showdiscard = true;
	} else if (st == 'keep') {
		showkeep = true;
		showdiscard = false;
	} else if (st == 'discard') {
		showkeep = false;
		showdiscard = true;
	}
}

function getImages(evt) {
	let getnew = false;
	for (let f of getfolder.files) {
		if (f.type.indexOf("image")!=-1 ) {
			if (!getnew) {
				imglist.length = 0;
				imgdel.length = 0;
				curimg = 0;
				getnew = true;
			}
		//	let imgsrc = URL.createObjectURL(f);
		//	imglist.push(imgsrc);
			imglist.push(f);
			imgdel.push(false);
		}
	}
	if (getnew) {
		showImageAutoFit();
	}
	//console.log('Image number:', imglist.length)
}

function showImageAutoFit() {
	if (imglist.length > 0) {
		displayImageAutoFitSize(image1, curimg);
		showDelMark(mark1, curimg);
		if (showtwo) {
			sndimg = getImageIndex(curimg, 1);
			displayImageAutoFitSize(image2, sndimg);
			showDelMark(mark2, sndimg);
		}
		imginfo.innerHTML = `${curimg + 1} / ${imglist.length}`;
	}
}

function showPreviousImage() {
	if (imglist.length > 1) {
		curimg = getImageIndex(curimg, -1);
		showImageAutoFit();
	}
}

function showNextImage() {
	if (imglist.length > 1) {
		curimg = getImageIndex(curimg, 1);
		showImageAutoFit();
	}
}

function getImageIndex(cur, delta) {
	let pos = cur;
	let findnext = true;
	do {
		pos += delta;
		if (delta > 0 && pos >= imglist.length) {
			pos = 0;
		} else if (delta < 0 && pos < 0) {
			pos = imglist.length - 1;
		}
		let forkeep = !imgdel[pos] && showkeep;
		let fordiscard = imgdel[pos] && showdiscard;
		if ( forkeep || fordiscard) {
			findnext = false;
		} else if (pos == cur) {
			findnext = false;
		}
	} while (findnext);
	return pos;
}

function imageLoaded(evt) {
	let img = evt.target;
	let nh = img.naturalHeight;
    let nw = img.naturalWidth;
	let ih = img.offsetHeight;
    let ch = img.parentElement.clientHeight;
    let cw = img.parentElement.clientWidth;
	let rh = Math.round(1000 * ih / nh) / 1000;
    if ( nh <= ch && nw <= cw) {
        img.rmin = 1;
    } else {
	    img.rmin = rh;
    }
	img.ratio = img.rmin;
	img.cx = 0.5;
	img.cy = 0.5;
	img.autofit = true;
    img.title += '\nImage Size: ' + nw + " x " + nh;
}

function displayImageAutoFitSize(image, imgnum) {
	let imgf = imglist[imgnum];
    let ctn = image.parentElement;
	ctn.style['justify-content'] = 'center';
	ctn.style['align-items'] = 'center';
	image.style['object-fit'] = 'scale-down';
	image.style['max-width'] = '100%';
	image.style['max-height'] = '100%';
	image.style.width = 'auto';
	image.style.height = 'auto';
	image.src = URL.createObjectURL(imgf);
	image.style.left = 'auto';
	image.style.top = 'auto';
    image.title = imgf.webkitRelativePath + "\nFile size: " + imgf.size + " bytes";
}

function showImageByRatio(image, ratio) {
	let ctn = image.parentElement;
	ctn.style['justify-content'] = 'flex-start';
	ctn.style['align-items'] = 'flex-start';
	image.style['object-fit'] = 'contain';
	image.style['max-width'] = 'none';
	image.style['max-height'] = 'none';
	let imgw = Math.floor(image.naturalWidth * ratio);
	let imgh = Math.floor(image.naturalHeight * ratio);
	let cleft = image.cx * imgw;
	let ctop = image.cy * imgh;
	image.style.width = imgw + 'px';
	image.style.height = imgh + 'px';
	image.style.left = Math.floor(ctn.clientWidth / 2 - cleft) + 'px';
	image.style.top = Math.floor(ctn.clientHeight / 2 - ctop) + 'px';
	image.ratio = ratio;
    image.autofit = false;
//	console.log("--------------------");
//	console.log("natural size:", image.naturalWidth, image.naturalHeight);
//	console.log("image left & top", image.style.left, image.style.top);
}

function showImageActualSize() {
	if (imglist.length > 0) {
		showImageByRatio(image1, 1);
		if (showtwo) {
			showImageByRatio(image2, 1);
		}
	}
}

function initDisplay() {
//	设置图像显示区域的大小
	imgarea_w = document.body.clientWidth - menu_w;
	imgarea_h = document.body.clientHeight;
	setImageAreaSize(showtwo);	
}

function browserResize() {
//	console.log("window inner:", window.innerWidth, window.innerHeight);
//	console.log("document.body:", document.body.clientWidth, document.body.clientHeight);
	initDisplay();
}

function setImageAreaSize(dual) {
	imgarea1.style['height']= imgarea_h + 'px';
	imgarea2.style['height']= imgarea_h + 'px';
	if (dual) {
		imgarea1.style['width']= Math.floor(imgarea_w / 2) + 'px';
		imgarea2.style['width']= Math.floor(imgarea_w / 2) + 'px';
	} else {
		imgarea1.style['width']= imgarea_w + 'px';
	}
}

function processKeyDown(evt) {
	// C=67, for change center point
	// Z=90, for zoom
	if (evt.keyCode === 67) {
        pressed_c = true;
	} else if (evt.keyCode === 90) {
        pressed_z = true;
	} else if (evt.keyCode === 49) {
        img1_do = true;
	} else if (evt.keyCode === 50) {
        img2_do = true;
	} 
}

function processKeyUp(evt) {
    let kval = evt.keyCode;
	if (kval === 67) {
		pressed_c = false;
	} else if (kval === 49) {
        	img1_do = false;
	} else if (kval === 50) {
        	img2_do = false;
	} else if (kval === 90) {
		pressed_z = false;
	} else if (kval === 37) {
        if (pressed_c ) {
            changeCenterByKey(kval);
        } else {
		    showPreviousImage();
        }
	} else if (kval === 39) {
        if (pressed_c ) {
            changeCenterByKey(kval);
        } else {
		    showNextImage();
        }
	} else if (kval === 38) {
        if (pressed_c ) {
            changeCenterByKey(kval);
        } else {
		zoomImageByKey(true);
        }
	} else if (kval === 40) {
        if (pressed_c ) {
            changeCenterByKey(kval);
        } else {
		zoomImageByKey(false);
	    } 
    } else if (evt.keyCode === 68) {
        //标记/取消 删除
		changeSelectedImageDeleteStatus(); 
	}
}

function changeCenterByKey(drt) {
	if (img1_do && !image1.autofit) {
        	changeImageCenter(image1, drt);
    	} else if (showtwo && img2_do && !image2.autofit) {
        	changeImageCenter(image2, drt);
    	}
}

function changeSelectedImageDeleteStatus() {
	if (img1_do) {
		imgdel[curimg] = !imgdel[curimg];
		showDelMark(mark1, curimg);
    } else if (showtwo && img2_do) {
		imgdel[sndimg] = !imgdel[sndimg];
		showDelMark(mark2, sndimg);
    }
}

function showDelMark(delmark, imgindex) {
	if (imgdel[imgindex]) {
		delmark.style['display']= 'flex';
	} else {
		delmark.style['display']= 'none';
	}	
}


function changeImageCenter(img, drt) {
    let ncx = img.cx;
    let ncy = img.cy;
    if (drt === 37) {
        ncx = changePercent(ncx, true);
    } else if (drt === 38) {
        ncy = changePercent(ncy, true);
    } else if (drt === 39) {
        ncx = changePercent(ncx, false);
    } else if (drt === 40) {
        ncy = changePercent(ncy, false);
    } 

    let nx = Math.round(ncx * img.offsetWidth);
    let ny = Math.round(ncy * img.offsetHeight);
   	let shift_x = Math.ceil(img.parentElement.clientWidth / 2 ) - nx;
    let shift_y = Math.ceil(img.parentElement.clientHeight / 2) - ny;
   	moveImage(img, shift_x, shift_y, ncx, ncy);
}

function changePercent(oldval, increase) {
    let val = oldval;
    if (increase) {
        val += 0.05;
        if (val > 1) {
            val = 0.095;
        }
    } else {
        val -= 0.05;
        if (val < 0) {
            val = 0.005;
        }
    }
    return val;
}

function zoomImageByKey(up) {
	if (img1_do) {
        zoomImage(image1, up);
    } else if (img2_do && showtwo) {
        zoomImage(image2, up);
    }
}

function showTwoOnClick(evt) {
	if ( evt.target.checked){
		imgarea2.style['display']= 'flex';
		showtwo = true;
	}else{
		imgarea2.style['display']= 'none';
		showtwo = false;
	}
	setImageAreaSize(showtwo);
	showImageAutoFit();
}



function changeDisplayCenter(evt) {
    let img = evt.target
	if (pressed_c && !img.autofit) {
	    let ncx = Math.round(1000 * evt.offsetX / img.offsetWidth) / 1000;
    	let ncy = Math.round(1000 * evt.offsetY / img.offsetHeight) / 1000;
    	let shift_x = Math.ceil(img.parentElement.clientWidth / 2 ) - evt.offsetX;
	    let shift_y = Math.ceil(img.parentElement.clientHeight / 2) - evt.offsetY;
    	moveImage(img, shift_x, shift_y, ncx, ncy);
    }
}

function moveImage(img, x, y, cx, cy) {
	img.style.left = x + 'px ';
	img.style.top = y + 'px ';
	img.cx = cx;
	img.cy = cy;
}



function zoomImageByMouse(evt) {
	if ( pressed_z ) {
		if (evt.deltaY > 0) {
		    zoomImage(evt.target, false);
		} else {
		    zoomImage(evt.target, true);
		}
    }
}

function zoomImage(img, tobig) {
	if ( img.ratio >= img.rmin && img.ratio <= maxRatio ) {
		let toratio = img.ratio;
		if (tobig) {
		    toratio += 0.11;
		} else {
		    toratio -= 0.09;
		}
		tr = Math.floor(10 * toratio) / 10;
		
        if (tr > maxRatio) {
			tr = maxRatio;
		}
		if (tr < img.rmin) {
			tr = img.rmin;
		}

        if (tr !== img.ratio) {
		    showImageByRatio(img, tr);
	    }
    }
}

function exportDeletedFileInfo(evt) {
	let OS_win = false;
	if (navigator.platform.indexOf("Win") > -1) {
		OS_win = true;
	}
	let nextline = '\n';
	let del_cmd = 'rm "';
	let delfn = "delete.sh";
	let delinfo = "#Following files will be deleted";
	if (OS_win) {
		nextline = '\r\n';
		del_cmd = 'del "';
		delfn = "delete.cmd";
		delinfo = "REM Following files will be deleted" + nextline + "chcp 65001";
	}
	
	let dn = 0;
	for (var i = 0; i < imglist.length; i++) {
		if (imgdel[i]) {
			let fn = imglist[i].webkitRelativePath;
			if (OS_win) {
					fn = fn.replaceAll('/', '\\');
			}			
			delinfo += nextline + del_cmd + fn + '"';
			dn += 1;
		}
	}
	if (dn > 0) {
		saveTextAsFile(delinfo, delfn);
	}
}


function saveTextAsFile(text, fileName) {
     const blob = new Blob([text], { type: 'text/plain' }); 
     const link = document.createElement('a'); 
     link.href = URL.createObjectURL(blob); 
     link.download = fileName; 
     link.click(); 
 }
	
window.onload = function() {
//	设置body和菜单的grid布局
	document.body.style['grid-template-colums'] =  '1fr ' + menu_w + 'px';
	document.querySelector('#div2').style['grid-template-rows'] = checkbox_h + 'px repeat(7, 1fr)';
//	初始化显示选项
	showtype[0].checked = true;
	btshow.checked = showtwo;
};


initDisplay();
