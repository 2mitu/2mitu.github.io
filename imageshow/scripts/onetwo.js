// 按键
// 	方向键 左/右，用于显示前一张/后一张
// 	数字键 1、2 用于选择左图、右图， 默认选1
// 缩放 选中的图片
// 	使用方向键上和下进行放大和缩小
// 	或者按住Z键，鼠标指针移动到图片上，使用滚轮进行放大缩小
// 移动 选中的图片
// 	按住C键，方向键上、下、左、右进行相应方向的移动
// 	或者按住C键，鼠标指针点击图片上希望显示的中心点
// 标记删除 选中的图片
// 	D 键 或者 鼠标点击“标记删除” 按钮

var showtwo = false;
var showkeep = true;
var showdiscard = true;
var img1_do = true;
var img2_do = false;
var pressed_c = false;
var pressed_z = false;
var imglist = new Array();
var imgdel = new Array();
var imgurl = new Array();
var dirname = "";
var curimg = 0;
var sndimg = 0;
var maxRatio = 2;
var imgarea_w = 0;
var imgarea_h = 0;
var menu_w = 130;
var checkbox_h = 160;
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
	evt.target.blur();
	image1.focus();
}

function getImages(evt) {
	let getnew = false;
	for (let f of getfolder.files) {
		if (f.type.indexOf("image")!=-1 || f.name.indexOf(".HEIC")!=-1) {
			if (!getnew) {
				imglist.length = 0;
				imgdel.length = 0;
				imgurl.length = 0;
				curimg = 0;
				getnew = true;
			}
			imglist.push(f);
			imgdel.push(false);
			imgurl.push(null);
		}
	}
	if (getnew) {
		let nlen = imglist[0].name.length;
		let plen = imglist[0].webkitRelativePath.length;
		let dlen = plen - nlen - 1;
		dirname = imglist[0].webkitRelativePath.slice(0, dlen);
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
		image1.style['transform'] = "none";
		image2.style['transform'] = "none";
		showImageAutoFit();
	}
}

function showNextImage() {
	if (imglist.length > 1) {
		curimg = getImageIndex(curimg, 1);
		image1.style['transform'] = "none";
		image2.style['transform'] = "none";
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
	calculateImageDisplayRatio(img, false);
	img.rotated = false;
	img.cx = 0.5;
	img.cy = 0.5;
	img.autofit = true;
	img.title += '\nImage size: ' + img.naturalWidth + " x " + img.naturalHeight;
}

function calculateImageDisplayRatio(img) {
	let nh = img.naturalHeight;
    let nw = img.naturalWidth;

	if (img.rotated) {
		nh = img.naturalWidth;
		nw = img.naturalHeight;
	}
	
    let ch = img.parentElement.clientHeight;
    let cw = img.parentElement.clientWidth;
	
	let rh = Math.round(1000 * ch / nh) / 1000;
	let rw = Math.round(1000 * cw / nw) / 1000;
    if ( nh <= ch && nw <= cw) {
        img.rmin = 1;
    } else {
	    img.rmin = Math.min(rh, rw);
    }
	img.ratio = img.rmin;
}	

function displayImageAutoFitSize(img, imgnum) {
	let imgf = imglist[imgnum];
    let ctn = img.parentElement;
	ctn.style['justify-content'] = 'center';
	ctn.style['align-items'] = 'center';
	img.style['object-fit'] = 'scale-down';
	img.style['max-width'] = '100%';
	img.style['max-height'] = '100%';
	img.style.width = 'auto';
	img.style.height = 'auto';
	if (imgurl[imgnum] != null){
		img.src = imgurl[imgnum];
	} else {
		if (imgf.type.indexOf("image")!=-1) {
			img.src = URL.createObjectURL(imgf);
			imgurl[imgnum] = img.src;
		} else if (imgf.name.indexOf(".HEIC")!=-1) {
			img.src = null;
			getHeicImageUrl(img, imgf, imgnum);
		};
	}
	img.style.left = 'auto';
	img.style.top = 'auto';
	img.style["transform-origin"] = "center";
	img.style['transform'] = "none";
	img.rotated = false;
    img.title = imgf.webkitRelativePath + "\nFile size: " + imgf.size + " bytes";
}

async function getHeicImageUrl(imgobj, fimg, inum) {
	// 转换 HEIC 为 JPEG
	imgobj.alt = "Loding HEIC image...";
	try {
		const convertedBlob = await heic2any({
		blob: fimg,
		toType: 'image/jpeg',
		quality: 0.8 // 质量参数（0-1）
		});
		// 生成临时 URL 并显示
		imgobj.src = URL.createObjectURL(convertedBlob);
		imgurl[inum] = imgobj.src;
		imgobj.alt = '';
	} catch (error) {
		imgobj.alt = `转换失败: ${error.message}`;
	} 
}

function showImageByRatio(img, ratio) {
	let ctn = img.parentElement;
	ctn.style['justify-content'] = 'flex-start';
	ctn.style['align-items'] = 'flex-start';
	img.style['object-fit'] = 'contain';
	img.style['max-width'] = 'none';
	img.style['max-height'] = 'none';
	let imgw = Math.floor(img.naturalWidth * ratio);
	let imgh = Math.floor(img.naturalHeight * ratio);
	let cleft = img.cx * imgw;
	let ctop = img.cy * imgh;
	img.style.width = imgw + 'px';
	img.style.height = imgh + 'px';
	img.style.left = Math.floor(ctn.clientWidth / 2 - cleft) + 'px';
	img.style.top = Math.floor(ctn.clientHeight / 2 - ctop) + 'px';
	img.ratio = ratio;
    img.autofit = false;
	if (img.rotated) {
		img.style["transform-origin"] = cleft + "px " + ctop + "px";
	}
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
	} 
}

function processKeyUp(evt) {
    let kval = evt.keyCode;
	if (kval === 67) {
		pressed_c = false;
	} else if (kval === 49) {
		// select #1 Image
        	img1_do = true;
			img2_do = false;
	} else if (kval === 50) {
		if (showtwo) {
			// select #2 Image
        	img2_do = true;
			img1_do = false;
		}
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
	} else if (evt.keyCode === 82) {
        //旋转图片
		if (evt.shiftKey) {
			rotateSelectedImage(-90);
		} else {
			rotateSelectedImage(90);
		}			
	}
	
}

function rotateSelectedImage(dgr) {
	let img = null;
	if (img1_do) {
		img = image1;
	} else if (img2_do) {
		img = image2;
	}
	if (img) {
		img.style['transform'] = "rotate(" + dgr + "deg)";
		img.rotated = true;
		img.dgr = dgr;
		calculateImageDisplayRatio(img);
		showImageByRatio(img, img.rmin);
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


function changeImageCenter(img, todrt) {
    let ncx = img.cx;
    let ncy = img.cy;
	let drt = todrt;
	if (img.rotated) {
		if (img.dgr == 90) {
			drt = todrt - 1;
			if (drt == 36) {
				drt = 40
			}
		} else if (img.dgr == -90) {
			drt = todrt +1;
			if (drt == 41) {
				drt = 37
			}
		}
	}
	
    if (drt === 37) {
        ncx = changePercent(ncx, true);
    } else if (drt === 38) {
        ncy = changePercent(ncy, true);
    } else if (drt === 39) {
        ncx = changePercent(ncx, false);
    } else if (drt === 40) {
        ncy = changePercent(ncy, false);
    } 
   	moveImage(img, ncx, ncy);
}

function changeDisplayCenter(evt) {
    let img = evt.target
	if (pressed_c && !img.autofit) {
	    let ncx = Math.round(1000 * evt.offsetX / img.offsetWidth) / 1000;
    	let ncy = Math.round(1000 * evt.offsetY / img.offsetHeight) / 1000;
    	moveImage(img, ncx, ncy);
    }
}

function moveImage(img, cx, cy) {
	let dw = img.offsetWidth;
	let dh = img.offsetHeight;
	let pw = img.parentElement.clientWidth;
	let ph = img.parentElement.clientHeight;
	
    let nx = Math.round(cx * dw);
    let ny = Math.round(cy * dh);
   	let n_left = Math.ceil(pw / 2) - nx;
    let n_top = Math.ceil(ph / 2) - ny;
	
	let valid_left = n_left < pw/3 && n_left > (2*pw/3 - dw);
	let valid_top = n_top < ph/3 && n_top > (2*ph/3 - dh);
	if (valid_left && valid_top) {
		img.style.left = n_left + 'px ';
		img.style.top = n_top + 'px ';
		img.cx = cx;
		img.cy = cy;
		if (img.rotated) {
			img.style["transform-origin"] = nx + "px " + ny + "px";
		}
	}
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
		img1_do = true;
		img2_do = false;
	}
	image1.style['transform'] = "none";
	image2.style['transform'] = "none";
	setImageAreaSize(showtwo);
	showImageAutoFit();
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
	let delfn = "delete_" + dirname + ".sh";
	let delinfo = "#Following files will be deleted";
	if (OS_win) {
		nextline = '\r\n';
		del_cmd = 'del "';
		delfn = "delete_" + dirname + ".cmd";
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
