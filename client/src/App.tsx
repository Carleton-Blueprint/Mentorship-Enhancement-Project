import React, { useState } from "react";
import { Login } from "./Login";
import { Home } from "./Home";
import { Toaster } from "./components/ui/toaster"

function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  return (
    <div>
<<<<<<< HEAD
      <Toaster />
=======
>>>>>>> e86705c (added login card)
      <div>{loggedIn ? <Home /> : <Login />}</div>
    </div>
  );
}

export default App;
