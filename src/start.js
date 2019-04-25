import React from "react";
import ReactDOM from "react-dom";

import Welcome from "./welcome";

let elem;

if (location.pathname == "/welcome") {
    console.log("do something");
    elem = <Welcome />;
} else {
    console.log("do something else");
    elem = <img className="logo" src="/tabasco.jpg" />;
}

ReactDOM.render(elem, document.querySelector("main"));
