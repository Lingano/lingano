# Lingano React Frontend

## Introduction

Remember: As long as there is delusion there is hope.

This is a react app (created with create-react-app). You can read more about react and get the docs [HERE](https://react.dev). I will try to simply explain which file does what and what we will do with this app.

[Create-react-app](https://create-react-app.dev) - link to create-react-app documentation and main website
## App Structure

The react app has a structure like below.

```
project-name/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── App.js
│   ├── index.js
│   └── ...
├── .gitignore
├── package.json
├── README.md
└── ...
```

## Important Files and Folders

### `public/`

- `index.html`: The main HTML file that serves as the entry point for the React app.
**Never touch, it will work correctly, the problems are with the components not with this file**

### `src/`

- `assets/`: Contains static assets like images, fonts, etc. That can be later on used in the website.
- `components/`: Contains reusable React components. **You can think of the components as ejs views. They are just pieces of code that are then rendered by the browser in a place that you call them in. They are functions of code returned from the file, every one of them can have their own css**
**The components can be refreshed and can fetch data from our api**
- `pages/`: Contains React components that represent different pages of the app. **Those are also kinda like the ejs views and components but for our internal structure we seperate the two. React router helps with switching between the pages in the url and what we have in pages folder**
- `App.js`: The root component that defines the structure of the app. **There is no need to touch that after we set up the main structure.**
- `index.js`: The entry point for the React application, where the React app is rendered to the DOM. **Here it is defined that the App component is rendered as the website, it can be changed, but probably won't be needed.**

### Root Files

- `.gitignore`: Specifies files and directories that should be ignored by Git. **Don't touch**
- `package.json`: Contains metadata about the project and lists dependencies. **Don't touch**
- `README.md`: The file you are currently reading.





