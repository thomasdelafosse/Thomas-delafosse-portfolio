import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "icon";
};

const BASE_BUTTON_CLASSES =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:pointer-events-none";

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  solid:
    "px-4 py-2 bg-black/80 hover:bg-black/40 text-white backdrop-blur border border-white/20",
  icon: "p-1 bg-transparent",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "solid", type = "button", className, ...rest }, ref) => {
    const classes = [BASE_BUTTON_CLASSES, VARIANT_CLASSES[variant], className]
      .filter(Boolean)
      .join(" ");
    return <button ref={ref} type={type} className={classes} {...rest} />;
  }
);

Button.displayName = "Button";

export default Button;
