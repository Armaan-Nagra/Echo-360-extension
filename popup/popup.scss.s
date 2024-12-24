body {
  background-color: #2E2E2E;
  color: #eee;

  width: 12rem;
  height: 5rem;

  display: flex; 
  justify-content: center; 
  align-items: center; 
  margin-top: 1.05rem;
}


.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;

  text-align: center;
}

h3 {
  text-align: center;
}

#progress-bar {
  display: none;
  color:black;
}

@font-face {
  font-family: 'CustomFont';
  src: url('../fonts/Inter_28pt-SemiBold.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

*,
*::after,
*::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --btn-font-size: 0.8rem; // Smaller font size
  --btn-text-color: hsla(0, 0%, 100%, 1);
  --btn-outline-color: hsla(0, 0%, 100%, 0.5);
  --btn-front-bgc: hsla(0, 2.20%, 91.20%, 0.19);
  --btn-front-bgc--hover: hsla(0, 0.00%, 90.20%, 0.48);
}

button {
  display: inline;
  padding: 0;
  border: 0;
  font: inherit;
  cursor: pointer;
  background: transparent;
  color: currentColor;
  user-select: none;
  -webkit-appearance: none;
}

.btn__text{
  font-family: "CustomFont", cursive;
}

.btn {
  position: relative;
  padding: 0.5rem 1.5rem; // Smaller padding
  color: var(--btn-text-color);
  text-transform: uppercase;
  letter-spacing: 0.3em; // Tighter letter-spacing
  text-align: center;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    outline: 1px dashed var(--btn-outline-color);
    width: 100%;
    height: 100%;
    transition: 250ms all ease;
  }

  &::before {
    transform: translate(-0.5rem, -0.5rem); // Adjusted for smaller size
  }

  &::after {
    background-color: var(--btn-front-bgc);
    outline-style: solid;
  }

  &__inner::before,
  &__inner::after {
    content: "";
    border: 1px dashed var(--btn-outline-color);
    border-left: 0;
    border-right: 0;
    width: 0.5rem; // Narrower side width
    height: calc(100% + 1px);
    position: absolute;
    top: -0.25rem; // Adjusted spacing
    transform: translateX(var(--translateX, 0)) skewY(var(--skewY, 45deg));
    transition: 250ms all;
  }

  &__inner::before {
    left: -0.5rem; // Adjusted for smaller size
  }

  &__inner::after {
    left: calc(100% - 0.5rem); // Adjusted for smaller size
  }

  &__text {
    z-index: 1;
    position: relative;
    display: inline-block;
    transition: 250ms all ease;
    font-size: var(--btn-font-size);
  }
}

.btn:hover {
  &::before {
    transform: translate(0.5rem, -0.5rem); // Adjusted hover effect
  }

  &::after {
    background-color: var(--btn-front-bgc--hover);
  }

  .btn__inner::before,
  .btn__inner::after {
    --translateX: 0.5rem;
    --skewY: -45deg;
  }
}

.btn:active {
  &::after {
    transform: translate(0.25rem, -0.25rem); // Adjusted active effect
  }

  .btn__inner::before,
  .btn__inner::after {
    width: 0.3rem;
    transform: translate(1rem, calc(-0.2rem - 1px)) skewY(-45deg);
  }

  .btn__text {
    transform: translate(0.25rem, -0.25rem);
    font-size: var(--btn-font-size);
    font-family: 'CustomFont', sans-serif; // Use your custom font
  }
}