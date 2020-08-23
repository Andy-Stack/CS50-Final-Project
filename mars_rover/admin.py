from django.contrib import admin
from .models import Collection, Shared_Collection, Url, Col_Url

# Register your models here.
admin.site.register(Collection)
admin.site.register(Shared_Collection)
admin.site.register(Url)
admin.site.register(Col_Url)