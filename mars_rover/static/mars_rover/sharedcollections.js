var search_popular = true;
var search_query= "";
var results_loaded = 0; //this is changed once dom content is loaded
//results_count declared in html file

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#nav-sharedCollections').classList.add("active");
    results_loaded = document.querySelector('#col-results').childElementCount;

    window.onscroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1) {
            //collection_count retrieved from linked html (django template varible)
            if (results_loaded < results_count) {
                document.querySelector('#spinner').style.display = "block";
                send_request("load_more_results", search_query, search_popular);
            }
        }
    }
    //search form
    document.querySelector('#search-form').onsubmit = () => {
        document.querySelector('#spinner').style.display = "block";
        document.querySelector('#col-results').innerHTML = "";
        search_query = document.querySelector('#search-query').value;
        send_request("load_results", search_query);
        return false;
    }
})

//----- button functions -----
$(document).on('click','#load-popular', () => {
    //load up to 10 shared collections (ordered by most likes)
    document.querySelector('#col-results').innerHTML = "";
    document.querySelector('#spinner').style.display = "block";
    search_query = "";
    send_request("load_popular");
})
//when a collection card is clicked
$(document).on('click','.card', (event) => {
    const id = event.currentTarget.getAttribute('data-colID');
    window.location.href = `/sharedcollections/${id}`;
})

//----- ajax request function -----

function send_request(requestType) {
    const request = new XMLHttpRequest();
    request.open('POST', '/sharedcollections');
    request.setRequestHeader("X-CSRFToken", csrf_token);

    request.onload = () => {
        const response = JSON.parse(request.responseText);
        switch(response.response_type) {
            case "load_more_results":
                load_more_results(response.more_results);
                break;
            case "load_popular":
                search_popular = true;
                load_popular(response.collection_results, response.result_count);
                break;
            case "load_results":
                search_popular = false;
                load_results(response.search_results, response.result_count)
                break;
            default:
                return;
        }
    }
    const data = new FormData();
    data.append('request_type', requestType);
    //action based on request type
    switch(requestType) {
        case "load_more_results":
            data.append('offset', results_loaded);
            data.append('search_query', arguments[1]);
            data.append('search_popular', arguments[2]);
            break;
        case "load_popular":
            break;
        case "load_results":
            data.append('search_query', arguments[1]);
            break;
        default:
            return;
    }
    request.send(data);
}

//----- utility functions -----
function load_popular(results, result_count){
    document.querySelector('#spinner').style.display = "none";
    if (results.length == 0) {
        document.querySelector('#col-results').innerHTML = '<div class="text-center"><p class="lead">No results found.</p></div>';
    }
    else {
        results_count = result_count;
        results_loaded = results.length;
        load_templates(results);
    }
}

function load_more_results(results) {
    document.querySelector('#spinner').style.display = "none";
    //do nothing if no results were returned
    if (results.length == 0) {return;}
    else {
        results_loaded += results.length;
        load_templates(results);
    }
}

function load_results(results, result_count) {
    document.querySelector('#spinner').style.display = "none";
    if (results.length == 0) {
        document.querySelector('#col-results').innerHTML = '<div class="text-center"><p class="lead">No results found.</p></div>';
    }
    else {
        results_count = result_count;
        results_loaded = results.length;
        load_templates(results);
    }
}
//use handlebars template to display fetched collections 
function load_templates(results) {
    results.forEach((result) => {
        const source = document.querySelector('#resultTemplate').innerHTML;
        const template = Handlebars.compile(source);
        const context = {title: result.collection__title, id: result.collection__id, 
                         thumbnail: result.collection__thumbnail, likes: result.collection__likes,
                         description: result.collection__description};
        const html = template(context);
        append_with_animation(html);
    })
}
//appendChild prevents flickering that '.innerhtml=' causes
function append_with_animation(html) {
    //convert handlebars template to node 
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    const node = wrapper.firstChild;
    document.querySelector('#col-results').appendChild(node);
}
