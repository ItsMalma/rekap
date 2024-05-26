import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { FormDataDiri } from "./pages/FormDataDiri";
import { FormTambahKegiatan } from "./pages/FormTambahKegiatan";

const theme = createTheme({});

const router = createBrowserRouter([
  { index: true, Component: FormDataDiri },
  { path: "/tambah", Component: FormTambahKegiatan },
]);

export function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <RouterProvider router={router} />
    </MantineProvider>
  );
}
