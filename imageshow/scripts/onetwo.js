//键盘操作：
//按下方向键 左/右，将显示上一张/下一张。
//数字键1表示选择左图，数字键2表示选择右图

//放大和缩小:
//按下数字键1/2的情况下，使用方向键上和下进行放大和缩小；
//或者在按下Z键的情况下，将鼠标指针移动到图片上，使用鼠标的滚轮对该图片进行放大缩小；

//移动:按下C键的情况下，
//按下数字键1/2的情况下，使用方向键上、下、左、右进行相应方向的移动；
//或者将鼠标指针移动到图片上某一点，此时按下鼠标左键将会把该点显示在视图中心；
var showtwo = false;
var img1_do = false;
var img2_do = false;
var pressed_c = false;
var pressed_z = false;
var imglist = new Array();
var curimg = 0;
var maxRatio = 2;
var imgarea_w = 0;
var imgarea_h = 0;
var menu_w = 120;
var checkbox_h = 165;
var URL = window.URL || window.webkitURL

//获取各个元素
const btshow = document.querySelector('#showtwo');
const imgarea1 = document.querySelector('#imgarea1');
const imgarea2 = document.querySelector('#imgarea2');
const image1 = document.querySelector('#img1');
const image2 = document.querySelector('#img2');
const btfolder = document.querySelector('#folder');
const getfolder = document.querySelector('#selectfolder');
const btprv = document.querySelector('#previous');
const btnext = document.querySelector('#next');
const imginfo = document.querySelector('#imgnum');
const btactsize = document.querySelector('#originalsize');
const btfitsize = document.querySelector('#autofit');

//监测浏览器大小改变
window.addEventListener('resize', browserResize);

//按键监测
document.addEventListener('keydown', processKeyDown);
document.addEventListener('keyup', processKeyUp);

//各元素添加事件
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

function toSelectFolder(evt) {
	evt.preventDefault();
	getfolder.click();
}

function getImages(evt) {
	let getnew = false;
	for (let f of getfolder.files) {
		if (f.type.indexOf("image")!=-1 ) {
			if (!getnew) {
				imglist.length = 0;
				curimg = 0;
				getnew = true;
			}
		//	let imgsrc = URL.createObjectURL(f);
		//	imglist.push(imgsrc);
			imglist.push(f);
		}
	}
	if (getnew) {
		showImageAutoFit();
	}
	console.log('Image number:', imglist.length)
}

function showImageAutoFit() {
	if (imglist.length > 0) {
		displayImageAutoFitSize(image1, curimg);
		if (showtwo) {
			let sndimg = curimg + 1;
			if (sndimg >= imglist.length) {
				sndimg = 0;
			}	
			displayImageAutoFitSize(image2, sndimg);
		}
		imginfo.innerHTML = `${curimg + 1} / ${imglist.length}`;
	}
}

function showPreviousImage() {
	if (imglist.length > 1) {
		curimg -= 1;
		if (curimg < 0) {
			curimg = imglist.length - 1;
		}
		showImageAutoFit();
	}
}

function showNextImage() {
	if (imglist.length > 1) {
		curimg += 1;
		if (curimg >= imglist.length) {
			curimg = 0;
		}
		showImageAutoFit();
	}
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
    image.title = imgf.name + "\nFile size: " + imgf.size + " bytes";
}

function showImageByRatio(image, ratio) {
//	console.log("Zoome:", image.ratio, "-->",  ratio);
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
    }
}

function changeCenterByKey(drt) {
	if (img1_do && !image1.autofit) {
        	changeImageCenter(image1, drt);
    	} else if (showtwo && img2_do && !image2.autofit) {
        	changeImageCenter(image2, drt);
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
		    zoomImage(evt.target, true);
		} else {
		    zoomImage(evt.target, false);
		}
    }
}

function zoomImage(img, tobig) {
	if ( img.ratio >= img.rmin && img.ratio <= maxRatio ) {
		let toratio = img.ratio;
		if (tobig) {
		    toratio += 0.1;
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
	
window.onload = function() {
//	设置body和菜单的grid布局
	document.body.style['grid-template-colums'] =  '1fr ' + menu_w + 'px';
	document.querySelector('#div2').style['grid-template-rows'] = checkbox_h + 'px repeat(8, 1fr)';
//	初始化显示选项
	var checkboxes = document.querySelectorAll('input[type="checkbox"]');
	checkboxes.forEach(function(checkbox) {
	checkbox.checked = true;
	});
	btshow.checked = showtwo;
};


initDisplay();
