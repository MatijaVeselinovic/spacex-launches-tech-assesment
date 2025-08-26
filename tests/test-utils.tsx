import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import Providers from "@/app/providers";

const All: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Providers>{children}</Providers>
);

const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: All as any, ...options });

export * from "@testing-library/react";
export { renderWithProviders as render };
