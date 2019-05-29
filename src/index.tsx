import * as React from "react";
import { render } from "react-dom";
import { useEmotion } from "./useEmotion";
import { useEmotion as useEmotion2 } from "./useEmotionFN";
import { ThemeContext } from "./Context";
import { renderToString } from "react-dom/server";
import randomColor from "randomcolor";
import styled from "./styled";

import "./styles.css";

interface ThemeProviderProps {
  theme: Record<string, any>;
  children?: React.ReactNode;
}

const useRandomColor = (initialColor = "blue") => {
  const [color, setColor] = React.useState(initialColor);

  return { color, updateColor: () => setColor(randomColor() as string) };
};

export const ThemeProvider = ({ theme, children }: ThemeProviderProps) => (
  <ThemeContext.Provider value={theme}>
    <>{children}</>
  </ThemeContext.Provider>
);

const StyledDiv = styled("div")({
  color: "red",
  borderColor: randomColor(),
  borderStyle: "solid",
  borderWidth: "2px"
});

const BaseHooks = ({ styles }: { styles: React.CSSProperties }) => {
  const { css, cx, theme, withSSr } = useEmotion();
  const [color, setColor] = React.useState("black");

  const className = css(
    {
      color: (theme && theme.color) || "red",
      borderColor: color,
      borderStyle: "solid",
      borderWidth: "2px"
    },
    styles
  );
  return (
    <div>
      <button onClick={() => setColor(randomColor)}>Change Border</button>
      <h2 className={className}>HOOK EM UPPP</h2>
      {withSSr(<h2 className={className}>Test</h2>)}
    </div>
  );
};
const BaseHooks2 = ({ styles }: { styles: React.CSSProperties }) => {
  const { css, cx, theme, withSSr } = useEmotion2();
  const [color, setColor] = React.useState("black");

  const className = css({ styles, theme }, ({ styles: s, theme: t }) => ({
    color: (t && t.color) || "red",
    borderColor: color,
    borderStyle: "solid",
    borderWidth: "2px",
    ...s
  }));
  return (
    <div>
      <button onClick={() => setColor(randomColor)}>Change Border</button>
      <h2 className={className}>HOOK EM UPPP</h2>
      {withSSr(<h2 className={className}>Test</h2>)}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider theme={{ color: "pink" }}>
      <div className="App">
        <BaseHooks styles={{ backgroundColor: "blue" }} />

        <BaseHooks2 styles={{ backgroundColor: "blue" }} />
      </div>
      <StyledDiv> Styled Div</StyledDiv>
    </ThemeProvider>
  );
}

// let html = renderToString(<App />);

// console.log(html);
const rootElement = document.getElementById("root");
render(<App />, rootElement);
