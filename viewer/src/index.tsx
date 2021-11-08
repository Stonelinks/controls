import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import App from "./components/App";
import rootReducer from "./redux";

// tslint:disable-next-line:no-var-requires
const { LocationProvider } = require("react-location");

const store = createStore(rootReducer, applyMiddleware(thunk));

ReactDOM.render(
  <LocationProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </LocationProvider>,
  document.getElementById("root"),
);
