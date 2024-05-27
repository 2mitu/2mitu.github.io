var img_number = 2;
var img_index = -1;
var changecenter = false;
var ctrlpressed = false;
 
//获取各个元素
const imgbt = document.querySelector('#img_select');
const selectimg = document.querySelector('#selectimage');
const imgnumbt = document.querySelector('#img_number');
const imageview = document.querySelector('#image_area');
const imagelist = document.querySelector('#images');
const imgindex = document.querySelector('#img_index');
const bt_original = document.querySelector('#zoom_original');
const bt_fitW = document.querySelector('#zoom_fitwidth');
const bt_fitH = document.querySelector('#zoom_fitheight');
const bt_autofit = document.querySelector('#zoom_autofit');

//各元素添加事件
document.addEventListener('keydown', processKeyDown);
document.addEventListener('keyup', processKeyUp);

imgnumbt.addEventListener('change', changeImagesNumber);
imgbt.addEventListener('click', toSelectImage);
selectimg.addEventListener('change', getImages);
imgindex.addEventListener('change', changeImageIndex);
bt_original.addEventListener('click', zoomToOriginal);
bt_fitW.addEventListener('click', zoomToFitWidth);
bt_fitH.addEventListener('click', zoomToFitHeight);
bt_autofit.addEventListener('click', zoomToAutoFit);

showImageBlocks();

function processKeyDown(evt) {
    if (evt.keyCode === 17)
        ctrlpressed = true;
}

function processKeyUp(evt) {
    if (evt.keyCode === 17)
        ctrlpressed = false;
}

function zoomToOriginal() {
	let imgs = imagelist.children;
	if ( img_index === -1) {
		for (i=0; i<imgs.length; i++) 
            showOriginalImage(imgs[i]);
	}
	else
        showOriginalImage(imgs[img_index]);
}

function showOriginalImage(imgobj) {
	if (imgobj.hasimg) {
		calculateFitRatio(imgobj, 1);
		let posX = (imgobj.offsetWidth - imgobj.size[0]) / 2;
		let posY = (imgobj.offsetHeight - imgobj.size[1]) / 2;
		let p = Math.round(posX) + 'px ' + Math.round(posY) + 'px';
		let s = imgobj.size[0] + 'px ' + imgobj.size[1] + 'px';
		imgobj.style.backgroundPosition = p;
		imgobj.style.backgroundSize = s; 
		showZoomValue(imgobj);
	}
}

function zoomToFitWidth() {
	let imgs = imagelist.children;
	if ( img_index === -1) {
		for (i=0; i<imgs.length; i++) 
            showImageWidthFit(imgs[i]);
	}
	else
        showImageWidthFit(imgs[img_index]);
}

function zoomToFitHeight() {
	let imgs = imagelist.children;
	if ( img_index === -1) {
		for (i=0; i<imgs.length; i++) 
            showImageHeightFit(imgs[i]);
	}
	else
        showImageHeightFit(imgs[img_index]);
}

function showImageWidthFit(imgobj) {
	if (imgobj.hasimg) {
		calculateFitRatio(imgobj, 2);
		let sizeX = imgobj.offsetWidth;
		let sizeY = imgobj.size[1] / imgobj.ratio;
		let posX = 0;
		let posY = (imgobj.offsetHeight - sizeY) / 2;
		let s = Math.round(sizeX) + 'px ' + Math.round(sizeY) + 'px';
		let p = Math.round(posX) + 'px ' + Math.round(posY) + 'px';
		imgobj.style.backgroundSize = s
		imgobj.style.backgroundPosition = p;
		showZoomValue(imgobj);
	}
}

function showImageHeightFit(imgobj) {
	if (imgobj.hasimg) {
		calculateFitRatio(imgobj, 3);
		let sizeY = imgobj.offsetHeight;
		let sizeX = imgobj.size[0] / imgobj.ratio;
		let posY = 0;
		let posX = (imgobj.offsetWidth - sizeX) / 2;
		let s = Math.round(sizeX) + 'px ' + Math.round(sizeY) + 'px';
		let p = Math.round(posX) + 'px ' + Math.round(posY) + 'px';
		imgobj.style.backgroundSize = s
		imgobj.style.backgroundPosition = p;
		showZoomValue(imgobj);
	}
}

function zoomToAutoFit() {
	let imgs = imagelist.children;
	if ( img_index === -1) {
    	for (i=0; i<imgs.length; i++) 
            showImageAutoFit(imgs[i]);
    }
	else
        showImageAutoFit(imgs[img_index]);
}

function calculateFitRatio(imgobj, type) {
    let blkw = imgobj.offsetWidth;
    let blkh = imgobj.offsetHeight;
    let rx = imgobj.size[0] / blkw;
    let ry = imgobj.size[1] / blkh;
    let ratio;
    // 1:1 center
    if (type === 1) {
        ratio = 1
    }

    // Width Fit
    if (type === 2) {
        ratio = rx;
    }

    // Height Fit
    if (type === 3) {
        ratio = ry;
    }

    // Auto Fit
    if (type === 4) {
        if (rx > ry)
            ratio = rx;
        else 
            ratio = ry;
    }

    imgobj.ratio = ratio
    return ratio;
}

function showImageAutoFit(imgobj) {
	if (imgobj.hasimg) {    
		let r = calculateFitRatio(imgobj, 4);
		let sizeX, sizeY, posX, PosY;
		sizeX = imgobj.size[0] / r;
		sizeY = imgobj.size[1] / r;
		posX = (imgobj.offsetWidth - sizeX) / 2 ;
		posY = (imgobj.offsetHeight - sizeY) / 2;
		
		let s = Math.round(sizeX) + 'px ' + Math.round(sizeY) + 'px';
		let p = Math.round(posX) + 'px ' + Math.round(posY) + 'px';
		imgobj.style.backgroundSize = s
		imgobj.style.backgroundPosition = p;
		showZoomValue(imgobj);
	}
}

function showImageBlocks() {
	//Remove previous blocks
	while(imagelist.firstChild) {
		imagelist.removeChild(imagelist.firstChild);
	}

	//define block size
    let blk_w, blk_h;
	if (img_number === 4) {
		blk_w = Math.floor(imageview.clientWidth / 2);
		blk_h = Math.floor(imageview.clientHeight / 2);
	}
	else if (img_number === 6) {
		blk_w = Math.floor(imageview.clientWidth / 3);
		blk_h = Math.floor(imageview.clientHeight / 2);
	}
	else {
		blk_w = Math.floor(imageview.clientWidth / img_number);
		blk_h = imageview.clientHeight;		
	}

	//show blocks
	let block, blk, xpos, ypos;
	for(blk = 0; blk < img_number; blk++){
		block = document.createElement('li');
		block.id = blk;
        block.hasimg = false;
		block.style.width = blk_w + 'px';
		block.style.height = blk_h + 'px';
		block.style.backgroundRepeat = 'no-repeat';
		block.style.backgroundOrigin = 'border-box';
		block.addEventListener('click', clickedImage);
		block.addEventListener('wheel', zoomImageByMouse);
		imagelist.appendChild(block);	
	}
}

function clickedImage(evt) {
	if (ctrlpressed && evt.target.hasimg) {
        if (evt.target.ratio === -1)
            showImageAutoFit(evt.target);
		let pos = evt.target.style.backgroundPosition.split(' ');
		let shift_x = Math.ceil(evt.target.offsetWidth / 2 ) - evt.offsetX;
		let shift_y = Math.ceil(evt.target.offsetHeight / 2) - evt.offsetY;
        let posX = Number(pos[0].slice(0, -2)) + shift_x;
        let posY = Number(pos[1].slice(0, -2)) + shift_y;
        evt.target.style.backgroundPosition = posX + 'px ' + posY + 'px';
	}
}

function getImgBackgroundImagePosition(evt) {
    let pos_x, pos_y;
}

function calculateRatioDelta(imgobj, deltaY) {
    let showsize =  imgobj.style.backgroundSize.split(' ');
    let show_x = Number(showsize[0].slice(0, -2));
    let show_y = Number(showsize[1].slice(0, -2));

    let dlt;
    if (deltaY > 0) {
        dlt = imgobj.ratio / (1 - 0.1 * imgobj.ratio)  - imgobj.ratio;
        if (show_x <= 150 || show_y <= 150)
            dlt = -1;
	}
    else {
        dlt = imgobj.ratio / (1 + 0.1 * imgobj.ratio) - imgobj.ratio;
        if (imgobj.ratio < 0.34)
            dlt = -1;
	}
    return dlt;
}

function zoomImageByMouse(evt) {
    evt.preventDefault();
    if (ctrlpressed && evt.target.hasimg) {
        if (evt.target.ratio === -1)
            showImageAutoFit(evt.target);

        let delta = calculateRatioDelta(evt.target, evt.deltaY);

        if (delta !== -1) {
		    let ra = evt.target.ratio;
		    //let rz = Math.round(ra*10)/10 + delta;
			let rz = ra + delta;

			let pos = evt.target.style.backgroundPosition.split(' ');
		    
		    let sizeX = evt.target.size[0] / rz;
		    let sizeY = evt.target.size[1] / rz;
		    let posX = (Number(pos[0].slice(0, -2)) * ra +  evt.target.offsetWidth / 2 * delta) / rz;
		    let posY = (Number(pos[1].slice(0, -2)) * ra +  evt.target.offsetHeight / 2 * delta) / rz;
		    
			let s = Math.round(sizeX) + 'px ' + Math.round(sizeY) + 'px';
			let p = Math.round(posX) + 'px ' + Math.round(posY) + 'px';
			evt.target.style.backgroundSize = s
			evt.target.style.backgroundPosition = p;

		    evt.target.ratio = rz;
			showZoomValue(evt.target);
        }
    }
}

function showZoomValue(imgobj) {
	let zv = '  zoom:' + Math.round(100 / imgobj.ratio) + '%';
	imgobj.innerHTML = imgobj.imgname + zv;	
}


function changeImagesNumber(evt) {
	img_number = Number(evt.target.value);
	showImageBlocks();
}

function changeImageIndex(evt) {
	let index = Number(evt.target.value);
	if (index < img_number) {
		img_index = index;
	}
	else {
		img_index = img_number - 1;
	}
}

function toSelectImage(evt) {
	evt.preventDefault();
	selectimg.click();
}

function getImages(evt) {
	let files = selectimg.files;
	if (files.length >= 1) {
		let imgs = imagelist.children;
		if ( img_index === -1) {
			let fnum;
			if(files.length <= img_number) {
				fnum = files.length;
			}
			else {
				fnum = img_number;
			}

			for (i=0; i<fnum; i++) {
				updateBackroundImage(imgs[i], files[i]);
			}
		}
		else {		
			updateBackroundImage(imgs[img_index], files[0]);
		}
	}
}

function updateBackroundImage(imgobj, fname) {
	imgobj.furl = URL.createObjectURL(fname);
	imgobj.style.backgroundImage = 'url(' + imgobj.furl +  ')';
	imgobj.style.backgroundPosition = 'center';
	imgobj.style.backgroundSize = 'contain';
	imgobj.innerHTML = fname.name;
	imgobj.imgname = fname.name;
    imgobj.hasimg = true;
    imgobj.ratio = -1;
	getImageNaturalSize(imgobj);
}

function getImageNaturalSize(imgobj) {
	let image = new Image();
	image.src = imgobj.furl;
	image.onload = function() {
		imgobj.size = new Array(image.width, image.height);
	}
}
