import React, { useState } from "react";
import { Login } from "./Login";
import { Home } from "./Home";
import { Toaster } from "./components/ui/toaster"

function App() {
  //default should be false
  const [loggedIn, setLoggedIn] = useState(true);
  return (
    <div>
      <Toaster />
      <div>{loggedIn ? <Home setLoggedIn={setLoggedIn} loggedIn={loggedIn} /> : <Login setLoggedIn={setLoggedIn} />}</div>
    </div>
  );
}

export default App;
