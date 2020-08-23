from django.urls import path

from . import views as v #shorthand

urlpatterns = [
    path("", v.home, name="home"),
    path("signin", v.signin, name="signin"),
    path("register", v.register, name="register"),
    path("logout_view", v.logout_view, name="logout_view"),
    path("mars_images", v.mars_images, name="mars_images"),
    path("usercollections", v.usercollections, name="usercollections"),
    path("edit/<str:collectionID>", v.edit, name="edit"),
    path("sharedcollections", v.sharedcollections, name="sharedcollections"),
    path("sharedcollections/<str:collectionID>", v.view_sharedcollection, name="view_sharedcollection"),
]
