import React, { useState } from "react";
import BottomTabs from "./src/navigation/BottomTabs";
import SplashScreen from "./src/SplashScreen";

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return <BottomTabs />;
};

export default App;
