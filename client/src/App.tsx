import React, { useState } from "react";
import { Login } from "./Login";
import { Home } from "./Home";

function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  return (
    <div>
      <div>{loggedIn ? <Home /> : <Login />}</div>
    </div>
  );
}

export default App;
