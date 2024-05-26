import { Button, Flex, Select, Stack, TextInput, Title } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

type Values = {
  nama: string;
  nip: string;
  pangkatGolongan: string;
  jenisJabatan: string;
  namaJabatan: string;
  uraianJabatan: string;
  bulan: Date;
};

export function FormDataDiri() {
  const navigate = useNavigate();

  const form = useForm<Values>({
    initialValues: {
      nama: "",
      nip: "",
      pangkatGolongan: "",
      jenisJabatan: "",
      namaJabatan: "",
      uraianJabatan: "",
      bulan: new Date(),
    },
  });

  const onSubmit = useCallback((values: Values) => {
    const formData = new FormData();
    formData.append("type", "diri");
    formData.append("nama", values.nama);
    formData.append("nip", values.nip);
    formData.append("pangkatGolongan", values.pangkatGolongan);
    formData.append("jenisJabatan", values.jenisJabatan);
    formData.append("namaJabatan", values.namaJabatan);
    formData.append("uraianJabatan", values.uraianJabatan);
    formData.append("bulan", dayjs(values.bulan).format("MMMM YYYY"));

    const id = notifications.show({
      withCloseButton: true,
      withBorder: true,
      color: "cyan",
      title: "Mengupload data!",
      message:
        "Data Anda sedang diupload ke Google Sheet. Mohon tunggu sebentar :D",
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
              "Data Anda di Google Sheet telah diubah! Silahkan cek untuk memastikan :D",
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
  }, []);

  return (
    <Flex w="100vw" h="100vh" justify="center">
      <Flex direction="column" maw="400px" w="400px" px="md" py="md">
        <Title size="h2" ta="center" mb="md">
          Ubah Data Diri
        </Title>
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack>
            <TextInput label="Nama" required {...form.getInputProps("nama")} />
            <TextInput label="NIP" required {...form.getInputProps("nip")} />
            <Select
              label="Pangkat/Golongan"
              required
              data={[
                {
                  group: "Golongan I",
                  items: [
                    "Juru Muda",
                    "Juru Muda Tingkat I",
                    "Juru",
                    "Juru Tinkat 1",
                  ],
                },
                {
                  group: "Golongan II",
                  items: [
                    "Pengatur Muda",
                    "Pengatur Muda Tingkat I",
                    "Pengatur",
                    "Pengatur Tinkat 1",
                  ],
                },
                {
                  group: "Golongan III",
                  items: [
                    "Penata Muda",
                    "Penata Muda Tingkat I",
                    "Penata",
                    "Penata Tinkat 1",
                  ],
                },
                {
                  group: "Golongan IV",
                  items: [
                    "Pembina Muda",
                    "Pembina Muda Tingkat I",
                    "Pembina",
                    "Pembina Tinkat 1",
                  ],
                },
              ]}
              {...form.getInputProps("pangkatGolongan")}
            />
            <Select
              label="Jenis Jabatan"
              required
              data={[
                "Guru",
                "Wali Kelas",
                "Ketua Jurusan",
                "Wakil Kepala Sekolah",
              ]}
              {...form.getInputProps("jenisJabatan")}
            />
            <Select
              label="Nama Jabatan"
              required
              data={["Guru Pertama", "Guru Muda", "Guru Madya", "Guru Utama"]}
              {...form.getInputProps("namaJabatan")}
            />
            <TextInput
              label="Uraian Jabatan"
              required
              {...form.getInputProps("uraianJabatan")}
            />
            <MonthPickerInput
              label="Bulan"
              required
              {...form.getInputProps("bulan")}
            />
            <Button type="submit" mt="md">
              Lanjut
            </Button>
            <Button
              color="gray"
              onClick={function () {
                navigate("/tambah");
              }}
            >
              Tambah Kegiatan
            </Button>
          </Stack>
        </form>
      </Flex>
    </Flex>
  );
}
