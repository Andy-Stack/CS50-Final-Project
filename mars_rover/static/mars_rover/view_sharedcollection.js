var img_array = [];

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#nav-sharedCollections').classList.add("active");
    
    //prepare images for slide show
    document.querySelectorAll('.slide-thumb-img').forEach((img) => {
        tmp_img = new Image();
        tmp_img.src = img.src;
        tmp_img.id = img.id;
        img_array.push(tmp_img);
    })
});

//----- button functions -----
//like button
$(document).on('click','#like', () => {
    send_request("like");
})

//----- ajax request function -----
function send_request(requestType) {
    const request = new XMLHttpRequest();
    request.open('POST', `/sharedcollections/${collection_id}`);
    request.setRequestHeader("X-CSRFToken", csrf_token);

    request.onload = () => {
        const response = JSON.parse(request.responseText);
        switch(response.response_type) {
            case "like":
                response.success ? liked() : alert_modal("Error", response.message)
                break;
            default:
                return;
        }
    }
    const data = new FormData();
    data.append('request_type', requestType);
    request.send(data);
}


//----- utility functions -----
function liked() {
    document.querySelector('#like').classList.remove('btn-outline-primary');
    document.querySelector('#like').classList.add('btn-primary');
    document.querySelector('#like').setAttribute('disabled','true');
    document.querySelector('.d-none').classList.remove('d-none');
    like_count = parseInt(document.querySelector('#like-count').innerHTML);
    document.querySelector('#like-count').innerHTML = like_count + 1;
}


//----- alert modals -----
function alert_modal(alertName, alertBody) {
    document.querySelector('#alertModalLongTitle').innerHTML = alertName;
    document.querySelector('#alertBody').innerHTML = alertBody;
    $('#alertModal').modal();
}


//----- Slide show ----- 
//(img_array will contain correct dom images and in order alreaady)

//start slide show button
$(document).on('click','#slide-show-btn', () => {
    setup_slideshow();
    document.querySelector('#slide-back').classList.remove("fadeOutSlide");
    document.querySelector('#slide-back').classList.add("fadeInSlide");
    document.querySelector('#slide-back').style.display = "block";
    document.querySelector('body').style.overflow = "hidden";
})
//close slide show
$(document).on('click','.close-slide-show', () => {
    clearInterval(playslides);
    document.querySelector('#slide-back').classList.remove("fadeInSlide");
    document.querySelector('#slide-back').classList.add("fadeOutSlide");
    setTimeout(function(){document.querySelector('#slide-back').style.display = "none";}, 2000);
    document.querySelector('body').style.overflow = "auto";
})
//puts required images into slideshow
function setup_slideshow() {
    slide_count = img_array.length;
    current_slide_index = 0;
    set_current_slide(img_array[0].src);
    play();
}
//changes current slide
function set_current_slide(src) {
    document.querySelector('#current-slide').src = src;

}
//looks for next slide and calls set current slide
function next() {
    clearInterval(playslides);
    playslides = setInterval(next, 5000);
    if (current_slide_index < slide_count - 1) {
        current_slide_index++;
        set_current_slide(img_array[current_slide_index].src);
    }
    else {
        current_slide_index = 0;
        set_current_slide(img_array[current_slide_index].src);
    }
}
//looks for previous slide and calls set current slide
function previous() {
    clearInterval(playslides);
    playslides = setInterval(next, 5000);
    if (current_slide_index > 0) {
        current_slide_index--;
        set_current_slide(img_array[current_slide_index].src);
    }
    else {
        current_slide_index = slide_count - 1;
        set_current_slide(img_array[current_slide_index].src);
    }
}
function pause() {
    clearInterval(playslides);
    document.querySelector('#pause').style.display = "none";
    document.querySelector('#play').style.display = "block";
    document.querySelector('#paused').style.opacity = 1;
    setTimeout(function(){document.querySelector('#paused').style.opacity = 0;}, 2000);
}
function play() {
    playslides = setInterval(next, 5000);
    document.querySelector('#play').style.display = "none";
    document.querySelector('#pause').style.display = "block";
}
//change current image on slide show thumbnail click
$(document).on('click','.slide-thumb-img', (event) => {
    clearInterval(playslides);
    playslides = setInterval(next, 5000);
    set_current_slide(event.target.src);
});