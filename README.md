## CS50 Final Project

## Project Description
For my final project, I have created a website that utilises the NASA Open API (Mars Rover). My web application offers the following features:
1. Registration and sign in
2. Search for photos from the Curiosity, Opportunity and Spirit rover missions
3. Create ‘collections’ that have a title, description and thumbnail
4. Add their favourite images to any of their collections
5. A collection editor that allows users to change the title, description, thumbnail, image order, view a slide show and change the shared status of a collection.
6. Search for and view shared collections from other users (users can also give ‘likes’ to other collections)
## Project Contents
- views.py – functions for rendering templates, and handling requests
- util.py – functions that handle the majority of server-side processing
- models.py – Django models representing database structure
- forms.py – slightly extended default registration form, form used to gather user information for an API request
- urls.py – routing information
- admin.py – registered models for the admin website
- templates – contains .html files for each application page
- static – contains .css for styling and animation, .js for client-side processing and an images file
## Project Justification
##### Unique:
My project serves a different purpose and offers extended or unique functionality compared to previous projects in the course.
##### Complex:
I have used the Django web-framework in Python, taking advantage of Django templating and Django models, using multiple tables with examples of foreign keys and many-to-many relations. I have also taken advantage of Django’s built in user creation and sign in forms with ‘django-crispy-forms’ styling. I have used an API, managing the sending and processing of received information. 
My html uses the Bootstrap framework, taking advantage of and extending the styling and components offered. I have also used Handlebars templating alongside JavaScript to streamline the creation of dynamic content for my application. JavaScript has also been used to make AJAX requests, manipulate dom content, such as changing element styling and attributes, and handle custom component functions. As an example, I have produced a custom slide show as I found existing solutions either did not meet my requirements or were unnecessarily complex for the scope of my application.
Finally, my web application is responsive due to the Bootstrap framework and my own custom styling; including media queries. 
*Note that my application will maintain a responsive design above resolutions of 250px wide. Resolutions below 250px wide may not display as intended.
## API Information  
I have used the NASA Open API (Mars Rover Photos). The API can be used with “DEMO_KEY” or alternatively a free key can be obtained [here](https://api.nasa.gov/)
##### API Setup Instructions:
Simply set the environment variable ‘API_KEY’ to ‘DEMO_KEY’ or a key obtained from the above link before running the Django server.
> Example in windows cmd: set API_KEY=DEMO_KEY
