from .models import Collection, Shared_Collection, Url, Col_Url
from django.db.models import F
import requests
import json
import environ

default_thumbnail = "https://www.belilelangtebus.com/images/foto_header/blank-thumbnail.jpg"

#functions for 'usercollections'
def load_collections(user):
    # only retrieve upto the first 9 collections
    collection_count = Collection.objects.filter(user=user).count()
    user_collections = Collection.objects.filter(user=user)[:9].values('id', 'title', 'thumbnail', 'likes')
    context = {"title": "Collections", "user_collections": user_collections, "collection_count": collection_count}
    return context

def delete_collection(col_to_del):
    try:
        Collection.objects.filter(id=col_to_del).delete()
        context = {"response_type": "delete", "success": True}
    except:
        context = {"response_type": "delete", "success": False,
                   "message": "An error occurred while deleting the collection."}
    return context

def load_more_collections(user, offset):
    # retrieve up to next 9 collections
    more_collections = Collection.objects.filter(user=user)[offset:offset + 9].values('id', 'title', 'thumbnail', 'likes')
    returned_count = more_collections.count()
    context = {"response_type": "load_more", "more_collections": list(more_collections),
               "returned_count": returned_count}
    return context

def create_new_collection(user, name, description):
    if Collection.objects.filter(title=name).exists():
        context = {"response_type": "new", "success": False,
                   "message": f"You already have a collection called '{name}'."}
        return context
    try:
        new = Collection(user=user, title=name, description=description)
        new.save()
        context = {"response_type": "new", "success": True, "id": new.id, "title": new.title,
                   "thumbnail": new.thumbnail, "likes": new.likes}
    except:
        context = {"response_type": "new", "success": False,
                   "message": "An error occurred while creating the collection."}
    return context


#functions for 'mars_images'
def get_collection_list(user):
    col_list = Collection.objects.filter(user=user).values('id', 'title').order_by('-id')
    context = {"response_type": "get_collection_list", "col_list": list(col_list)}
    return context

def add_to_collection(user, collectionID, url):
    try:
        collection = Collection.objects.get(id=collectionID)
    except:
        context = {"response_type": "add_to_collection", "success": False,
                   "message": "An error occurred while accessing the collection."}
        return context
    #check if relation between this collection and this url already exists
    if (collection.urls.filter(url=url).exists()):
        context = {"response_type": "add_to_collection", "success": False,
                   "message": "Picture already in collection."}
        return context
    #add url to database if it doesnt already exist
    if not Url.objects.filter(url=url).exists():
        try:
            new_url = Url(url=url)
            new_url.save()
        except:
            context = {"response_type": "add_to_collection", "success": False,
                       "message": "Unable to add picture to database."}
            return context
    else:
        new_url = Url.objects.get(url=url)
    #add url to collection urls (create relation)
    try:
        url_order = collection.urls.count()
        collection.urls.add(new_url, through_defaults={'url_order': url_order})
        context = {"response_type": "add_to_collection", "success": True,
                   "message": "Image added to the collection."}
    except:
        context = {"response_type": "add_to_collection", "success": False,
                   "message": "An error occurred while adding the image to the collection."}
    return context

def api_request(rover, date, camera):
    #access api key from environment variable
    env = environ.Env()
    environ.Env.read_env()
    API_KEY = env("API_KEY")
    #send api request
    new_request = f'https://api.nasa.gov/mars-photos/api/v1/rovers/{rover}/photos?earth_date={date}&camera={camera}&page=1&api_key={API_KEY}'
    response = requests.get(new_request)
    if response.status_code == 200:
        context = {"response_type": "api_request", "success": True, "response": response.json()}
    else:
        message = "An error occurred while fetching results."
        context = {"response_type": "api_request", "success": False, "message": message}
    return context

#functions for 'edit'
def update_title(collection_id, title):
    if Collection.objects.filter(title=title).exists():
        context = {"response_type": "title", "success": False,
                   "message": f"You already have a collection called '{title}'."}
        return context
    try:
        Collection.objects.filter(id=collection_id).update(title=title)
        context = {"response_type": "title", "success": True, "message": "Collection title has been updated."}
    except:
        context = {"response_type": "title", "success": False,
                   "message": "An error occurred while updating the title."}
    return context

def update_desc(collection_id, desc):
    try:
        Collection.objects.filter(id=collection_id).update(description=desc)
        context = {"response_type": "desc", "success": True, "message": "Collection description has been updated."}
    except:
        context = {"response_type": "desc", "success": False,
                   "message": "An error occurred while updating the description."}
    return context

def toggle_share(collection_id):
    try:
        collection = Collection.objects.get(id=collection_id)
        #check whether the collection has a thumbnail, description, title and at least one image
        no_thumbnail = collection.thumbnail == default_thumbnail
        no_description = not collection.description
        no_title = not collection.title
        no_images = collection.urls.count() == 0

        if collection.shared == True:
            collection.shared = False
            Shared_Collection.objects.filter(collection=collection).delete()
            message = "Your collection is now private."
        else:
            if no_thumbnail or no_description or no_title or no_images:
                message = """Please ensure your collection has a title, description, thumbnail and 
                at least one image before sharing."""
                context = {"response_type": "toggle_share", "success": False, "message": message}
                return context
            else:
                collection.shared = True
                share_collection = Shared_Collection(collection=collection)
                share_collection.save()
                message = "Your collection has been shared!"
        collection.save()
        context = {"response_type": "toggle_share", "success": True, "message": message}
    except:
        context = {"response_type": "toggle_share", "success": False,
                   "message": "An error occurred while changing shared status."}
    return context

def change_thumb(collection_id, url):
    try:
        if url == default_thumbnail and Collection.objects.get(id=collection_id).shared:
            context = {"response_type": "change_thumb", "success": False,
                       "message": """You can only remove the thumbnail of a private collection. Change your collection 
                       shared status on the share tab."""}
        else:
            Collection.objects.filter(id=collection_id).update(thumbnail=url)
            context = {"response_type": "change_thumb", "success": True, "message": url}
    except:
        context = {"response_type": "change_thumb", "success": False,
                   "message": "An error occurred while updating the collection thumbnail."}
    return context

def url_delete(collection_id, url_id):
    try:
        collection = Collection.objects.get(id=collection_id)
        if collection.urls.count() <= 1 and collection.shared:
            context = {"response_type": "url_delete", "success": False,
                   "message": """A shared collection must have at least one image. Change your collection shared status
                   on the share tab to remove the last image."""}
            return context
        url = Url.objects.get(id=url_id)
        url_position = Col_Url.objects.get(collection=collection, url=url).url_order
    except:
        context = {"response_type": "url_delete", "success": False,
                   "message": "An error occurred while accessing collection information."}
        return context
    try:
        collection.urls.remove(url)
        #get records that are related to the collection and have a url order greater than the url that will be removed
        #decrement the url order of these records
        Col_Url.objects.filter(collection=collection, url_order__gt=url_position).update(url_order=F('url_order')-1)
    except:
        context = {"response_type": "url_delete", "success": False,
                   "message": "An error occurred while removing the image from the collection."}
        return context
    context = {"response_type": "url_delete", "success": True, "url_id": url_id}
    return context

def save_order(collection_id, new_col_order):
    try:
        new_col_order = json.loads(new_col_order)
        #for each id in new_col_order, update the relation table urls(url order) related to the collection
        #with the position of the id in new_col_order
        for pos, val  in enumerate(new_col_order):
            Col_Url.objects.filter(collection__pk=collection_id, url__pk=val["id"]).update(url_order=pos)
        context = {"response_type": "save_order", "success": True, "message": "Collection order updated."}
    except:
        context = {"response_type": "save_order", "success": False,
                   "message": "An error occurred while updating the collection order"}
    return context


#functions for 'sharedcollections'
def load_popular_results(initial_load):
    result_count = Shared_Collection.objects.all().count()
    if initial_load:
        collection_results = Shared_Collection.objects.all().order_by("-collection__likes")[:10]
        context = {"collection_results": collection_results, "result_count": result_count}
    else:
        collection_results = Shared_Collection.objects.all().order_by("-collection__likes")[:10] \
            .values('collection__id','collection__title','collection__description',
                    'collection__thumbnail','collection__likes')
        context = {"title": "Shared Collections", "response_type": "load_popular",
                   "collection_results": list(collection_results), "result_count": result_count}
    return context

def load_more_results(offset, search_query, search_popular):
    # check if loading more search results (string) or popular results (none/null)
    if search_popular == "true": #popular
        more_results = Shared_Collection.objects.all().order_by("-collection__likes")[offset:offset + 10] \
            .values('collection__id','collection__title','collection__description',
                    'collection__thumbnail','collection__likes')
        context = {"response_type": "load_more_results", "more_results": list(more_results)}
    else: #search query
        more_results = list(get_query_results(search_query, offset, True))
        context = {"response_type": "load_more_results", "more_results": more_results}
    return context

def load_results(search_query):
    query_info = get_query_results(search_query, 0, False)
    search_results = list(query_info["results"])
    result_count = query_info["result_count"]
    context = {"response_type": "load_results", "search_results": search_results, "result_count": result_count}
    return context

def get_query_results(search_query, offset, loading_more):
    # split search query in case there are multiple words
    query_terms = search_query.split()
    # retrieve a list of shared collection titles
    title_list = Shared_Collection.objects.values_list('collection__title', flat=True)
    # for each shared cllectino title, see if each query term is a substring
    title_results = [s for s in title_list if any(xs.lower() in s.lower() for xs in query_terms)]
    # convert to dictionary and back to list to remove duplicate titles
    title_results_list = list(dict.fromkeys(title_results))
    # query for title list (these are the search results)
    results = Shared_Collection.objects.filter(collection__title__in=title_results_list) \
                  .order_by("-collection__creation_date")[offset:offset + 10] \
        .values('collection__id', 'collection__title', 'collection__description',
                'collection__thumbnail', 'collection__likes')
    if not loading_more:
        result_count = Shared_Collection.objects.filter(collection__title__in=title_results_list).count()
        return {"results": results, "result_count": result_count}
    return results


#view shared collection page
def like_collection(user, collection_id):
    try:
        Collection.objects.filter(id=collection_id).update(likes=F('likes') + 1)
        Shared_Collection.objects.get(collection__pk=collection_id).liked_by.add(user)
        context = {"response_type": "like", "success": True}
    except:
        context = {"response_type": "like", "success": False,
                   "message": "An error occurred while liking the collection."}
    return context