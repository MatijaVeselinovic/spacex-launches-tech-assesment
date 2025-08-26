import { ComponentProps } from "react";

export default function Button(props: ComponentProps<"button">) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`px-2 py-2 rounded-lg border shadow-sm hover:shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
    />
  );
}
