import { DetailedHTMLProps, FC, InputHTMLAttributes, ReactElement, useState } from "react";
import clsx from "clsx";

import IconEyeClose from "@/assets/icons/eye.close.svg";
import IconEyeOpen from "@/assets/icons/eye.open.svg";

interface Props
  extends DetailedHTMLProps<
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      | "placeholder"
      | "className"
      | "type"
      | "autoFocus"
      | "id"
      | "value"
      | "name"
      | "required"
      | "readOnly"
      | "onChange"
      | "onBlur"
      | "pattern"
      | "disabled"
      | "minLength"
      | "spellCheck"
      | "autoComplete"
      | "onKeyDown"
    >,
    HTMLInputElement
  > {
  prefix?: string | ReactElement;
  ref?: any;
}

const Input: FC<Props> = ({ type = "text", prefix = "", className = "", ...rest }) => {
  const [inputType, setInputType] = useState(type);
  const togglePasswordVisible = () => {
    setInputType((prev) => (prev == "password" ? "text" : "password"));
  };

  const isLarge = className.includes("large");
  const isNone = className.includes("none");
  const isPwd = type == "password";
  const inputClass = clsx(
    `w-full text-sm text-foreground p-2 outline-none
    bg-inherit
    disabled:text-muted-foreground disabled:bg-muted
    dark:disabled:bg-card/50
    dark:disabled:border-border
    placeholder:text-muted-foreground`,
    isLarge && "py-3",
    isNone && "!border-none bg-transparent shadow-none",
    isPwd && "pr-[30px]"
  );
  return type == "password" ? (
    <div
      className={`w-full relative flex overflow-hidden rounded border border-solid border-border shadow-sm ${className}`}
    >
      <input
        type={inputType}
        autoComplete={rest.autoComplete ?? (inputType == "password" ? "current-password" : "on")}
        className={`${inputClass} ${className}`}
        {...rest}
      />
      <div
        className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer"
        onClick={togglePasswordVisible}
      >
        {inputType == "password" ? (
          <IconEyeClose className="fill-muted-foreground" />
        ) : (
          <IconEyeOpen className="fill-muted-foreground" />
        )}
      </div>
    </div>
  ) : prefix ? (
    <div
      className={`w-full relative flex overflow-hidden rounded border border-solid border-border shadow-sm bg-background ${className}`}
    >
      {typeof prefix === "string" ? (
        <span className="px-4 py-2 text-sm text-muted-foreground bg-muted shadow-[rgb(0_0_0_/_10%)_-1px_0px_0px_inset]">
          {prefix}
        </span>
      ) : (
        <span className="flex-center p-2 bg-transparent">{prefix}</span>
      )}
      <input className={`${inputClass} ${className}`} type={type} {...rest} />
    </div>
  ) : (
    <input
      type={inputType}
      className={`${inputClass} rounded border border-solid border-border shadow-sm ${className}`}
      {...rest}
    />
  );
};

export default Input;
