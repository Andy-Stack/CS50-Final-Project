from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Collection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=20)
    description = models.CharField(max_length=300, blank=True)
    creation_date = models.DateField(auto_now_add=True)
    likes = models.IntegerField(default=0)
    shared = models.BooleanField(default=False)
    thumbnail = models.URLField(default='https://www.belilelangtebus.com/images/foto_header/blank-thumbnail.jpg')
    urls = models.ManyToManyField('Url', through='Col_Url', related_name='collections', blank=True)

    def __str__(self):
        return (f"{self.id} - User: {self.user}, Title: {self.title}, "
                f"Created: {self.creation_date}, Likes: {self.likes}, Shared: {self.shared}")

    class Meta:
        #each collection has a unique title (per user)
        constraints = [
            models.UniqueConstraint(fields=['user', 'title'], name='unique_user_collection'),
        ]

class Url(models.Model):
    url = models.URLField()

    def __str__(self):
        return (f"{self.id} - {self.url}")

#through table that contains extra field to track url ordering in a collection
class Col_Url(models.Model):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE)
    url = models.ForeignKey(Url, on_delete=models.CASCADE)
    url_order = models.IntegerField()

    def __str__(self):
        return (f"{self.id} : {self.collection} - {self.url} - {self.url_order}")

class Shared_Collection(models.Model):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE)
    liked_by = models.ManyToManyField(User, blank=True)
    views = models.IntegerField(default=0)

    def __str__(self):
        return (f"{self.id} - {self.collection} - Liked by: {self.liked_by} - Views: {self.views}")