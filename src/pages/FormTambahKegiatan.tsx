import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  FileInput,
  Flex,
  Group,
  Image as ImageMantine,
  Input,
  Modal,
  Popover,
  Stack,
  Text,
  TextInput,
  Title,
  VisuallyHidden,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure, useOs } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCamera, IconCheck, IconUpload, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Values = {
  tanggal: Date;
  namaKegiatan: string;
  jenisKegiatan: string;
  targetPembelajaran: string;
  uraianKegiatan: string;
  bukti?: File;
};

export function FormTambahKegiatan() {
  const os = useOs();

  const navigate = useNavigate();

  const form = useForm<Values>({
    initialValues: {
      tanggal: new Date(),
      namaKegiatan: "",
      jenisKegiatan: "",
      targetPembelajaran: "",
      uraianKegiatan: "",
      bukti: undefined,
    },
  });

  const onSubmit = useCallback((values: Values) => {
    if (!values.bukti) return;

    const fr = new FileReader();
    fr.onload = function () {
      if (typeof fr.result != "string") return;

      const formData = new FormData();
      formData.append("type", "tambah");
      formData.append("tanggal", dayjs(values.tanggal).format("DD MMMM YYYY"));
      formData.append("namaKegiatan", values.namaKegiatan);
      formData.append("jenisKegiatan", values.jenisKegiatan);
      formData.append("targetPembelajaran", values.targetPembelajaran);
      formData.append("uraianKegiatan", values.uraianKegiatan);
      formData.append("bukti", fr.result);

      const id = notifications.show({
        withCloseButton: true,
        withBorder: true,
        color: "cyan",
        title: "Mengupload data!",
        message:
          "Data kegiatan sedang ditambahkan ke Google Sheet. Mohon tunggu sebentar :D",
        loading: true,
        autoClose: false,
      });

      fetch(
        "https://script.google.com/macros/s/AKfycbyKRY3TZEto6apQB0NT4T_9X5XKhznok5PgBdDj6Qgg7rG2-A0hl-k-K69vEMPUm65RcA/exec",
        {
          method: "POST",
          body: formData,
        }
      )
        .then((res) => {
          if (res.status === 200) {
            notifications.update({
              id,
              withCloseButton: true,
              withBorder: true,
              color: "green",
              title: "Data berhasil diubah!",
              message:
                "Data kegiatan telah ditambahkan di Google Sheet! Silahkan cek untuk memastikan :D",
              loading: false,
              icon: <IconCheck />,
              autoClose: 3000,
            });
          } else {
            notifications.update({
              id,
              withCloseButton: true,
              withBorder: true,
              color: "red",
              title: "Data gagal diubah!",
              message: "Terjadi kesalahan pada data yang Anda inputkan",
              loading: false,
              icon: <IconX />,
              autoClose: 3000,
            });
          }
        })
        .catch((err) => {
          console.error(err);
          notifications.update({
            id,
            withCloseButton: true,
            withBorder: true,
            color: "red",
            title: "Data gagal diubah!",
            message:
              "Terjadi kesalahan pada aplikasi! Mohon laporkan kepada pihak terkait",
            loading: false,
            icon: <IconX />,
            autoClose: 3000,
          });
        });
    };
    fr.readAsDataURL(values.bukti);
  }, []);

  const buktiWithCaptureRef = useRef<HTMLButtonElement | null>(null);
  const buktiWithoutCaptureRef = useRef<HTMLButtonElement | null>(null);

  const [buktiSrc, setBuktiSrc] = useState<string | ArrayBuffer | null>(null);
  form.watch("bukti", function ({ value }) {
    if (!value) return;

    const fileReader = new FileReader();
    fileReader.onload = function () {
      setBuktiSrc(fileReader.result);
    };
    fileReader.readAsDataURL(value);
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const [
    modalAmbilGambarOpened,
    { open: openModalAmbilGambar, close: closeModalAmbilGambar },
  ] = useDisclosure(false, {
    onOpen: function () {
      if (!videoRef.current) {
        closeModalAmbilGambar();
        notifications.show({
          withCloseButton: true,
          withBorder: true,
          color: "red",
          title: "Gagal mengaktifkan kamera!",
          message:
            "Terjadi kesalahan pada aplikasi! Mohon laporkan kepada pihak terkait",
          autoClose: 3000,
        });
        return;
      }

      if (mediaStream != null) return;

      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (mediaStream) {
          setMediaStream(mediaStream);
          videoRef.current!.srcObject = mediaStream;
          videoRef.current!.play();
        })
        .catch(function (err) {
          console.error(err);
          closeModalAmbilGambar();
          notifications.show({
            withCloseButton: true,
            withBorder: true,
            color: "red",
            title: "Gagal mengaktifkan kamera!",
            message:
              "Terjadi kesalahan pada aplikasi! Mohon laporkan kepada pihak terkait",
            autoClose: 3000,
          });
        });
    },
    onClose: function () {
      if (!mediaStream || !videoRef.current) {
        notifications.show({
          withCloseButton: true,
          withBorder: true,
          color: "red",
          title: "Gagal menonaktifkan kamera!",
          message:
            "Terjadi kesalahan pada aplikasi! Mohon laporkan kepada pihak terkait",
          autoClose: 3000,
        });
        return;
      }

      if (mediaStream != null) {
        mediaStream.getTracks()[0].stop();
        videoRef.current!.load();
        setMediaStream(null);
      }
    },
  });

  const onCekrek = useCallback(
    function () {
      if (!mediaStream || !videoRef.current || !canvasRef.current) {
        closeModalAmbilGambar();
        notifications.show({
          withCloseButton: true,
          withBorder: true,
          color: "red",
          title: "Gagal mengambil gambar!",
          message:
            "Terjadi kesalahan pada aplikasi! Mohon laporkan kepada pihak terkait",
          autoClose: 3000,
        });
        return;
      }

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      const ctx = canvasRef.current.getContext("2d");
      ctx?.drawImage(videoRef.current, 0, 0, 640, 450);
      canvasRef.current.toBlob(function (blob) {
        if (!blob) {
          console.error("BLOB_NULL");
          closeModalAmbilGambar();
          notifications.show({
            withCloseButton: true,
            withBorder: true,
            color: "red",
            title: "Gagal mengambil gambar!",
            message:
              "Terjadi kesalahan pada aplikasi! Mohon laporkan kepada pihak terkait",
            autoClose: 3000,
          });
          return;
        }
        form.setFieldValue(
          "bukti",
          new File([blob], Date.now() + ".jpg", { type: "image/jpeg" })
        );
        closeModalAmbilGambar();
      });
    },
    [closeModalAmbilGambar, form, mediaStream]
  );

  return (
    <>
      <Modal
        zIndex={9999}
        opened={modalAmbilGambarOpened}
        onClose={closeModalAmbilGambar}
        title="Ambil Gambar"
        centered
        keepMounted
      >
        <Box
          component="video"
          ref={videoRef}
          w="100%"
          style={{ borderRadius: "var(--mantine-radius-md)" }}
        ></Box>
        <VisuallyHidden>
          <Box component="canvas" ref={canvasRef}></Box>
        </VisuallyHidden>
        <Button fullWidth onClick={onCekrek}>
          CEKREK
        </Button>
      </Modal>
      <Flex w="100vw" h="100vh" justify="center">
        <Flex direction="column" maw="400px" w="400px" px="md" py="md">
          <Title size="h2" ta="center" mb="md">
            Tambah Kegiatan
          </Title>
          <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack>
              <DatePickerInput
                label="Tanggal"
                required
                {...form.getInputProps("tanggal")}
              />
              <TextInput
                label="Nama Kegiatan"
                required
                {...form.getInputProps("namaKegiatan")}
              />
              <Autocomplete
                label="Jenis Kegiatan"
                required
                data={["KBM", "Non-KBM"]}
                {...form.getInputProps("jenisKegiatan")}
              />
              <TextInput
                label="Target Pembelajaran"
                required
                {...form.getInputProps("targetPembelajaran")}
              />
              <TextInput
                label="Uraian Kegiatan"
                required
                {...form.getInputProps("uraianKegiatan")}
              />
              <Input.Wrapper label="Bukti" required>
                <VisuallyHidden>
                  <FileInput
                    ref={buktiWithCaptureRef}
                    accept="image/*"
                    capture
                    {...form.getInputProps("bukti")}
                  />
                  <FileInput
                    ref={buktiWithoutCaptureRef}
                    accept="image/*"
                    {...form.getInputProps("bukti")}
                  />
                </VisuallyHidden>
                <ImageMantine
                  src={buktiSrc}
                  fallbackSrc="https://i.kym-cdn.com/entries/icons/original/000/027/081/wow.jpg"
                  radius="md"
                />
                <Popover position="top">
                  <Popover.Target>
                    <Button mt="xs" color="gray">
                      Ubah Gambar
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Group>
                      <Flex direction="column" gap="xs" align="center">
                        <ActionIcon
                          variant="filled"
                          color="gray"
                          size="5rem"
                          onClick={function () {
                            if (os == "android" || os == "ios")
                              buktiWithCaptureRef.current?.click();
                            else if (!navigator.mediaDevices)
                              notifications.show({
                                withCloseButton: true,
                                withBorder: true,
                                color: "red",
                                title: "Browser tidak mendukung WebRTC!",
                                message:
                                  "Perangkat atau Browser Anda tidak mendukung kamera WebRTC",
                                autoClose: 10000,
                              });
                            else openModalAmbilGambar();
                          }}
                        >
                          <IconCamera width="70%" height="70%" />
                        </ActionIcon>
                        <Text>Kamera</Text>
                      </Flex>
                      <Flex direction="column" gap="xs" align="center">
                        <ActionIcon
                          variant="filled"
                          color="gray"
                          size="5rem"
                          onClick={function () {
                            buktiWithoutCaptureRef.current?.click();
                          }}
                        >
                          <IconUpload width="70%" height="70%" />
                        </ActionIcon>
                        <Text>Upload</Text>
                      </Flex>
                    </Group>
                  </Popover.Dropdown>
                </Popover>
              </Input.Wrapper>
              <Button type="submit" mt="md">
                Lanjut
              </Button>
              <Button
                color="gray"
                onClick={function () {
                  navigate("/");
                }}
              >
                Ubah Data Diri
              </Button>
            </Stack>
          </form>
        </Flex>
      </Flex>
    </>
  );
}
