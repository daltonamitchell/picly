# PICLY

**Paint with HTML Canvas**

## About This App

This app was built in about a week for a code challenge. The basic task was to build an SPA which allowed user to upload an image, draw or write messages in a variety of colors and then submit that image to an online gallery of sorts. For this first implementaion I tried to focus on those *must-have* features that would really make the drawing experience fun and creative.

**Running This App**

An online demo of this app is currently running at [picly2.herokuapp.com](https://picly2.herokuapp.com). If you'd like to run the app locally, simply clone or download this repository. You'll a web server environment running PHP but no databases are needed.

## Choices and Assumptions

**Drawing**

Simplicity was my focus when building this app. I wanted it to be as simple as possible to start drawing. I kept the controls to a minimun and you'll notice that most of the options are related to customizing the drawing tool. I wanted it to be easy to import an image to work with to I used the built-in functionality of the HTML *file input*. However, by hiding the input and binding the functionality to a button click, I think I came up with a solution that plays well with the browser but feels more like a desktop or mobile application. Wherever possible I tried to use the browsers natural built-in functionality and style things appropriately afterwawards.

**The Gallery**

I had to make some compromises here. Ideally I would have liked to have built this as an Ember app because I'm very familiar with the framework and it's way of doing things. But it also would have made creating the gallery portion much easier and would have easily allowed for many more features, such as a social component where users could *heart* other users post, link to Twitter accounts and all the other usual things we've come to expect. The code used for mobile compatiblility to a little longer than I expected but my first task for v2 will be to convert this to an Ember app. 

## TODO / Plans For The Next Sprint

**Better Mobile Support**

I used Chrome dev tools along the way to test mobile performance but, after testing on a few *real* devices, I've notice the mobile experience is still lacking the polish of the desktop. I'd like to sit down and plot the **best** way to implement these features on mobile and then make some compromises with the desktop since it's typically more forgiving.

**Better Data Storage**

I really wanted to write my own API but ran out of time. It would be really great to tie into other social media services so users could easily share their creations and I think a more stable storage solution, combined with a frontend framework that can work with robust data, would really add the finish this app is currently missing. I originally went with a hosted CouchDB solution because it gave me the added bonus of having the API already built. I still think NoSQL's a good option for this app but I'd like to host it myself and have more control over it's setup and reliability.

**Visual Design**

I think the design of the drawing screen came out well unfortunately I feel like I left the gallery design until the last minute and it still feels unfinished. I'd like to come up with a consistent visual style for the entire app so that everything feels like one consistent experience.

## Final Thoughts

This was a really fun project! I don't do fun/game style apps like this ever and it was nice to think about a fun experience, rather than just data for a change. Please let me know if you have any questions, criticisms or ways I could improve.

Cheers,

Dalton
