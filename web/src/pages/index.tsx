import Head from "next/head";
import { Inter } from "next/font/google";
import Table from "react-bootstrap/Table";
import { Alert, Container, Pagination } from "react-bootstrap";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import {useMemo, useState} from "react";

const inter = Inter({ subsets: ["latin"] });

type TUserItem = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  updatedAt: string;
};

type TGetServerSideProps = {
  statusCode: number;
  users: TUserItem[];
};

export const getServerSideProps = (
  async (ctx: GetServerSidePropsContext): Promise<{ props: TGetServerSideProps }> => {
    try {
      const res = await fetch("http://localhost:3000/users", { method: "GET" });
      if (!res.ok) {
        return { props: { statusCode: res.status, users: [] } };
      }

      return {
        props: { statusCode: 200, users: await res.json() },
      };
    } catch (e) {
      return { props: { statusCode: 500, users: [] } };
    }
  }) satisfies GetServerSideProps<TGetServerSideProps>;

export default function Home({ statusCode, users }: TGetServerSideProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(users.length / itemsPerPage);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return users.slice(startIndex, endIndex);
  }, [currentPage, users, itemsPerPage]);

  if (statusCode !== 200) {
    return <Alert variant={"danger"}>Ошибка {statusCode} при загрузке данных</Alert>;
  }

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={"mb-5"}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Дата обновления</th>
            </tr>
            </thead>
            <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td>{user.updatedAt}</td>
              </tr>
            ))}
            </tbody>
          </Table>

          <Pagination>
            <Pagination.First disabled={currentPage === 1} onClick={() => handlePageChange(1)} />
            <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
            {Array.from({ length: Math.min(totalPages, 10) }, (_, index) => {
              const page = currentPage <= 5 ? index + 1 : currentPage - 5 + index;
              return (
                <Pagination.Item
                  key={page}
                  active={currentPage === page}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Pagination.Item>
              );
            })}
            <Pagination.Next disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} />
            <Pagination.Last disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)} />
          </Pagination>
        </Container>
      </main>
    </>
  );
}
