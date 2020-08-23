var current_chosen_img = "";
var collection_list = [];

document.addEventListener('DOMContentLoaded', () => {    
    document.querySelector('#nav-marsImages').classList.add("active");
    //retrieve user collections (id/titles) 
    send_request("get_collection_list");

    //form search (api query)
    document.querySelector('#marsImageForm').onsubmit = () => {
        const albumContent = document.querySelector('#albumContent');
        //clear any previous search results
        albumContent.innerHTML = "";
        document.querySelector('#spinner').style.display = "block";

        //retrieve data from form
        const select = document.querySelector('#id_rover_camera');
        const camera = select.options[select.selectedIndex].value;

        //get optgroup label that selected option is from 
        var rover = select.options[select.selectedIndex].parentNode.label;
        rover = rover.toLowerCase();
        const date = document.querySelector('#id_date').value;

        send_request("api_request",rover,date,camera);
        return false;
    }

    //add image to collection (choose collection form)
    document.querySelector('#chooseCollectionForm').onsubmit = (event) => {        
        const select = document.getElementById("collection-name-select");
        const col_id = select.options[select.selectedIndex].value;        
        send_request("add_to_collection", col_id, current_chosen_img);
        $('#chooseCollectionModal').modal('hide');
        event.target.reset();
        return false;
    }

    //close larger image modal
    document.querySelector('.close-modal').onclick = () => {
        document.querySelector('.imageModal').style.display = "none";
    }
});


//----- button functions -----
//help button
$(document).on('click','#formHelp', () => {
    alert_modal("Help", "The following mission dates may help if you are struggling to find any images.<br><br>&bull; Curiosity Rover: August 5, 2012 - Present<br>&bull; Opportunity Rover: January 25, 2004 - June 10, 2018<br>&bull; Spirit Rover: January 04, 2004 - May 25, 2011<br><br>Good luck exploring!");
});

//add to collection (button)
$(document).on('click','.img-add', (event) => {
    current_chosen_img = event.target.dataset.source;
    document.querySelector('#preview-img').src = current_chosen_img;
    choose_collection();
});

//opening and closing image modal (view larger image)
$(document).on('click','.img-view', (event) => {
    //access to clicked element through event.target
    document.querySelector('.image-modal-content').src = event.target.dataset.source;
    document.querySelector('.imageModal').style.display = "block";
    event.target.blur();
});


//----- ajax request function -----

function send_request(requestType) {
    const request = new XMLHttpRequest();
    request.open('POST', '/mars_images');
    request.setRequestHeader("X-CSRFToken", csrf_token);

    request.onload = () => {
        const response = JSON.parse(request.responseText);
        switch(response.response_type) {
            case "get_collection_list":
                prepare_selection(response.col_list);
                break;
            case "add_to_collection":
                response.success ? alert_modal("Success", response.message) : alert_modal("Error", response.message);
                break;
            case "api_request":
                document.querySelector('#spinner').style.display = "none";
                response.success ? handle_api_response(response.response) : alert_modal("Error", response.message);
                break;
            default:
                return;
        }
    }
    const data = new FormData();
    data.append('request_type', requestType);
    switch(requestType) {
        case "get_collection_list":
            break;
        case "add_to_collection":
            data.append('col_id', arguments[1]);
            data.append('img_url', arguments[2]);
            break;
        case "api_request":
            data.append('rover', arguments[1]);
            data.append('date', arguments[2]);
            data.append('camera', arguments[3]);
            break;
        default:
            return;
    }
    request.send(data);
}


//----- utility functions -----

function prepare_selection(col_list) {
    collection_list = col_list;
    const select = document.querySelector('#collection-name-select');
    col_list.forEach((col) => {
        const option = document.createElement('option');
        option.innerHTML = col.title;
        option.value = col.id;
        select.appendChild(option);
    })
}

function choose_collection() {
    collection_list.length ? $('#chooseCollectionModal').modal() : alert_modal("Error", "You don't have any collections to add images to. Create a collection on the <a href='/usercollections'>My Collections</a> page.");
}

//api request results
function handle_api_response(response) {
    if (response.photos.length < 1) {
        albumContent.innerHTML = '<p class="text-center mx-auto">No results found. <br> Try changing the date or rover/camera.</p>';
    }
    else {
        response.photos.forEach((result) => {
            //use handlebars template to insert into the page
            const source = document.querySelector('#resultTemplate').innerHTML;
            const template = Handlebars.compile(source);
            const context = {imageUrl: result.img_src};
            const html = template(context);
            albumContent.innerHTML += html;
        })
    }
}

function alert_modal(alertName, alertBody) {
    document.querySelector('#alertModalLongTitle').innerHTML = alertName;
    document.querySelector('#alertBody').innerHTML = alertBody;
    $('#alertModal').modal();
}