var img_array = []; //array is an ordered collection
var slide_count = 0;
var current_slide_index = 0;

document.addEventListener('DOMContentLoaded', () => {
    //fill img array with collction images from dom
    get_images();
    document.querySelector('#nav-myCollections').classList.add("active");

    //----- button functions (on dom content loaded) -----

    document.querySelector('#update-title').onclick = () => {
        const title = document.querySelector('#col_title').value;
        if (title.trim() != "") {send_request("title", title);}
        else {alert_modal("Error", "Please enter a title.");}
    }
    document.querySelector('#update-desc').onclick = () => {
        const desc = document.querySelector('#col_desc').value.trim();
        send_request("desc", desc);
    }
    document.querySelector('#share-btn').onclick = (event) => {
        if (event.target.innerHTML == "Share Collection") {
            confirm_modal("Confirm", "Are you sure you want to share this collection?<br><small class='text-muted'>You can undo this action later.</small>", "Share Collection", "btn btn-primary", "toggle_share");
        }
        else {
            confirm_modal("Confirm", "Are you sure you want to make this collection private?<br><small class='text-muted'>You can undo this action later.</small>", "Make Collection Private", "btn btn-primary", "toggle_share");
        }
    }
    document.querySelector('#remove-thumb').onclick = () => {
        const url = "https://www.belilelangtebus.com/images/foto_header/blank-thumbnail.jpg";
        send_request("change_thumb", url);
    }
})


//----- button functions -----

//confirmation modal confirm button
$(document).on('click','#confirm', (event) => {
    //check what is being confirmed
    switch(event.target.dataset.purpose) {
        case "toggle_share":
            send_request("toggle_share");
            break;
        default:
            return;
    }
});
//delete image button
$(document).on('click','.url-delete', (event) => {
    //look for image id of previous sibling as images can be swapped around
    send_request("url_delete", event.target.previousElementSibling.id.slice(3));
})
//choose thumbnail (double click image)
$(document).on('dblclick','.img-dbclick', (event) => {
    send_request("change_thumb", event.target.src);
})
//save the new order of dom images to database
$(document).on('click','#save_order', () => {
    get_images();
    const new_col_order = extract_id();
    send_request("save_order", new_col_order);
})


//----- ajax request function -----

function send_request(requestType) {
    const request = new XMLHttpRequest();
    request.open('POST', `/edit/${collection_id}`);
    request.setRequestHeader("X-CSRFToken", csrf_token);

    request.onload = () => {
        const response = JSON.parse(request.responseText);
        switch(response.response_type) {
            case "title":
                response.success ? alert_modal("Success", response.message) : alert_modal("Error", response.message);
                break;
            case "desc":
                response.success ? alert_modal("Success", response.message) : alert_modal("Error", response.message);
                break;
            case "toggle_share":
                if (response.success) {
                    alert_modal("Success", response.message);
                    shareBtn = document.querySelector('#share-btn')
                    shareBtn.innerHTML == "Share Collection" ? shareBtn.innerHTML = "Make Collection Private" : shareBtn.innerHTML = "Share Collection";
                }
                else {alert_modal("Error", response.message);}
                break;
            case "change_thumb":
                response.success ? change_thumb(response.message) : alert_modal("Error", response.message);
                break;
            case "url_delete":
                response.success ? delete_image(response.url_id) : alert_modal("Error", response.message);
                break;
            case "save_order":
                response.success ? alert_modal("Success", response.message) : alert_modal("Error", response.message);
                break;
            default:
                return;
        }
    }
    const data = new FormData();
    data.append('request_type', requestType);
    //action based on request type
    switch(requestType) {
        case "title":
            data.append('title', arguments[1]);
            break;
        case "desc":
            data.append('desc', arguments[1]);
            break;
        case "toggle_share":
            break;
        case "change_thumb":
            data.append('url', arguments[1]);
            break;
        case "url_delete":
            data.append('url_id', arguments[1]);
            break;
        case "save_order":
            data.append('new_col_order', arguments[1]);
            break;
        default:
            return;
    }
    request.send(data);
}


//----- Secondary Navigation -----

//change active nav link (secondary nav bar)
$(document).on('click','.secondary-nav', (event) => {
    $(".nav-link").removeClass("active");
    event.target.classList.add("active");
    nav_change(event.target.dataset.nav);

});
//change active nav div (secondary nav)
function nav_change(nav_div) {
    document.querySelector('#nav-desc-div').style.display = "none";
    document.querySelector('#nav-thumb-div').style.display = "none";
    document.querySelector('#nav-share-div').style.display = "none";
    document.querySelector(`#${nav_div}`).style.display = "block";
};


//----- swap collection image positions -----

function allowDrop(ev) {
    ev.preventDefault();
}
function drag(ev) {
    //get details of image being dragged
    ev.dataTransfer.setData("src", ev.target.src);
    ev.dataTransfer.setData("id", ev.target.id);
}
//swaps images and some attribute details
function drop(ev) {
    ev.preventDefault();
    //update dragged from
    document.querySelector(`#${ev.dataTransfer.getData("id")}`).src = ev.target.src;
    document.querySelector(`#${ev.dataTransfer.getData("id")}`).id = ev.target.id;
    //update dragged to
    ev.target.src = ev.dataTransfer.getData("src");
    ev.target.id = ev.dataTransfer.getData("id");
    get_images();
}


//----- utility functions -----

function change_thumb(url) {
    document.querySelectorAll('.col-thumb').forEach((img) => {
        img.src = url;
    })
}
//updates an array of the collection images in the dom (src,id)
function get_images() {
    img_array.length = 0;
    document.querySelectorAll('.col_img_urls').forEach((img) => {
        tmp_img = new Image();
        tmp_img.src = img.src;
        tmp_img.id = img.id;
        img_array.push(tmp_img);
    })
}
//remove collection image from dom
function delete_image(url_id) {
    const image = document.querySelector(`#url${url_id}`);
    //remove node that is two levels up
    image.parentNode.parentNode.classList.add('fadeOut');
    //let animation run before removing
    setTimeout(function(){
        image.parentNode.parentNode.remove()
        get_images()
        check_col_empty();}, 2000);
}
//if last image is removed, disable slideshow and save order buttons
function check_col_empty() {
    if (!img_array.length) {
        document.querySelector('#slide-show-btn').setAttribute("disabled",true);
        document.querySelector('#save_order').setAttribute("disabled",true);
    }
}

//returns the position number and id of the images in img_array
function extract_id() {
    const col_order = [];
    img_array.forEach((img) => {
        //slice to extract plain id
        col_order.push({id: img.id.slice(3)});
    });
    //return json ready for sending to server
    return JSON.stringify(col_order);
}


//----- alert modals -----

function alert_modal(alertName, alertBody) {
    document.querySelector('#alertModalLongTitle').innerHTML = alertName;
    document.querySelector('#alertBody').innerHTML = alertBody;
    $('#alertModal').modal();
}

function confirm_modal(confirmName, confirmBody, buttonText, buttonType, buttonPurpose) {
    document.querySelector('#confirmModalLongTitle').innerHTML = confirmName;
    document.querySelector('#confirmBody').innerHTML = confirmBody;
    document.querySelector('#confirm').innerHTML = buttonText;
    document.querySelector('#confirm').className = buttonType;
    document.querySelector('#confirm').dataset.purpose = buttonPurpose;
    $('#confirmModal').modal();
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
    document.querySelector('.slide-thumbs').innerHTML = "";
    img_array.forEach((img) => {
        const source = document.querySelector('#slidesTemplate').innerHTML;
        const template = Handlebars.compile(source);
        const context = {imageUrl: img.src};
        const html = template(context);
        document.querySelector('.slide-thumbs').innerHTML += html;
    })
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
