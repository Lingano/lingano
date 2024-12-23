# Project Language API backend

Quick reminder about what everything does in this backend app. It is really similar to what we did in the exercies but I will still write that down if anybody needs a remainder.

## Folder and File Structure (only important stuff)

```
/api
├── public
├── routes
├── views
├── app.js
├── package.json
```

### `/public`
This directory includes static files such as HTML, CSS, and JavaScript that are served to the client.

### `/routes`
This directory holds the route definitions for the API. Each file in this directory corresponds to a specific set of endpoints.

### `/views`
This directory contains the view templates used by the application to render HTML responses. They provide the view for backend specific documentation. 

**If you create or change a api endpoint make sure to write that down in the views/index.jade file. You should figure how pug works or copy the existing template to add a list item. If you need the pug documentation you can go [here](https://pugjs.org/api/getting-started.html)**



