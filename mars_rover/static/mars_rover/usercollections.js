var collections_loaded = 0;
var col_to_del = ""; //tracks id of collection to be deleted

document.addEventListener('DOMContentLoaded', () => {    
    document.querySelector('#nav-myCollections').classList.add("active");
    collections_loaded = document.querySelector('#col-album').childElementCount;

    window.onscroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1) {
            //collection_count retrieved from linked html (django template varible)
            if (collections_loaded < collection_count) {
                document.querySelector('#spinner').style.display = "block";
                send_request("load_more");
            }
        }
    }

    //new collection form submit (modal opened with bootstrap)
    document.querySelector('#newCollectionForm').onsubmit = (event) => {
        const name = document.querySelector('#collection-name').value;
        const description = document.querySelector('#collection-description').value;
        send_request("new", name, description);
        $('#newCollectionModal').modal('hide');
        event.target.reset();
        return false;
    }
});


//----- button functions -----

//collection edit-share button
$(document).on('click','.col-edit-share', (event) => {
    const colID = event.target.dataset.col;
    window.location.href = `/edit/${colID}`;
});

//collection delete button
$(document).on('click','.col-delete', (event) => {
    //access to clicked element through event.target, retrieve dataset
    const colDetail = event.target.dataset.col.split(",");
    col_to_del = colDetail[0];
    //populate confirmation alert
    confirm_modal("Confirm Delete", `You are about to delete the following collection: <br> <span class="font-weight-bold">${colDetail[1]}</span>`, "Delete", "btn btn-danger", "delete");
});

//confirmation modal confirm button
$(document).on('click','#confirm', (event) => {
    //check what is being confirmed
    switch(event.target.dataset.purpose) {
        case "delete":
            send_request("delete");
            break;
        default:
            return;
    }
});


//----- ajax request function -----

function send_request(requestType) {
    const request = new XMLHttpRequest();
    request.open('POST', '/usercollections');
    request.setRequestHeader("X-CSRFToken", csrf_token);

    request.onload = () => {
        const response = JSON.parse(request.responseText);
        switch(response.response_type) {
            case "new":
                response.success ? add_collection(response.id,response.title,response.thumbnail,response.likes) : alert_modal("Error", response.message);
                break;
            case "delete":
                response.success ? delete_collection() : alert_modal("Error", response.message);
                break;
            case "load_more":
                load_more_collections(response.more_collections, response.returned_count);
                break;
            default:
                return;
        }
    }
    const data = new FormData();
    data.append('request_type', requestType);
    //action based on request type
    switch(requestType) {
        case "new":
            data.append('name', arguments[1]);
            data.append('description', arguments[2]);
            break;
        case "delete":
            data.append('col_to_del', col_to_del);
            break;
        case "load_more":
            data.append('offset', collections_loaded);
            break;
        default:
            return;
    }
    request.send(data);
}


//----- utility functions -----

function load_more_collections(collections, count) {
    //use handlebars template to display fetched collections 
    document.querySelector('#spinner').style.display = "none";
    //do nothing if no collections were returned
    if (count == 0) {return;}
    else {
        collections_loaded += count;
        collections.forEach((collection) => {
            const source = document.querySelector('#collectionTemplate').innerHTML;
            const template = Handlebars.compile(source);
            const context = {title: collection.title, id: collection.id, 
                             imageUrl: collection.thumbnail, likes: collection.likes};
            const html = template(context);
            append_with_animation(html);
        })
    }
}
//appendChild prevents flickering that '.innerhtml=' causes
function append_with_animation(html) {
    //convert handlebars template to node 
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    const node = wrapper.firstChild;
    document.querySelector('#col-album').appendChild(node);
}


function delete_collection() {
    //update variables used in collection load on scroll
    collections_loaded -= 1;
    collection_count -= 1;
    document.querySelector(`#del${col_to_del}`).classList.add('fadeOut');
    //let animation run before removing element
    setTimeout(function(){document.querySelector(`#del${col_to_del}`).remove()}, 2000);
    alert_modal("Success", "Collection deleted.");
}

function add_collection(id, title, thumbnail, likes) {
    //only add new collection to screen if all user collections are loaded
    if (collection_count != collections_loaded) {collection_count += 1;}
    else {
        collection_count += 1
        collections_loaded += 1;
        const source = document.querySelector('#collectionTemplate').innerHTML;
        const template = Handlebars.compile(source);
        const context = {title: title, id: id, imageUrl: thumbnail, likes: likes};
        const html = template(context);
        append_with_animation(html);
    }
    alert_modal("Success", "Your new collection has been created.");
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
