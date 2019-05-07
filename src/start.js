import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import Welcome from "./welcome";
import App from "./app.js";
// import * as io from "socket.io-client";

import { createStore, applyMiddleware } from "redux";
import reduxPromise from "redux-promise";
import reducer from "./reducers";
import { composeWithDevTools } from "redux-devtools-extension";

import { init } from "./socket";

//SOCKET IO example:

// const socket = io.connect();

// socket.on("hey", data => {
//     console.log(data, "DATA SOCKET IO");
// });

export const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(reduxPromise))
);

let elem;

if (location.pathname == "/welcome") {
    elem = <Welcome />;
} else {
    elem = (
        <Provider store={store}>
            <App />
        </Provider>
    );
    init(store);
}

ReactDOM.render(elem, document.querySelector("main"));
