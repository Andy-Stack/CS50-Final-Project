# Generated by Django 3.0.7 on 2020-07-08 00:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mars_rover', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='collection',
            name='shared',
            field=models.BooleanField(default=False),
        ),
    ]
