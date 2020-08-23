from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.db import models

class Register(UserCreationForm):
    email = models.EmailField()
    first_name = models.CharField(max_length=32)
    last_name = models.CharField(max_length=32)

    class Meta:
        model = User
        fields = ["username","first_name","last_name","email","password1","password2"]

class MarsImageSearch(forms.Form):
    rover_camera_choices =[
        ('Curiosity', (
            ('FHAZ', 'Front Hazard Avoidance Camera'),
            ('RHAZ', 'Rear Hazard Avoidance Camera'),
            ('MAST', 'Mast Camera'),
            ('CHEMCAM', 'Chemistry and Camera Complex'),
            ('MAHLI', 'Mars Hand Lens Imager'),
            ('MARDI', 'Mars Descent Imager'),
            ('NAVCAM', 'Navigation Camera')
        )),
        ('Opportunity', (
            ('FHAZ', 'Front Hazard Avoidance Camera'),
            ('RHAZ', 'Rear Hazard Avoidance Camera'),
            ('NAVCAM', 'Navigation Camera'),
            ('PANCAM', 'Panoramic Camera'),
            ('MINITES', 'Miniature Thermal Emission Spectrometer (Mini-TES)')
        )),
        ('Spirit', (
            ('FHAZ', 'Front Hazard Avoidance Camera'),
            ('RHAZ', 'Rear Hazard Avoidance Camera'),
            ('NAVCAM', 'Navigation Camera'),
            ('PANCAM', 'Panoramic Camera'),
            ('MINITES', 'Miniature Thermal Emission Spectrometer (Mini-TES)')
        )),
    ]

    rover_camera = forms.ChoiceField(choices=rover_camera_choices, label="Rover / Camera")
    date = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}))
