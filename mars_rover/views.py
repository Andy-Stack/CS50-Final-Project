from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.shortcuts import render, redirect
from django.urls import reverse
from .forms import Register, MarsImageSearch
from .models import Collection, Shared_Collection, Col_Url
from django.http import JsonResponse, Http404
from . import util

# Create your views here.

def home(request):
    context = {"title": "Home"}
    return render(request, "mars_rover/home.html", context)


def signin(request):
    if request.method == "POST":
        form = AuthenticationForm(request, request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password")
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect("usercollections")
        else:
            # form containing error information is returned
            context = {"title": "Sign In", "form": form}
            return render(request, "mars_rover/signin.html", context)
    else:
        if not request.user.is_authenticated:
            form = AuthenticationForm()
            context = {"title": "Sign In", "form": form}
            return render(request, "mars_rover/signin.html", context)
        return redirect("home")


def register(request):
    if request.method == "POST":
        #create form object with request data (POST data)
        form = Register(request.POST)
        if form.is_valid():
            form.save()
            #authenticate and log in user after successful registration.
            username = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password1")
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                context = {"title": "Success"}
                return render(request, "mars_rover/registered.html", context)
        else:
            #form containing error information is returned
            context = {"title": "Register", "form": form}
            return render(request, "mars_rover/register.html", context)
    else:
        if not request.user.is_authenticated:
            form = Register()
            context = {"title": "Register", "form": form}
            return render(request, "mars_rover/register.html", context)
        #if user is already authenticated, redirect to home page
        return redirect("home")


def logout_view(request):
    logout(request)
    return redirect("home")


def mars_images(request):
    if not request.user.is_authenticated:
        return redirect("signin")
    if request.method == "POST":
        if request.POST["request_type"] == "get_collection_list":
            context = util.get_collection_list(request.user)
            return JsonResponse(context)
        elif request.POST["request_type"] == "add_to_collection":
            context = util.add_to_collection(request.user, request.POST["col_id"], request.POST["img_url"])
            return JsonResponse(context)
        elif request.POST["request_type"] == "api_request":
            context = util.api_request(request.POST["rover"], request.POST["date"], request.POST["camera"])
            return JsonResponse(context)
    else:
        form = MarsImageSearch()
        context = {"title": "Search", "form": form}
        return render(request, "mars_rover/mars_images.html", context)


def usercollections(request):
    if not request.user.is_authenticated:
        return redirect("signin")

    if request.method == "POST":
        if request.POST["request_type"] == "new":
            context = util.create_new_collection(request.user, request.POST["name"], request.POST["description"])
            return JsonResponse(context)
        elif request.POST["request_type"] == "delete":
            context = util.delete_collection(request.POST["col_to_del"])
            return JsonResponse(context)
        elif request.POST["request_type"] == "load_more":
            context = util.load_more_collections(request.user, int(request.POST["offset"]))
            return JsonResponse(context)
    else:
        context = util.load_collections(request.user)
        return render(request, "mars_rover/usercollections.html", context)


def edit(request, collectionID):
    if not request.user.is_authenticated:
        return redirect("signin")

    if request.method == "POST":
        if request.POST["request_type"] == "title":
            context = util.update_title(collectionID, request.POST["title"])
            return JsonResponse(context)
        elif request.POST["request_type"] == "desc":
            context = util.update_desc(collectionID, request.POST["desc"])
            return JsonResponse(context)
        elif request.POST["request_type"] == "toggle_share":
            context = util.toggle_share(collectionID)
            return JsonResponse(context)
        elif request.POST["request_type"] == "change_thumb":
            context = util.change_thumb(collectionID, request.POST["url"])
            return JsonResponse(context)
        elif request.POST["request_type"] == "url_delete":
            context = util.url_delete(collectionID, request.POST["url_id"])
            return JsonResponse(context)
        elif request.POST["request_type"] == "save_order":
            context = util.save_order(collectionID, request.POST["new_col_order"])
            return JsonResponse(context)
    else:
        collection = Collection.objects.get(id=collectionID)
        if collection is None:
            raise Http404(f"The collection you are trying to edit does not exist.")
        else:
            context = {"title": "Edit Collection", "collection": collection}
            return render (request, "mars_rover/edit.html", context)


def sharedcollections(request):
    if not request.user.is_authenticated:
        return redirect("signin")

    if request.method == "POST":
        if request.POST["request_type"] == "load_more_results":
            context = util.load_more_results(int(request.POST["offset"]),request.POST["search_query"],
                                             request.POST["search_popular"])
            return JsonResponse(context)
        elif request.POST["request_type"] == "load_popular":
            initial_load = False
            context = util.load_popular_results(initial_load)
            return JsonResponse(context)
        elif request.POST["request_type"] == "load_results":
            context = util.load_results(request.POST["search_query"])
            return JsonResponse(context)
    else:
        initial_load = True
        context = util.load_popular_results(initial_load)
        return render (request, "mars_rover/sharedcollections.html", context)

def view_sharedcollection(request, collectionID):
    if not request.user.is_authenticated:
        return redirect("signin")

    if request.method == "POST":
        if request.POST["request_type"] == "like":
            context = util.like_collection(request.user, collectionID)
            return JsonResponse(context)
    else:
        shared_info = Shared_Collection.objects.get(collection__id=collectionID)
        col_urls = Col_Url.objects.filter(collection__id=collectionID).order_by("url_order")
        if shared_info.collection is None:
            raise Http404(f"The collection you are trying to view does not exist.")
        else:
            shared_info.views += 1
            shared_info.save()
            liked = shared_info.liked_by.filter(username=request.user.username).exists()
            context = {"title": "View Collection", "shared_info": shared_info, "liked": liked, "col_urls": col_urls}
            return render(request, "mars_rover/view_sharedcollection.html", context)