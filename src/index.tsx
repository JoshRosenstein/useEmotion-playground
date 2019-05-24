import * as React from "react";
import { render } from "react-dom";
import { ThemeContext, useEmotion } from "./useEmotion";
import "./styles.css";

interface ThemeProviderProps {
  theme: Record<string, any>;
  children?: React.ReactNode;
}

export const ThemeProvider = ({ theme, children }: ThemeProviderProps) => (
  <ThemeContext.Provider value={theme}>
    <>{children}</>
  </ThemeContext.Provider>
);

const BaseHooks = ({ styles }: { styles: React.CSSProperties }) => {
  const { css, cx, theme } = useEmotion();
  const className = css(
    {
      color: (theme && theme.color) || "red"
    },
    styles
  );
  return <h2 className={className}>HOOK EM UPPP</h2>;
};

function App() {
  return (
    <ThemeProvider theme={{ color: "pink" }}>
      <div className="App">
        <BaseHooks styles={{ backgroundColor: "blue" }} />
      </div>
    </ThemeProvider>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
